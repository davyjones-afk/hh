import React from 'react';
import { X, Sliders, Sun, Contrast, Palette, RefreshCw } from 'lucide-react';
import { ReadingSettings, ReadingTheme } from '../types';

interface FilterControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onReset: () => void;
}

export const FilterControlsModal: React.FC<FilterControlsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReset,
}) => {
  if (!isOpen) return null;

  const themes: { id: ReadingTheme; label: string; bg: string; text: string; border: string }[] = [
    { id: 'dark', label: 'Dark Onyx', bg: 'bg-[#0a0a0a]', text: 'text-[#e0e0e0]', border: 'border-[#333]' },
    { id: 'black', label: 'OLED Pure Black', bg: 'bg-[#000000]', text: 'text-white', border: 'border-[#222]' },
    { id: 'sepia', label: 'Warm Sepia', bg: 'bg-[#181410]', text: 'text-amber-200', border: 'border-[#3a2818]' },
    { id: 'light', label: 'Clean Light', bg: 'bg-[#f4f4f5]', text: 'text-neutral-900', border: 'border-neutral-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        id="filter-controls-modal"
        className="w-full max-w-md rounded-lg border border-[#222] bg-[#111] p-6 text-[#e0e0e0] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">Visual Enhancements</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Display brightness, contrast & mood</p>
            </div>
          </div>
          <button
            id="close-filter-modal-btn"
            onClick={onClose}
            className="rounded p-1 text-[#777] transition hover:bg-[#222] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Reader Theme */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">
              Background Canvas Theme
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`flex items-center gap-2.5 rounded border p-2.5 text-left transition ${
                    settings.theme === t.id
                      ? 'border-blue-500 bg-blue-950/20 text-white ring-1 ring-blue-500'
                      : 'border-[#222] bg-[#161616] text-[#888] hover:border-[#333] hover:text-[#ccc]'
                  }`}
                >
                  <div className={`h-3.5 w-3.5 rounded border ${t.bg} ${t.border}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brightness Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[#ccc]">
              <span className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-blue-400" />
                Brightness
              </span>
              <span className="font-mono text-[#777]">{settings.brightness}%</span>
            </div>
            <input
              id="brightness-slider"
              type="range"
              min="50"
              max="150"
              value={settings.brightness}
              onChange={(e) => onUpdateSettings({ brightness: Number(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#222] accent-blue-500"
            />
          </div>

          {/* Contrast Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[#ccc]">
              <span className="flex items-center gap-1.5">
                <Contrast className="h-3.5 w-3.5 text-blue-400" />
                Contrast
              </span>
              <span className="font-mono text-[#777]">{settings.contrast}%</span>
            </div>
            <input
              id="contrast-slider"
              type="range"
              min="50"
              max="150"
              value={settings.contrast}
              onChange={(e) => onUpdateSettings({ contrast: Number(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#222] accent-blue-500"
            />
          </div>

          {/* Sepia Tint */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[#ccc]">
              <span className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-amber-400" />
                Vintage Sepia Warmth
              </span>
              <span className="font-mono text-[#777]">{settings.sepia}%</span>
            </div>
            <input
              id="sepia-slider"
              type="range"
              min="0"
              max="100"
              value={settings.sepia}
              onChange={(e) => onUpdateSettings({ sepia: Number(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#222] accent-blue-500"
            />
          </div>

          {/* Toggles: Grayscale & Invert */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              id="toggle-grayscale-btn"
              onClick={() => onUpdateSettings({ grayscale: !settings.grayscale })}
              className={`flex items-center justify-center gap-2 rounded border p-2.5 text-xs font-medium transition ${
                settings.grayscale
                  ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                  : 'border-[#222] bg-[#161616] text-[#777] hover:border-[#333] hover:text-[#ccc]'
              }`}
            >
              <span>Grayscale B&W</span>
            </button>

            <button
              id="toggle-invert-btn"
              onClick={() => onUpdateSettings({ invert: !settings.invert })}
              className={`flex items-center justify-center gap-2 rounded border p-2.5 text-xs font-medium transition ${
                settings.invert
                  ? 'border-blue-500 bg-blue-950/30 text-blue-300'
                  : 'border-[#222] bg-[#161616] text-[#777] hover:border-[#333] hover:text-[#ccc]'
              }`}
            >
              <span>Invert Colors</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#222] pt-4">
          <button
            id="reset-filters-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-[#777] transition hover:bg-[#222] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            id="apply-filters-btn"
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
