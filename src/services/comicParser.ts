import JSZip from 'jszip';
import { createExtractorFromData } from 'node-unrar-js';
// @ts-ignore
import wasmUrl from 'node-unrar-js/esm/js/unrar.wasm?url';
import { ArchiveFormat, ComicMetadataInfo, ComicPage, ExtractionProgress } from '../types';

const IMAGE_REGEX = /\.(jpe?g|png|webp|avif|gif|bmp)$/i;

let wasmBinaryCache: ArrayBuffer | null = null;
async function getUnrarWasmBinary(): Promise<ArrayBuffer> {
  if (!wasmBinaryCache) {
    const res = await fetch(wasmUrl);
    if (!res.ok) {
      throw new Error(`Failed to load unrar wasm: ${res.statusText}`);
    }
    wasmBinaryCache = await res.arrayBuffer();
  }
  return wasmBinaryCache;
}

// Natural sorting for filenames (e.g. 1.jpg, 2.jpg, 10.jpg)
export function naturalSortPages<T extends { fileName: string }>(items: T[]): T[] {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return items.sort((a, b) => collator.compare(a.fileName, b.fileName));
}

// Detect archive format by filename or MIME/magic header
export function detectArchiveFormat(fileName: string): ArchiveFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.cbz') || lower.endsWith('.zip')) return 'cbz';
  if (lower.endsWith('.cbr') || lower.endsWith('.rar')) return 'cbr';
  if (lower.endsWith('.cbt') || lower.endsWith('.tar')) return 'cbt';
  return 'cbz';
}

function getMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  return 'image/jpeg';
}

// Parse ComicInfo.xml metadata if present in the archive
export function parseComicInfoXml(xmlString: string): ComicMetadataInfo {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const getText = (tag: string) => doc.querySelector(tag)?.textContent?.trim() || undefined;

    return {
      title: getText('Title'),
      series: getText('Series'),
      number: getText('Number'),
      volume: getText('Volume'),
      summary: getText('Summary'),
      notes: getText('Notes'),
      year: getText('Year'),
      month: getText('Month'),
      writer: getText('Writer'),
      penciller: getText('Penciller'),
      inker: getText('Inker'),
      colorist: getText('Colorist'),
      letterer: getText('Letterer'),
      coverArtist: getText('CoverArtist'),
      editor: getText('Editor'),
      publisher: getText('Publisher'),
      genre: getText('Genre'),
      language: getText('LanguageISO'),
    };
  } catch (err) {
    console.warn('Failed to parse ComicInfo.xml:', err);
    return {};
  }
}

export interface ExtractedArchiveResult {
  pages: ComicPage[];
  metadata?: ComicMetadataInfo;
  coverUrl: string;
}

