import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '← / →', desc: 'Previous / Next Page (or Manga inverted in RTL mode)' },
    { key: '↑ / ↓ or PageUp / PageDown', desc: 'Scroll up/down or previous/next page' },
    { key: 'Space / Shift+Space', desc: 'Next / Previous Page' },
    { key: 'Home / End', desc: 'Jump to First / Last Page' },
    { key: 'F', desc: 'Toggle Fullscreen Mode' },
    { key: 'M', desc: 'Toggle Header and Toolbar Menu' },
    { key: 'T', desc: 'Open / Close Thumbnail Drawer' },
    { key: 'Z', desc: 'Toggle Magnifying Loupe Tool' },
    { key: 'B', desc: 'Bookmark current page' },
    { key: '1 / 2 / 3', desc: 'Switch View: Single / Double / Webtoon' },
    { key: 'Esc', desc: 'Close dialogs or Exit Fullscreen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        id="shortcuts-modal"
        className="w-full max-w-lg rounded-lg border border-[#222] bg-[#111] p-6 text-[#e0e0e0] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">Keyboard Shortcuts</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Quick controls for comic navigation</p>
            </div>
          </div>
          <button
            id="close-shortcuts-btn"
            onClick={onClose}
            className="rounded p-1 text-[#777] transition hover:bg-[#222] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-[#161616] border border-[#222] px-3.5 py-2 text-xs"
            >
              <span className="text-[#ccc]">{item.desc}</span>
              <kbd className="inline-flex items-center rounded border border-[#333] bg-[#222] px-2.5 py-0.5 text-[11px] font-mono font-medium text-blue-400 shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            id="shortcuts-got-it-btn"
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 shadow-md"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

