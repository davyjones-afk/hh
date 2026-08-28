import React, { useState, useRef } from 'react';
import {
  BookOpen,
  FolderOpen,
  Upload,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  FileArchive,
  Star,
  MoreVertical,
  Play,
  HardDrive,
  Info,
  Download,
} from 'lucide-react';
import { ArchiveFormat, ComicBook, ExtractionProgress } from '../types';

interface LibraryViewProps {
  books: ComicBook[];
  onOpenBook: (book: ComicBook) => void;
  onImportFiles: (files: FileList | File[]) => void;
  onImportFolder: (files: FileList) => void;
  onDeleteBook: (id: string) => void;
  onToggleFinished: (id: string) => void;
  onLoadSample: (sampleId: string) => void;
  extractionProgress: ExtractionProgress | null;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  onOpenBook,
  onImportFiles,
  onImportFolder,
  onDeleteBook,
  onToggleFinished,
  onLoadSample,
  extractionProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'reading' | 'completed' | 'bookmarked'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFiles(e.dataTransfer.files);
    }
  };

  // Filter books based on search and tab
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'reading') return !book.isFinished && book.currentPage > 1;
    if (filterTab === 'completed') return book.isFinished;
    if (filterTab === 'bookmarked') return book.bookmarks && book.bookmarks.length > 0;
    return true;
  });

  // Calculate statistics
  const totalBooks = books.length;
  const completedBooks = books.filter((b) => b.isFinished).length;
  const inProgressBooks = books.filter((b) => !b.isFinished && b.currentPage > 1).length;

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFormatBadge = (format: ArchiveFormat) => {
    const badges: Record<string, { label: string; color: string }> = {
      cbz: { label: 'CBZ', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      cbr: { label: 'CBR', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
      zip: { label: 'ZIP', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
      rar: { label: 'RAR', color: 'bg-blue-600/20 text-blue-300 border-blue-600/30' },
      tar: { label: 'TAR', color: 'bg-[#222] text-[#aaa] border-[#333]' },
      cbt: { label: 'CBT', color: 'bg-[#222] text-[#aaa] border-[#333]' },
      folder: { label: 'DIR', color: 'bg-[#1e1e1e] text-[#888] border-[#333]' },
      sample: { label: 'SAMPLE', color: 'bg-blue-900/30 text-blue-300 border-blue-700/40' },
    };
    const b = badges[format] || { label: format.toUpperCase(), color: 'bg-[#222] text-[#888] border-[#333]' };
    return (
      <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold border tracking-wider ${b.color}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div
      id="library-view-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col font-sans select-none selection:bg-blue-600 selection:text-white"
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        id="comic-file-input"
        type="file"
        multiple
        accept=".cbr,.cbz,.zip,.rar,.tar,.cbt,.jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
          }
        }}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        id="comic-folder-input"
        type="file"
        {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFolder(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Extraction Loading Overlay */}
      {extractionProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-lg border border-[#222] bg-[#111] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-4 animate-pulse border border-blue-500/20">
              <FileArchive className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Opening Comic Archive</h3>
            <p className="mt-1 text-xs text-[#777]">{extractionProgress.message}</p>

            {/* Progress Bar */}
            <div className="mt-5 w-full rounded-full bg-[#222] p-0.5">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-200"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((extractionProgress.current / (extractionProgress.total || 1)) * 100)
                  )}%`,
                }}
              />
            </div>
            <div className="mt-2 text-right font-mono text-[10px] text-[#555]">
              {extractionProgress.current} / {extractionProgress.total}
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 border-b border-[#222] bg-[#111] px-6 h-14 flex items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold italic text-white shadow-sm">
              N
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white">
                NovaReader
              </h1>
            </div>
          </div>

          {/* Action Buttons & Status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              <span>Library Ready</span>
            </div>

            <div className="hidden sm:block h-4 w-[1px] bg-[#333]"></div>

            <button
              id="open-folder-btn"
              onClick={() => folderInputRef.current?.click()}
              className="hidden sm:flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium border border-[#333] bg-[#222] text-[#e0e0e0] transition hover:bg-[#2a2a2a]"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Import Folder</span>
            </button>

            <button
              id="open-file-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow transition hover:bg-blue-500 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Import Books</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* DRAG & DROP HERO BANNER */}
        <div
          id="dropzone-banner"
          onClick={() => fileInputRef.current?.click()}
          className={`group relative mb-8 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 text-center transition-all sm:p-8 ${
            isDragging
              ? 'border-blue-500 bg-blue-950/20 scale-[1.01]'
              : 'border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#161616]'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#222] border border-[#333] text-blue-400 transition group-hover:bg-blue-600 group-hover:text-white mb-3">
            <Upload className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-white">
            Drop your CBR or CBZ comic books here
          </h2>
          <p className="mt-1 text-xs text-[#777] max-w-md">
            Supports <strong className="text-[#bbb]">.CBR (RAR)</strong>,{' '}
            <strong className="text-[#bbb]">.CBZ (ZIP)</strong>, and{' '}
            <strong className="text-[#bbb]">.CBT</strong> archives. Files are processed entirely locally on your device.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded bg-[#1a1a1a] border border-[#282828] px-2.5 py-1 text-[11px] font-medium text-[#888]">
              ⚡ Instant in-browser extraction
            </span>
            <span className="rounded bg-[#1a1a1a] border border-[#282828] px-2.5 py-1 text-[11px] font-medium text-[#888]">
              📖 Spread & Continuous Webtoon
            </span>
            <span className="rounded bg-[#1a1a1a] border border-[#282828] px-2.5 py-1 text-[11px] font-medium text-[#888]">
              🔒 100% Private & Offline
            </span>
          </div>
        </div>

        {/* QUICK STATS & SEARCH / FILTER TOOLBAR */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center rounded p-1 bg-[#1a1a1a] border border-[#333] gap-1 overflow-x-auto">
            <button
              id="filter-tab-all"
              onClick={() => setFilterTab('all')}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                filterTab === 'all'
                  ? 'bg-[#333] text-white shadow-xs'
                  : 'text-[#777] hover:text-[#e0e0e0]'
              }`}
            >
              All Comics ({totalBooks})
            </button>
            <button
              id="filter-tab-reading"
              onClick={() => setFilterTab('reading')}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                filterTab === 'reading'
                  ? 'bg-[#333] text-white shadow-xs'
                  : 'text-[#777] hover:text-[#e0e0e0]'
              }`}
            >
              Reading ({inProgressBooks})
            </button>
            <button
              id="filter-tab-completed"
              onClick={() => setFilterTab('completed')}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                filterTab === 'completed'
                  ? 'bg-[#333] text-white shadow-xs'
                  : 'text-[#777] hover:text-[#e0e0e0]'
              }`}
            >
              Completed ({completedBooks})
            </button>
            <button
              id="filter-tab-bookmarked"
              onClick={() => setFilterTab('bookmarked')}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                filterTab === 'bookmarked'
                  ? 'bg-[#333] text-white shadow-xs'
                  : 'text-[#777] hover:text-[#e0e0e0]'
              }`}
            >
              Bookmarked
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#555]" />
            <input
              id="search-comics-input"
              type="text"
              placeholder="Search title, issue, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-[#282828] bg-[#111] py-1.5 pr-3 pl-9 text-xs text-[#e0e0e0] placeholder-[#555] focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* COMIC BOOKSHELF GRID */}
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#222] bg-[#111] p-12 text-center">
            <BookOpen className="h-10 w-10 text-[#444] mb-3" />
            <h3 className="text-sm font-semibold text-white">No comics found</h3>
            <p className="mt-1 text-xs text-[#777] max-w-sm">
              {searchQuery
                ? 'No comic matches your search query.'
                : 'Your shelf is empty. Drag in your .cbr / .cbz files or try one of our interactive demo comics below.'}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
              >
                Browse Local Files
              </button>
              <button
                onClick={() => onLoadSample('sample-cyber-guardian-01')}
                className="rounded border border-[#333] bg-[#222] px-4 py-1.5 text-xs font-medium text-[#e0e0e0] transition hover:bg-[#2a2a2a]"
              >
                Try "Cyber Guardian" Sample
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredBooks.map((book) => {
              const percent = Math.round(((book.currentPage || 1) / (book.pageCount || 1)) * 100);
              const isMenuOpen = activeMenuId === book.id;

              return (
                <div
                  key={book.id}
                  id={`comic-card-${book.id}`}
                  className="group relative flex flex-col rounded-md border border-[#222] bg-[#111] p-2.5 transition-all duration-200 hover:-translate-y-1 hover:border-[#333] hover:bg-[#161616] hover:shadow-xl hover:shadow-black/60"
                >
                  {/* Cover Artwork Container */}
                  <div
                    onClick={() => onOpenBook(book)}
                    className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded bg-[#0a0a0a] border border-white/5"
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-blue-950 via-[#161616] to-[#0a0a0a] border border-blue-800/30 text-blue-300">
                        <BookOpen className="h-8 w-8 text-blue-400 mb-2 opacity-60" />
                        <span className="text-[10px] font-medium text-[#aaa] line-clamp-2">
                          {book.title}
                        </span>
                      </div>
                    )}

                    {/* Format Badge Overlay */}
                    <div className="absolute top-2 left-2">
                      {getFormatBadge(book.format)}
                    </div>

                    {/* Finished or Bookmark Badge */}
                    {book.isFinished ? (
                      <div className="absolute top-2 right-2 rounded bg-blue-500 p-1 text-white shadow-md">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    ) : book.bookmarks && book.bookmarks.length > 0 ? (
                      <div className="absolute top-2 right-2 rounded bg-indigo-500 p-1 text-white shadow-md">
                        <Bookmark className="h-3 w-3" />
                      </div>
                    ) : null}

                    {/* Hover Play / Read Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div className="absolute right-0 bottom-0 left-0 bg-[#0a0a0a]/90 p-1">
                      <div className="h-1 w-full rounded-full bg-[#222] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comic Details */}
                  <div className="mt-2.5 flex flex-1 flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => onOpenBook(book)}
                        className="cursor-pointer text-xs font-medium text-[#e0e0e0] line-clamp-1 group-hover:text-blue-400 transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <div className="mt-0.5 flex items-center justify-between text-[10px] text-[#666]">
                        <span>{book.pageCount} pages</span>
                        <span className="text-blue-400/80 font-mono">{percent}%</span>
                      </div>
                    </div>

                    {/* Card Actions Menu */}
                    <div className="mt-2 flex items-center justify-between border-t border-[#222] pt-2 text-[11px]">
                      <button
                        onClick={() => onOpenBook(book)}
                        className="font-medium text-blue-400 hover:text-blue-300 text-xs"
                      >
                        {book.currentPage > 1 && !book.isFinished
                          ? `Resume (p.${book.currentPage})`
                          : 'Read'}
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : book.id)}
                          className="rounded p-1 text-[#666] hover:bg-[#222] hover:text-white"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {/* Card Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            className="absolute right-0 bottom-full mb-1 z-20 w-36 rounded-md border border-[#333] bg-[#111] p-1 shadow-2xl"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <button
                              onClick={() => {
                                onToggleFinished(book.id);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#ccc] hover:bg-[#222]"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                              <span>{book.isFinished ? 'Mark Unread' : 'Mark Finished'}</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteBook(book.id);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BUILT-IN SAMPLE COMICS SECTION */}
        <div className="mt-12 border-t border-[#222] pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Featured Sample Comic Books
              </h2>
              <p className="text-xs text-[#777] mt-0.5">
                Instantly try the comic reader with these interactive multi-page illustrated issues
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              onClick={() => onLoadSample('sample-cyber-guardian-01')}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-[#222] bg-[#111] p-4 transition hover:border-[#333] hover:bg-[#161616]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-blue-900 to-black font-bold text-blue-300 border border-blue-800/30 text-xs">
                  CBZ
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Cyber Guardian: Dawn of the Grid #1</h3>
                  <p className="text-[11px] text-[#666]">6 Pages • Sci-Fi / Cyberpunk Action</p>
                </div>
              </div>
              <button className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500">
                Read Issue
              </button>
            </div>

            <div
              onClick={() => onLoadSample('sample-cosmic-voyage-01')}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-[#222] bg-[#111] p-4 transition hover:border-[#333] hover:bg-[#161616]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-indigo-950 to-black font-bold text-indigo-300 border border-indigo-800/30 text-xs">
                  CBR
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Chronicles of Nebula #1</h3>
                  <p className="text-[11px] text-[#666]">5 Pages • Space Opera / Cosmic Fantasy</p>
                </div>
              </div>
              <button className="rounded border border-[#333] bg-[#222] px-3 py-1 text-xs font-medium text-[#e0e0e0] transition hover:bg-[#2a2a2a]">
                Read Issue
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#222] py-4 text-center text-xs text-[#555] bg-[#0d0d0d]">
        NovaReader • CBR & CBZ Browser Engine • Reading local comic archives with zero cloud uploads
      </footer>
    </div>
  );
};
