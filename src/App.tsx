import React, { useState, useEffect, useCallback } from 'react';
import { ComicBook, ComicPage, ExtractionProgress, ReadingSettings } from './types';
import {
  DEFAULT_SETTINGS,
  getAllBooks,
  saveBook,
  deleteBook,
  saveSettings,
  loadSettings,
  saveBookArchive,
  getBookArchive,
} from './services/storage';
import {
  extractComicArchive,
  processDirectImageFiles,
  createThumbnailDataUrl,
  detectArchiveFormat,
} from './services/comicParser';
import {
  SAMPLE_COMIC_BOOKS,
  getCyberGuardianPages,
  getCosmicVoyagePages,
} from './data/sampleComics';
import { LibraryView } from './components/LibraryView';
import { ReaderView } from './components/ReaderView';

export default function App() {
  const [books, setBooks] = useState<ComicBook[]>([]);
  const [currentBook, setCurrentBook] = useState<ComicBook | null>(null);
  const [currentPages, setCurrentPages] = useState<ComicPage[]>([]);
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-memory cache for extracted pages of active session
  const pagesCacheRef = React.useRef<Map<string, ComicPage[]>>(new Map());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load: fetch settings and saved books
  useEffect(() => {
    async function init() {
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings);

      const savedBooks = await getAllBooks();
      if (savedBooks.length > 0) {
        setBooks(savedBooks);
      } else {
        // First run: seed sample comics
        const sample1Pages = getCyberGuardianPages();
        const sample2Pages = getCosmicVoyagePages();

        pagesCacheRef.current.set(SAMPLE_COMIC_BOOKS[0].id, sample1Pages);
        pagesCacheRef.current.set(SAMPLE_COMIC_BOOKS[1].id, sample2Pages);

        const s1Cover = await createThumbnailDataUrl(sample1Pages[0].blobUrl);
        const s2Cover = await createThumbnailDataUrl(sample2Pages[0].blobUrl);

        const initialBooks: ComicBook[] = [
          { ...SAMPLE_COMIC_BOOKS[0], coverUrl: s1Cover },
          { ...SAMPLE_COMIC_BOOKS[1], coverUrl: s2Cover },
        ];

        for (const b of initialBooks) {
          await saveBook(b);
        }
        setBooks(initialBooks);
      }
    }
    init();
  }, []);

  // Update and persist settings
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<ReadingSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        saveSettings(updated);
        return updated;
      });
    },
    []
  );

  // Update reading progress
  const handleUpdateProgress = useCallback(
    async (currentPage: number, isFinished: boolean) => {
      if (!currentBook) return;

      const updatedBook: ComicBook = {
        ...currentBook,
        currentPage,
        isFinished,
        lastRead: Date.now(),
      };

      setCurrentBook(updatedBook);
      setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
      await saveBook(updatedBook);
    },
    [currentBook]
  );

  // Update book metadata / bookmarks
  const handleUpdateBook = useCallback(
    async (updatedBook: ComicBook) => {
      setCurrentBook(updatedBook);
      setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
      await saveBook(updatedBook);
    },
    []
  );

  // Open a comic book
  const handleOpenBook = async (book: ComicBook) => {
    // 1. Check if pages are already in memory
    const cached = pagesCacheRef.current.get(book.id);
    if (cached && cached.length > 0) {
      setCurrentBook(book);
      setCurrentPages(cached);
      return;
    }

    // 2. If it's a sample comic, generate the vector pages
    if (book.id === 'sample-cyber-guardian-01') {
      const p = getCyberGuardianPages();
      pagesCacheRef.current.set(book.id, p);
      setCurrentBook(book);
      setCurrentPages(p);
      return;
    } else if (book.id === 'sample-cosmic-voyage-01') {
      const p = getCosmicVoyagePages();
      pagesCacheRef.current.set(book.id, p);
      setCurrentBook(book);
      setCurrentPages(p);
      return;
    }

    // 3. Try to load from IndexedDB cached archive
    setExtractionProgress({
      stage: 'reading',
      current: 0,
      total: 100,
      message: 'Loading saved comic file...',
    });

    try {
      const archiveBuffer = await getBookArchive(book.id);
      if (archiveBuffer) {
        const result = await extractComicArchive(archiveBuffer, book.fileName, setExtractionProgress);
        pagesCacheRef.current.set(book.id, result.pages);
        setCurrentBook(book);
        setCurrentPages(result.pages);
      } else {
        showToast(`Please re-select "${book.fileName}" from your files to read.`);
      }
    } catch (err: any) {
      console.error('Failed to open archive:', err);
      showToast(`Could not open comic: ${err.message || 'Unknown error'}`);
    } finally {
      setExtractionProgress(null);
    }
  };

  // Import local CBR / CBZ / ZIP / RAR files
  const handleImportFiles = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    // Check if the user selected multiple loose images instead of an archive
    const isImageCollection = files.every((f) => /\.(jpe?g|png|webp|avif|gif|bmp)$/i.test(f.name));
    if (isImageCollection && files.length > 1) {
      try {
        setExtractionProgress({
          stage: 'reading',
          current: 0,
          total: files.length,
          message: 'Processing comic images...',
        });
        const result = await processDirectImageFiles(files, 'Custom Image Comic');
        const coverDataUrl = await createThumbnailDataUrl(result.coverUrl);

        const newBook: ComicBook = {
          id: 'book_' + Date.now(),
          title: 'Custom Image Comic',
          fileName: `${files.length} images`,
          fileSize: files.reduce((acc, f) => acc + f.size, 0),
          format: 'folder',
          pageCount: result.pages.length,
          coverUrl: coverDataUrl,
          currentPage: 1,
          lastRead: Date.now(),
          addedAt: Date.now(),
          isFinished: false,
          bookmarks: [],
        };

        pagesCacheRef.current.set(newBook.id, result.pages);
        await saveBook(newBook);
        setBooks((prev) => [newBook, ...prev]);
        setCurrentBook(newBook);
        setCurrentPages(result.pages);
        showToast('Imported comic images successfully!');
      } catch (e: any) {
        showToast(e.message || 'Failed to process images');
      } finally {
        setExtractionProgress(null);
      }
      return;
    }

    // Process each archive file
    for (const file of files) {
      setExtractionProgress({
        stage: 'reading',
        current: 0,
        total: 100,
        message: `Extracting ${file.name}...`,
      });

      try {
        const buffer = await file.arrayBuffer();
        const result = await extractComicArchive(buffer, file.name, setExtractionProgress);

        const coverDataUrl = await createThumbnailDataUrl(result.coverUrl);
        const format = detectArchiveFormat(file.name);
        const cleanTitle =
          result.metadata?.title ||
          file.name.replace(/\.(cbr|cbz|zip|rar|tar|cbt)$/i, '').replace(/[-_]/g, ' ');

        const newBook: ComicBook = {
          id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          title: cleanTitle,
          fileName: file.name,
          fileSize: file.size,
          format,
          pageCount: result.pages.length,
          coverUrl: coverDataUrl,
          currentPage: 1,
          lastRead: Date.now(),
          addedAt: Date.now(),
          isFinished: false,
          bookmarks: [],
          metadata: result.metadata,
        };

        // Cache extracted pages in memory
        pagesCacheRef.current.set(newBook.id, result.pages);

        // Cache raw archive in IndexedDB for persistent reload
        await saveBookArchive(newBook.id, buffer);
        await saveBook(newBook);

        setBooks((prev) => [newBook, ...prev.filter((b) => b.fileName !== newBook.fileName)]);

        // If only 1 file was imported, open it directly in Reader
        if (files.length === 1) {
          setCurrentBook(newBook);
          setCurrentPages(result.pages);
        }

        showToast(`Loaded "${cleanTitle}" (${result.pages.length} pages)`);
      } catch (err: any) {
        console.error('Import error for file', file.name, err);
        showToast(`Failed to parse "${file.name}": ${err.message || 'Invalid format'}`);
      } finally {
        setExtractionProgress(null);
      }
    }
  };

  // Import folder of images
  const handleImportFolder = async (filesList: FileList) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    try {
      setExtractionProgress({
        stage: 'reading',
        current: 0,
        total: files.length,
        message: 'Reading folder contents...',
      });

      const folderName =
        files[0]?.webkitRelativePath?.split('/')[0] || 'Imported Comic Folder';

      const result = await processDirectImageFiles(files, folderName);
      const coverDataUrl = await createThumbnailDataUrl(result.coverUrl);

      const newBook: ComicBook = {
        id: 'book_' + Date.now(),
        title: folderName,
        fileName: folderName,
        fileSize: files.reduce((acc, f) => acc + f.size, 0),
        format: 'folder',
        pageCount: result.pages.length,
        coverUrl: coverDataUrl,
        currentPage: 1,
        lastRead: Date.now(),
        addedAt: Date.now(),
        isFinished: false,
        bookmarks: [],
      };

      pagesCacheRef.current.set(newBook.id, result.pages);
      await saveBook(newBook);
      setBooks((prev) => [newBook, ...prev]);
      setCurrentBook(newBook);
      setCurrentPages(result.pages);
      showToast(`Imported folder "${folderName}" (${result.pages.length} pages)`);
    } catch (e: any) {
      showToast(e.message || 'Failed to import folder');
    } finally {
      setExtractionProgress(null);
    }
  };

  // Delete a comic from the library
  const handleDeleteBook = async (id: string) => {
    pagesCacheRef.current.delete(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    await deleteBook(id);
    showToast('Comic removed from library');
  };

  // Toggle finished status
  const handleToggleFinished = async (id: string) => {
    const target = books.find((b) => b.id === id);
    if (!target) return;
    const updated = { ...target, isFinished: !target.isFinished };
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    await saveBook(updated);
  };

  // Quick load sample comic
  const handleLoadSample = (sampleId: string) => {
    const sample = books.find((b) => b.id === sampleId);
    if (sample) {
      handleOpenBook(sample);
    } else {
      if (sampleId === 'sample-cyber-guardian-01') {
        const p = getCyberGuardianPages();
        pagesCacheRef.current.set(sampleId, p);
        setCurrentBook(SAMPLE_COMIC_BOOKS[0]);
        setCurrentPages(p);
      } else {
        const p = getCosmicVoyagePages();
        pagesCacheRef.current.set(sampleId, p);
        setCurrentBook(SAMPLE_COMIC_BOOKS[1]);
        setCurrentPages(p);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans select-none selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-[#333] bg-[#111]/95 px-4 py-2.5 text-xs font-medium text-[#e0e0e0] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {currentBook && currentPages.length > 0 ? (
        <ReaderView
          book={currentBook}
          pages={currentPages}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onUpdateProgress={handleUpdateProgress}
          onUpdateBook={handleUpdateBook}
          onBackToLibrary={() => {
            setCurrentBook(null);
            setCurrentPages([]);
          }}
        />
      ) : (
        <LibraryView
          books={books}
          onOpenBook={handleOpenBook}
          onImportFiles={handleImportFiles}
          onImportFolder={handleImportFolder}
          onDeleteBook={handleDeleteBook}
          onToggleFinished={handleToggleFinished}
          onLoadSample={handleLoadSample}
          extractionProgress={extractionProgress}
        />
      )}
    </div>
  );
}