// Extract using JSZip (Fastest for CBZ / ZIP)
async function extractWithJSZip(
  buffer: ArrayBuffer,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedArchiveResult> {
  onProgress?.({ stage: 'reading', current: 0, total: 100, message: 'Opening ZIP / CBZ archive...' });
  const zip = await JSZip.loadAsync(buffer);

  const rawEntries: { fileName: string; entry: JSZip.JSZipObject }[] = [];
  let comicInfoEntry: JSZip.JSZipObject | null = null;

  zip.forEach((relativePath, entry) => {
    // Filter out directories, macOS metadata, and hidden files
    if (entry.dir) return;
    if (relativePath.includes('__MACOSX') || relativePath.startsWith('.')) return;

    if (IMAGE_REGEX.test(relativePath)) {
      rawEntries.push({ fileName: relativePath, entry });
    } else if (relativePath.toLowerCase().endsWith('comicinfo.xml')) {
      comicInfoEntry = entry;
    }
  });

  if (rawEntries.length === 0) {
    throw new Error('No valid comic page images (JPG, PNG, WebP) found inside this archive.');
  }

  // Sort natural order
  naturalSortPages(rawEntries);

  let metadata: ComicMetadataInfo | undefined;
  if (comicInfoEntry) {
    try {
      const xmlStr = await (comicInfoEntry as JSZip.JSZipObject).async('string');
      metadata = parseComicInfoXml(xmlStr);
    } catch (e) {
      console.warn('Could not read ComicInfo.xml', e);
    }
  }

  const pages: ComicPage[] = [];
  const total = rawEntries.length;

  for (let i = 0; i < total; i++) {
    const item = rawEntries[i];
    onProgress?.({
      stage: 'extracting',
      current: i + 1,
      total,
      message: `Extracting page ${i + 1} of ${total}...`,
    });

    const mime = getMimeType(item.fileName);
    const blob = await item.entry.async('blob');
    const typedBlob = new Blob([blob], { type: mime });
    const blobUrl = URL.createObjectURL(typedBlob);

    pages.push({
      pageNumber: i + 1,
      fileName: item.fileName.split('/').pop() || item.fileName,
      blobUrl,
      mimeType: mime,
      size: typedBlob.size,
    });
  }

  const coverUrl = pages.length > 0 ? pages[0].blobUrl : '';

  onProgress?.({ stage: 'complete', current: total, total, message: 'Comic loaded successfully!' });

  return { pages, metadata, coverUrl };
}

// Extract using node-unrar-js (for CBR / RAR)
async function extractWithNodeUnrar(
  buffer: ArrayBuffer,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedArchiveResult> {
  onProgress?.({ stage: 'reading', current: 0, total: 100, message: 'Initializing RAR engine...' });
  const wasmBinary = await getUnrarWasmBinary();
  onProgress?.({ stage: 'extracting', current: 20, total: 100, message: 'Decompressing CBR archive...' });

  const extractor = await createExtractorFromData({
    data: buffer,
    wasmBinary,
  });

  const extracted = extractor.extract();
  const rawFiles: { fileName: string; data: Uint8Array }[] = [];
  let comicInfoData: Uint8Array | null = null;

  for (const file of extracted.files) {
    if (file.fileHeader.flags.directory) continue;
    const fn = file.fileHeader.name;
    if (fn.includes('__MACOSX') || fn.startsWith('.')) continue;

    if (file.extraction) {
      if (IMAGE_REGEX.test(fn)) {
        rawFiles.push({ fileName: fn, data: file.extraction });
      } else if (fn.toLowerCase().endsWith('comicinfo.xml')) {
        comicInfoData = file.extraction;
      }
    }
  }

  if (rawFiles.length === 0) {
    throw new Error('No valid comic page images found in CBR/RAR archive.');
  }

  naturalSortPages(rawFiles);

  let metadata: ComicMetadataInfo | undefined;
  if (comicInfoData) {
    try {
      const decoder = new TextDecoder('utf-8');
      const xmlStr = decoder.decode(comicInfoData);
      metadata = parseComicInfoXml(xmlStr);
    } catch (err) {
      console.warn('Error decoding ComicInfo.xml from CBR:', err);
    }
  }

  const pages: ComicPage[] = rawFiles.map((item, idx) => {
    const mime = getMimeType(item.fileName);
    const blob = new Blob([item.data], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    return {
      pageNumber: idx + 1,
      fileName: item.fileName.split(/[\\/]/).pop() || item.fileName,
      blobUrl,
      mimeType: mime,
      size: blob.size,
    };
  });

  const coverUrl = pages[0]?.blobUrl || '';
  onProgress?.({ stage: 'complete', current: pages.length, total: pages.length, message: 'Comic loaded!' });

  return { pages, metadata, coverUrl };
}

// Extract uncompressed TAR / CBT archives
function extractWithTar(
  buffer: ArrayBuffer,
  onProgress?: (progress: ExtractionProgress) => void
): ExtractedArchiveResult {
  onProgress?.({ stage: 'reading', current: 0, total: 100, message: 'Reading CBT archive...' });
  const rawFiles: { fileName: string; data: Uint8Array }[] = [];
  let comicInfoData: Uint8Array | null = null;

  const bytes = new Uint8Array(buffer);
  let offset = 0;
  const decoder = new TextDecoder('utf-8');

  while (offset + 512 <= bytes.length) {
    if (bytes[offset] === 0 && bytes[offset + 1] === 0) break;

    let fn = '';
    for (let i = 0; i < 100; i++) {
      if (bytes[offset + i] === 0) break;
      fn += String.fromCharCode(bytes[offset + i]);
    }

    let sizeStr = '';
    for (let i = 124; i < 136; i++) {
      if (bytes[offset + i] === 0 || bytes[offset + i] === 32) continue;
      sizeStr += String.fromCharCode(bytes[offset + i]);
    }
    const fileSize = parseInt(sizeStr, 8) || 0;

    offset += 512;
    if (fileSize > 0 && offset + fileSize <= bytes.length) {
      if (!fn.includes('__MACOSX') && !fn.startsWith('.')) {
        const fileData = bytes.subarray(offset, offset + fileSize);
        if (IMAGE_REGEX.test(fn)) {
          rawFiles.push({ fileName: fn, data: fileData });
        } else if (fn.toLowerCase().endsWith('comicinfo.xml')) {
          comicInfoData = fileData;
        }
      }
    }

    offset += Math.ceil(fileSize / 512) * 512;
  }

  if (rawFiles.length === 0) {
    throw new Error('No valid comic page images found in TAR/CBT archive.');
  }

  naturalSortPages(rawFiles);

  let metadata: ComicMetadataInfo | undefined;
  if (comicInfoData) {
    try {
      const xmlStr = decoder.decode(comicInfoData);
      metadata = parseComicInfoXml(xmlStr);
    } catch (err) {
      console.warn('Error decoding ComicInfo.xml from CBT:', err);
    }
  }

  const pages: ComicPage[] = rawFiles.map((item, idx) => {
    const mime = getMimeType(item.fileName);
    const blob = new Blob([item.data], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    return {
      pageNumber: idx + 1,
      fileName: item.fileName.split(/[\\/]/).pop() || item.fileName,
      blobUrl,
      mimeType: mime,
      size: blob.size,
    };
  });

  const coverUrl = pages[0]?.blobUrl || '';
  onProgress?.({ stage: 'complete', current: pages.length, total: pages.length, message: 'Comic loaded!' });

  return { pages, metadata, coverUrl };
}

// Universal extractor for any CBR/CBZ/ZIP/RAR/TAR file
export async function extractComicArchive(
  fileOrBuffer: File | ArrayBuffer,
  fileName: string,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedArchiveResult> {
  const buffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
  const format = detectArchiveFormat(fileName);

  // Check magic bytes to confirm ZIP vs RAR
  const view = new Uint8Array(buffer, 0, Math.min(10, buffer.byteLength));
  const isZip = view[0] === 0x50 && view[1] === 0x4b; // 'PK'
  const isRar = view[0] === 0x52 && view[1] === 0x61 && view[2] === 0x72 && view[3] === 0x21; // 'Rar!'

  if (isZip || format === 'cbz') {
    try {
      return await extractWithJSZip(buffer, onProgress);
    } catch (zipErr) {
      console.warn('JSZip extraction failed, attempting RAR/TAR fallback:', zipErr);
      try {
        return await extractWithNodeUnrar(buffer, onProgress);
      } catch {
        return extractWithTar(buffer, onProgress);
      }
    }
  } else if (isRar || format === 'cbr') {
    return await extractWithNodeUnrar(buffer, onProgress);
  } else if (format === 'cbt') {
    return extractWithTar(buffer, onProgress);
  } else {
    // Try ZIP first, then RAR, then TAR
    try {
      return await extractWithJSZip(buffer, onProgress);
    } catch {
      try {
        return await extractWithNodeUnrar(buffer, onProgress);
      } catch {
        return extractWithTar(buffer, onProgress);
      }
    }
  }
}

// Process direct image files or folder drag-and-drop
export async function processDirectImageFiles(
  files: File[],
  collectionName: string = 'Imported Comic'
): Promise<ExtractedArchiveResult> {
  const validFiles = files.filter((f) => IMAGE_REGEX.test(f.name));
  if (validFiles.length === 0) {
    throw new Error('No supported image files (JPG, PNG, WebP) were selected.');
  }

  // Sort natural order by filename
  const sorted = naturalSortPages(
    validFiles.map((f) => ({
      fileName: f.webkitRelativePath || f.name,
      file: f,
    }))
  );

  const pages: ComicPage[] = sorted.map((item, idx) => {
    const blobUrl = URL.createObjectURL(item.file);
    return {
      pageNumber: idx + 1,
      fileName: item.file.name,
      blobUrl,
      mimeType: item.file.type || getMimeType(item.file.name),
      size: item.file.size,
    };
  });

  return {
    pages,
    coverUrl: pages[0].blobUrl,
    metadata: {
      title: collectionName,
      pageCount: pages.length,
    },
  };
}

// Convert an object URL or canvas to base64 DataURL for lightweight cover storage in IndexedDB
export async function createThumbnailDataUrl(blobUrl: string, maxDim: number = 320): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(blobUrl);
        }
      } catch {
        resolve(blobUrl);
      }
    };
    img.onerror = () => resolve(blobUrl);
    img.src = blobUrl;
  });
}
