export type ArchiveFormat = 'cbz' | 'cbr' | 'zip' | 'rar' | 'tar' | 'cbt' | 'folder' | 'sample';

export interface ComicPage {
  pageNumber: number;
  fileName: string;
  blobUrl: string;
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;
}

export interface ComicBookmark {
  id: string;
  pageNumber: number;
  timestamp: number;
  note?: string;
  thumbnailUrl?: string;
}

export interface ComicMetadataInfo {
  title?: string;
  series?: string;
  number?: string;
  volume?: string;
  summary?: string;
  notes?: string;
  year?: string;
  month?: string;
  writer?: string;
  penciller?: string;
  inker?: string;
  colorist?: string;
  letterer?: string;
  coverArtist?: string;
  editor?: string;
  publisher?: string;
  genre?: string;
  pageCount?: number;
  language?: string;
}

export interface ComicBook {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  format: ArchiveFormat;
  pageCount: number;
  coverUrl: string;
  currentPage: number;
  lastRead: number;
  addedAt: number;
  isFinished: boolean;
  bookmarks: ComicBookmark[];
  rating?: number;
  tags?: string[];
  metadata?: ComicMetadataInfo;
  rawBufferKey?: string; // key in IndexedDB for cached buffer
}

export type ViewMode = 'single' | 'double' | 'webtoon';
export type FitMode = 'fit-height' | 'fit-width' | 'fit-screen' | 'original';
export type ReadingDirection = 'ltr' | 'rtl'; // Left-to-Right or Right-to-Left (Manga)
export type ReadingTheme = 'dark' | 'sepia' | 'black' | 'light';

export interface ReadingSettings {
  viewMode: ViewMode;
  fitMode: FitMode;
  readingDirection: ReadingDirection;
  doublePageOffset: boolean; // First page is standalone cover
  theme: ReadingTheme;
  brightness: number; // 50 to 150 (default 100)
  contrast: number; // 50 to 150 (default 100)
  sepia: number; // 0 to 100 (default 0)
  grayscale: boolean;
  invert: boolean;
  autoHideHud: boolean;
  pageTransition: 'none' | 'fade' | 'slide';
  zoomLevel: number; // 1 to 3
}

export interface ExtractionProgress {
  stage: 'reading' | 'extracting' | 'indexing' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}
