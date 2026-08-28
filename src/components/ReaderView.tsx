import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Sliders,
  Bookmark,
  Search,
  Grid,
  Info,
  Keyboard,
  Sun,
  Layout,
  Columns,
  Scroll,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { ComicBook, ComicPage, ReadingSettings, ViewMode, FitMode, ReadingDirection } from '../types';
import { MagnifierLoupe } from './MagnifierLoupe';
import { ShortcutsModal } from './ShortcutsModal';
import { ComicInfoModal } from './ComicInfoModal';
import { FilterControlsModal } from './FilterControlsModal';
import { BookmarksDrawer } from './BookmarksDrawer';

interface ReaderViewProps {
  book: ComicBook;
  pages: ComicPage[];
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onUpdateProgress: (currentPage: number, isFinished: boolean) => void;
  onUpdateBook: (updatedBook: ComicBook) => void;
  onBackToLibrary: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  pages,
  settings,
  onUpdateSettings,
  onUpdateProgress,
  onUpdateBook,
  onBackToLibrary,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const webtoonScrollRef = useRef<HTMLDivElement>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = pages.length;

  // Sync current page with parent tracking
  useEffect(() => {
    const isFinished = currentPage >= totalPages;
    onUpdateProgress(currentPage, isFinished);

    if (isFinished && !book.isFinished) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  }, [currentPage, totalPages]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // HUD Auto-hide management
  const resetHudTimer = useCallback(() => {
    setHudVisible(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    if (settings.autoHideHud && !isThumbnailsOpen && !isBookmarksOpen) {
      hudTimeoutRef.current = setTimeout(() => {
        setHudVisible(false);
      }, 3500);
    }
  }, [settings.autoHideHud, isThumbnailsOpen, isBookmarksOpen]);

  const handleMouseMove = () => {
    resetHudTimer();
  };

  // Navigation functions
  const goToNext = useCallback(() => {
    if (settings.viewMode === 'double') {
      // In double mode, advance by 2 unless on page 1 with cover offset
      if (currentPage === 1 && settings.doublePageOffset) {
        setCurrentPage(2);
      } else {
        setCurrentPage((prev) => Math.min(totalPages, prev + 2));
      }
    } else {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }
    resetHudTimer();
  }, [currentPage, totalPages, settings.viewMode, settings.doublePageOffset, resetHudTimer]);

  const goToPrev = useCallback(() => {
    if (settings.viewMode === 'double') {
      if (currentPage === 2 && settings.doublePageOffset) {
        setCurrentPage(1);
      } else {
        setCurrentPage((prev) => Math.max(1, prev - 2));
      }
    } else {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
    resetHudTimer();
  }, [currentPage, settings.viewMode, settings.doublePageOffset, resetHudTimer]);

  const jumpToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(totalPages, pageNum));
    setCurrentPage(clamped);
    if (settings.viewMode === 'webtoon' && webtoonScrollRef.current) {
      const targetEl = document.getElementById(`webtoon-page-${clamped}`);
      targetEl?.scrollIntoView({ behavior: 'smooth' });
    }
    resetHudTimer();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const isRTL = settings.readingDirection === 'rtl';

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          isRTL ? goToPrev() : goToNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          isRTL ? goToNext() : goToPrev();
          break;
        case ' ':
          if (e.shiftKey) {
            isRTL ? goToNext() : goToPrev();
          } else {
            isRTL ? goToPrev() : goToNext();
          }
          break;
        case 'Home':
          jumpToPage(1);
          break;
        case 'End':
          jumpToPage(totalPages);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          setHudVisible((prev) => !prev);
          break;
        case 't':
        case 'T':
          setIsThumbnailsOpen((prev) => !prev);
          break;
        case 'z':
        case 'Z':
          setIsLoupeActive((prev) => !prev);
          break;
        case 'b':
        case 'B':
          handleAddBookmark(currentPage);
          break;
        case '1':
          onUpdateSettings({ viewMode: 'single' });
          break;
        case '2':
          onUpdateSettings({ viewMode: 'double' });
          break;
        case '3':
          onUpdateSettings({ viewMode: 'webtoon' });
          break;
        case 'Escape':
          if (isThumbnailsOpen) setIsThumbnailsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          if (isInfoOpen) setIsInfoOpen(false);
          if (isFilterOpen) setIsFilterOpen(false);
          if (isBookmarksOpen) setIsBookmarksOpen(false);
          if (isLoupeActive) setIsLoupeActive(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, settings.readingDirection, totalPages, isThumbnailsOpen, isShortcutsOpen, isInfoOpen, isFilterOpen, isBookmarksOpen, isLoupeActive]);

  // Bookmarking helpers
  const handleAddBookmark = (pageNum: number, note?: string) => {
    const existing = book.bookmarks || [];
    if (existing.some((b) => b.pageNumber === pageNum)) return;

    const newBookmark = {
      id: 'bm_' + Date.now(),
      pageNumber: pageNum,
      timestamp: Date.now(),
      note: note || `Page ${pageNum}`,
      thumbnailUrl: pages[pageNum - 1]?.blobUrl,
    };

    const updatedBook = {
      ...book,
      bookmarks: [...existing, newBookmark],
    };
    onUpdateBook(updatedBook);
  };

  const handleRemoveBookmark = (bmId: string) => {
    const updatedBook = {
      ...book,
      bookmarks: (book.bookmarks || []).filter((b) => b.id !== bmId),
    };
    onUpdateBook(updatedBook);
  };

  // Compute CSS filter style for images
  const filterStyle: React.CSSProperties = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) sepia(${settings.sepia}%) ${
      settings.grayscale ? 'grayscale(100%)' : ''
    } ${settings.invert ? 'invert(100%)' : ''}`,
  };

  // Background Theme Class
  const themeBgClasses = {
    dark: 'bg-[#0a0a0a] text-[#e0e0e0]',
    black: 'bg-[#000000] text-white',
    sepia: 'bg-[#181410] text-[#eeddc8]',
    light: 'bg-[#f4f4f5] text-[#111111]',
  }[settings.theme || 'dark'];

  // Calculate current active pages to render
  let activePagesToRender: ComicPage[] = [];
  if (settings.viewMode === 'single') {
    const p = pages[currentPage - 1];
    if (p) activePagesToRender = [p];
  } else if (settings.viewMode === 'double') {
    if (currentPage === 1 && settings.doublePageOffset) {
      const p1 = pages[0];
      if (p1) activePagesToRender = [p1];
    } else {
      const p1 = pages[currentPage - 1];
      const p2 = pages[currentPage];
      const pair = [p1, p2].filter(Boolean) as ComicPage[];
      // Manga mode swaps left and right page in spread
      activePagesToRender = settings.readingDirection === 'rtl' ? pair.reverse() : pair;
    }
  }

  return (
    <div
      ref={readerContainerRef}
      id="comic-reader-viewport"
      onMouseMove={handleMouseMove}
      className={`relative flex h-screen w-screen flex-col select-none overflow-hidden font-sans ${themeBgClasses}`}
    >
      {/* Magnifier Loupe Tool */}
      <MagnifierLoupe
        active={isLoupeActive}
        targetContainerRef={readerContainerRef}
        onClose={() => setIsLoupeActive(false)}
      />

      {/* TOP FLOATING NAVIGATION HUD */}
      <div
        id="reader-top-hud"
        className={`absolute top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-[#222] bg-[#111]/95 px-6 h-14 backdrop-blur-md transition-all duration-300 ${
          hudVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="reader-back-btn"
            onClick={onBackToLibrary}
            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium border border-[#333] bg-[#222] text-[#e0e0e0] transition hover:bg-[#2a2a2a]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="min-w-0 truncate">
            <h1 className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
              {book.title}
            </h1>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">
              Page {currentPage} of {totalPages} • {Math.round((currentPage / totalPages) * 100)}%
            </div>
          </div>
        </div>

        {/* Center: View Mode & Reading Direction Toggles */}
        <div className="hidden md:flex items-center rounded p-1 bg-[#1a1a1a] border border-[#333] gap-1">
          <button
            id="viewmode-single-btn"
            onClick={() => onUpdateSettings({ viewMode: 'single' })}
            title="Single Page (1)"
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              settings.viewMode === 'single'
                ? 'bg-[#333] text-white shadow-xs font-semibold'
                : 'text-[#777] hover:text-[#e0e0e0]'
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Single</span>
          </button>

          <button
            id="viewmode-double-btn"
            onClick={() => onUpdateSettings({ viewMode: 'double' })}
            title="Double Spread (2)"
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              settings.viewMode === 'double'
                ? 'bg-[#333] text-white shadow-xs font-semibold'
                : 'text-[#777] hover:text-[#e0e0e0]'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Spread</span>
          </button>

          <button
            id="viewmode-webtoon-btn"
            onClick={() => onUpdateSettings({ viewMode: 'webtoon' })}
            title="Continuous Webtoon (3)"
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
              settings.viewMode === 'webtoon'
                ? 'bg-[#333] text-white shadow-xs font-semibold'
                : 'text-[#777] hover:text-[#e0e0e0]'
            }`}
          >
            <Scroll className="h-3.5 w-3.5" />
            <span>Webtoon</span>
          </button>
        </div>

        {/* Right: Tools & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fit Mode Switcher (Single/Double mode) */}
          {settings.viewMode !== 'webtoon' && (
            <select
              id="fitmode-select"
              value={settings.fitMode}
              onChange={(e) => onUpdateSettings({ fitMode: e.target.value as FitMode })}
              className="rounded border border-[#333] bg-[#222] px-2.5 py-1 text-xs text-[#e0e0e0] focus:outline-none"
            >
              <option value="fit-height">Fit Height</option>
              <option value="fit-width">Fit Width</option>
              <option value="fit-screen">Fit Screen</option>
              <option value="original">Original Size</option>
            </select>
          )}

          {/* Manga RTL Toggle */}
          <button
            id="toggle-direction-btn"
            onClick={() =>
              onUpdateSettings({ readingDirection: settings.readingDirection === 'ltr' ? 'rtl' : 'ltr' })
            }
            title={settings.readingDirection === 'ltr' ? 'Switch to Manga RTL' : 'Switch to Western LTR'}
            className={`rounded px-2.5 py-1 text-xs font-medium border transition ${
              settings.readingDirection === 'rtl'
                ? 'border-blue-500/50 bg-blue-600/20 text-blue-400'
                : 'border-[#333] bg-[#222] text-[#888] hover:text-white'
            }`}
          >
            {settings.readingDirection === 'rtl' ? 'Manga RTL' : 'LTR'}
          </button>

          {/* Magnifier Loupe */}
          <button
            id="toggle-loupe-btn"
            onClick={() => setIsLoupeActive((prev) => !prev)}
            title="Magnifier Tool (Z)"
            className={`rounded border p-1.5 text-xs transition ${
              isLoupeActive
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-[#333] bg-[#222] text-[#888] hover:text-white'
            }`}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          {/* Bookmarks Drawer Trigger */}
          <button
            id="open-bookmarks-btn"
            onClick={() => setIsBookmarksOpen(true)}
            title="Bookmarks (B)"
            className="relative rounded border border-[#333] bg-[#222] p-1.5 text-[#888] transition hover:text-white"
          >
            <Bookmark className="h-3.5 w-3.5" />
            {book.bookmarks && book.bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
                {book.bookmarks.length}
              </span>
            )}
          </button>

          {/* Visual Enhancements Modal */}
          <button
            id="open-filters-btn"
            onClick={() => setIsFilterOpen(true)}
            title="Visual Filter Settings"
            className="rounded border border-[#333] bg-[#222] p-1.5 text-[#888] transition hover:text-white"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>

          {/* Comic Info Details */}
          <button
            id="open-info-btn"
            onClick={() => setIsInfoOpen(true)}
            title="Comic Metadata"
            className="rounded border border-[#333] bg-[#222] p-1.5 text-[#888] transition hover:text-white"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {/* Shortcuts Help */}
          <button
            id="open-shortcuts-btn"
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            className="hidden sm:flex rounded border border-[#333] bg-[#222] p-1.5 text-[#888] transition hover:text-white"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            id="toggle-fullscreen-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (F)"
            className="rounded border border-[#333] bg-[#222] p-1.5 text-[#888] transition hover:text-white"
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* MAIN COMIC STAGE / CANVAS */}
      <div
        id="reader-main-stage"
        className="relative flex-1 overflow-hidden"
        onClick={(e) => {
          // If clicking on sides, navigate
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;

          // Middle 40% toggles HUD, sides navigate
          if (clickX < width * 0.3) {
            settings.readingDirection === 'rtl' ? goToNext() : goToPrev();
          } else if (clickX > width * 0.7) {
            settings.readingDirection === 'rtl' ? goToPrev() : goToNext();
          } else {
            setHudVisible((prev) => !prev);
          }
        }}
      >
        {/* VIEW 1: WEBTOON CONTINUOUS SCROLL */}
        {settings.viewMode === 'webtoon' ? (
          <div
            ref={webtoonScrollRef}
            id="webtoon-container"
            onScroll={(e) => {
              // Track current visible page
              const container = e.currentTarget;
              const mid = container.scrollTop + container.clientHeight / 2;
              let currentVisible = 1;
              for (let i = 1; i <= totalPages; i++) {
                const el = document.getElementById(`webtoon-page-${i}`);
                if (el && el.offsetTop <= mid) {
                  currentVisible = i;
                }
              }
              if (currentVisible !== currentPage) {
                setCurrentPage(currentVisible);
              }
            }}
            className="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col items-center py-12"
          >
            <div className="w-full max-w-3xl flex flex-col items-center gap-0">
              {pages.map((p) => (
                <div
                  key={p.pageNumber}
                  id={`webtoon-page-${p.pageNumber}`}
                  className="w-full relative flex flex-col items-center"
                >
                  <img
                    src={p.blobUrl}
                    alt={`Page ${p.pageNumber}`}
                    style={filterStyle}
                    loading="lazy"
                    className="w-full h-auto object-contain block shadow-2xl"
                  />
                  <div className="absolute bottom-2 right-4 rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-white/70 backdrop-blur-sm border border-white/5">
                    {p.pageNumber} / {totalPages}
                  </div>
                </div>
              ))}

              {/* Finished End Card */}
              <div className="mt-12 mb-20 flex flex-col items-center justify-center rounded-lg border border-[#222] bg-[#111] p-8 text-center backdrop-blur-md">
                <CheckCircle2 className="h-10 w-10 text-blue-400 mb-3" />
                <h3 className="text-base font-semibold text-white">End of {book.title}</h3>
                <p className="mt-1 text-xs text-[#777]">You've completed reading this issue.</p>
                <button
                  onClick={onBackToLibrary}
                  className="mt-5 rounded bg-blue-600 px-5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 shadow-md"
                >
                  Back to Library
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2 & 3: SINGLE OR DOUBLE PAGE SPREAD */
          <div className="flex h-full w-full items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div
              className={`flex items-center justify-center transition-transform duration-200 ${
                activePagesToRender.length === 2 ? 'gap-1 md:gap-3' : ''
              }`}
              style={{
                transform: `scale(${zoomScale})`,
              }}
            >
              {activePagesToRender.map((p) => {
                let fitClass = 'max-h-[88vh] max-w-[90vw] object-contain';
                if (settings.fitMode === 'fit-height') {
                  fitClass = 'h-[86vh] w-auto object-contain';
                } else if (settings.fitMode === 'fit-width') {
                  fitClass =
                    activePagesToRender.length === 2
                      ? 'w-[46vw] h-auto object-contain'
                      : 'w-[90vw] h-auto object-contain';
                } else if (settings.fitMode === 'fit-screen') {
                  fitClass =
                    activePagesToRender.length === 2
                      ? 'max-h-[88vh] max-w-[48vw] object-contain'
                      : 'max-h-[88vh] max-w-[92vw] object-contain';
                } else if (settings.fitMode === 'original') {
                  fitClass = 'object-none';
                }

                return (
                  <div
                    key={p.pageNumber}
                    className="relative flex items-center justify-center drop-shadow-2xl"
                  >
                    <img
                      src={p.blobUrl}
                      alt={`Page ${p.pageNumber}`}
                      style={filterStyle}
                      className={`${fitClass} rounded-xs transition-all duration-150`}
                    />
                    {/* Tiny page watermark */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-white/80 backdrop-blur-xs border border-white/5">
                      {p.pageNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Side Click Arrow Overlays (appear on hover) */}
        {settings.viewMode !== 'webtoon' && (
          <>
            <button
              id="stage-prev-btn"
              onClick={(e) => {
                e.stopPropagation();
                settings.readingDirection === 'rtl' ? goToNext() : goToPrev();
              }}
              disabled={currentPage <= 1}
              className={`absolute top-1/2 left-4 -translate-y-1/2 rounded-full border border-[#333] bg-[#111]/80 p-2.5 text-[#ccc] backdrop-blur-md transition hover:bg-blue-600 hover:text-white hover:border-blue-500 disabled:opacity-0 ${
                hudVisible ? 'opacity-60 hover:opacity-100' : 'opacity-0'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              id="stage-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                settings.readingDirection === 'rtl' ? goToPrev() : goToNext();
              }}
              disabled={currentPage >= totalPages}
              className={`absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-[#333] bg-[#111]/80 p-2.5 text-[#ccc] backdrop-blur-md transition hover:bg-blue-600 hover:text-white hover:border-blue-500 disabled:opacity-0 ${
                hudVisible ? 'opacity-60 hover:opacity-100' : 'opacity-0'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* BOTTOM FLOATING SCRUBBER HUD */}
      <div
        id="reader-bottom-hud"
        className={`absolute bottom-0 right-0 left-0 z-40 border-t border-[#222] bg-[#111]/95 px-6 py-3 backdrop-blur-md transition-all duration-300 ${
          hudVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          {/* Scrubber Slider Row */}
          <div className="flex items-center gap-4">
            <button
              id="scrubber-prev-btn"
              onClick={goToPrev}
              disabled={currentPage <= 1}
              className="rounded p-1.5 text-[#777] transition hover:bg-[#222] hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Slider Track */}
            <div className="relative flex-1 flex items-center">
              <input
                id="page-scrubber-slider"
                type="range"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => jumpToPage(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#222] accent-blue-500"
              />
            </div>

            <button
              id="scrubber-next-btn"
              onClick={goToNext}
              disabled={currentPage >= totalPages}
              className="rounded p-1.5 text-[#777] transition hover:bg-[#222] hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Thumbnail Drawer Toggle */}
            <button
              id="toggle-thumbnail-drawer-btn"
              onClick={() => setIsThumbnailsOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-medium transition ${
                isThumbnailsOpen
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-[#333] bg-[#222] text-[#e0e0e0] hover:bg-[#2a2a2a]'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Pages</span>
            </button>
          </div>

          {/* Quick Page Counter label */}
          <div className="flex items-center justify-between text-[11px] text-[#777] px-1">
            <span>Page 1</span>
            <span className="font-mono text-blue-400">
              Page {currentPage} of {totalPages} ({Math.round((currentPage / totalPages) * 100)}%)
            </span>
            <span>Page {totalPages}</span>
          </div>
        </div>
      </div>

      {/* THUMBNAIL DRAWER MODAL / TRAY */}
      {isThumbnailsOpen && (
        <div
          id="thumbnail-drawer"
          className="absolute right-0 bottom-16 left-0 z-40 max-h-56 overflow-x-auto border-t border-[#222] bg-[#111]/98 p-4 backdrop-blur-lg"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            {pages.map((p) => (
              <button
                key={p.pageNumber}
                id={`thumb-jump-${p.pageNumber}`}
                onClick={() => {
                  jumpToPage(p.pageNumber);
                  setIsThumbnailsOpen(false);
                }}
                className={`group relative shrink-0 overflow-hidden rounded border transition-all ${
                  p.pageNumber === currentPage
                    ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105'
                    : 'border-[#222] opacity-60 hover:opacity-100 hover:border-[#444]'
                }`}
              >
                <img
                  src={p.blobUrl}
                  alt={`Thumb ${p.pageNumber}`}
                  className="h-28 w-20 object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/85 py-0.5 text-center text-[10px] font-mono text-white">
                  {p.pageNumber}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DIALOG MODALS */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <ComicInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        book={book}
        metadata={book.metadata}
      />
      <FilterControlsModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onReset={() =>
          onUpdateSettings({
            brightness: 100,
            contrast: 100,
            sepia: 0,
            grayscale: false,
            invert: false,
            theme: 'dark',
          })
        }
      />
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={book.bookmarks || []}
        currentPage={currentPage}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onJumpToPage={jumpToPage}
      />
    </div>
  );
};
