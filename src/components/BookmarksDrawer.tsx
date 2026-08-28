import React, { useState } from 'react';
import { X, Bookmark, Trash2, Plus, ArrowRight } from 'lucide-react';
import { ComicBookmark } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: ComicBookmark[];
  currentPage: number;
  onAddBookmark: (page: number, note?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onJumpToPage: (page: number) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  currentPage,
  onAddBookmark,
  onRemoveBookmark,
  onJumpToPage,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const isCurrentBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  if (!isOpen) return null;

  const handleAdd = () => {
    onAddBookmark(currentPage, noteInput.trim() || undefined);
    setNoteInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div
        id="bookmarks-drawer"
        className="flex h-full w-full max-w-md flex-col border-l border-[#222] bg-[#111] p-6 text-[#e0e0e0] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">Bookmarks</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">{bookmarks.length} saved pages</p>
            </div>
          </div>
          <button
            id="close-bookmarks-btn"
            onClick={onClose}
            className="rounded p-1 text-[#777] transition hover:bg-[#222] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Add for Current Page */}
        <div className="mt-4 rounded-lg border border-[#222] bg-[#161616] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#ccc]">Bookmark Page {currentPage}</span>
            {isCurrentBookmarked ? (
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 font-medium border border-blue-500/30">Saved</span>
            ) : (
              <button
                id="quick-add-bookmark-btn"
                onClick={handleAdd}
                className="flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Bookmark
              </button>
            )}
          </div>
          <input
            id="bookmark-note-input"
            type="text"
            placeholder="Add an optional note (e.g. Action climax panel)..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            className="mt-2.5 w-full rounded border border-[#333] bg-[#222] px-3 py-1.5 text-xs text-white placeholder-[#555] focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Bookmarks List */}
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {bookmarks.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-[#555]">
              <Bookmark className="h-8 w-8 stroke-[1.5] text-[#333] mb-2" />
              <p className="text-xs font-medium text-[#777]">No bookmarks yet</p>
              <p className="text-[11px] text-[#555] mt-1">Press B while reading to save pages</p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="group flex items-center justify-between rounded-lg border border-[#222] bg-[#161616] p-3 transition hover:border-[#333] hover:bg-[#1c1c1c]"
              >
                <button
                  id={`jump-bookmark-page-${bm.pageNumber}`}
                  onClick={() => {
                    onJumpToPage(bm.pageNumber);
                    onClose();
                  }}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600/15 font-mono text-xs font-bold text-blue-400 border border-blue-500/20">
                    p.{bm.pageNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-[#e0e0e0] truncate">
                      {bm.note || `Page ${bm.pageNumber}`}
                    </div>
                    <div className="text-[10px] text-[#666]">
                      {new Date(bm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onJumpToPage(bm.pageNumber);
                      onClose();
                    }}
                    className="rounded p-1 text-[#777] hover:bg-[#2a2a2a] hover:text-white"
                    title="Jump to page"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bm.id)}
                    className="rounded p-1 text-[#777] opacity-70 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
                    title="Delete bookmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
