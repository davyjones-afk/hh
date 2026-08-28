import React from 'react';
import { X, Info, Calendar, Layers, HardDrive } from 'lucide-react';
import { ComicBook, ComicMetadataInfo } from '../types';

interface ComicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: ComicBook;
  metadata?: ComicMetadataInfo;
}

export const ComicInfoModal: React.FC<ComicInfoModalProps> = ({ isOpen, onClose, book, metadata }) => {
  if (!isOpen) return null;

  const meta = metadata || book.metadata || {};

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        id="comic-info-modal"
        className="w-full max-w-xl rounded-lg border border-[#222] bg-[#111] p-6 text-[#e0e0e0] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">Comic Details</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold truncate max-w-xs">{book.fileName}</p>
            </div>
          </div>
          <button
            id="close-comic-info-btn"
            onClick={onClose}
            className="rounded p-1 text-[#777] transition hover:bg-[#222] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {/* Main Title & Issue Info */}
          <div className="rounded-lg border border-[#222] bg-[#161616] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">Series & Title</div>
            <div className="mt-1 text-sm font-bold text-white">
              {meta.series || book.title} {meta.number ? `Issue #${meta.number}` : ''}
            </div>
            {meta.summary && (
              <p className="mt-2 text-xs leading-relaxed text-[#aaa]">{meta.summary}</p>
            )}
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg bg-[#161616] border border-[#222] p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#666] font-bold">
                <Layers className="h-3 w-3 text-blue-400" />
                <span>Pages</span>
              </div>
              <div className="mt-1 text-xs font-semibold text-white">{book.pageCount} pages</div>
            </div>

            <div className="rounded-lg bg-[#161616] border border-[#222] p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#666] font-bold">
                <HardDrive className="h-3 w-3 text-blue-400" />
                <span>Format / Size</span>
              </div>
              <div className="mt-1 text-xs font-semibold text-white uppercase">
                {book.format} • <span className="text-[#888] font-normal lowercase">{formatFileSize(book.fileSize)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#161616] border border-[#222] p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#666] font-bold">
                <Calendar className="h-3 w-3 text-blue-400" />
                <span>Release</span>
              </div>
              <div className="mt-1 text-xs font-semibold text-white">{meta.year || 'Unknown'}</div>
            </div>
          </div>

          {/* Credits List if available */}
          {(meta.writer || meta.penciller || meta.publisher || meta.genre) && (
            <div className="rounded-lg border border-[#222] bg-[#161616] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555] mb-2.5">Credits & Publishing</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                {meta.publisher && (
                  <div>
                    <span className="text-[#666]">Publisher:</span>{' '}
                    <span className="font-medium text-[#ccc]">{meta.publisher}</span>
                  </div>
                )}
                {meta.genre && (
                  <div>
                    <span className="text-[#666]">Genre:</span>{' '}
                    <span className="font-medium text-[#ccc]">{meta.genre}</span>
                  </div>
                )}
                {meta.writer && (
                  <div>
                    <span className="text-[#666]">Writer:</span>{' '}
                    <span className="font-medium text-[#ccc]">{meta.writer}</span>
                  </div>
                )}
                {meta.penciller && (
                  <div>
                    <span className="text-[#666]">Penciller / Artist:</span>{' '}
                    <span className="font-medium text-[#ccc]">{meta.penciller}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reading progress details */}
          <div className="rounded-lg bg-[#161616] border border-[#222] p-3 text-[11px] text-[#777] flex items-center justify-between">
            <span>Last Read: {new Date(book.lastRead || Date.now()).toLocaleDateString()}</span>
            <span className="text-blue-400">Progress: Page {book.currentPage} ({Math.round((book.currentPage / (book.pageCount || 1)) * 100)}%)</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            id="close-info-modal-btn"
            onClick={onClose}
            className="rounded bg-[#222] border border-[#333] px-4 py-1.5 text-xs font-medium text-[#e0e0e0] transition hover:bg-[#2a2a2a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
