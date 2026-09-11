'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Pipette,
  Eraser,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Palette as PaletteIcon,
  Search,
  Flame,
  Zap,
  ChevronUp,
} from 'lucide-react';
import { ToolMode } from '../types/canvas';
import { PALETTES } from '../lib/palette';

interface ToolbarProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExportPNG: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  energy: number;
  maxEnergy: number;
  isRecharging: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedColor,
  onSelectColor,
  toolMode,
  onSelectTool,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExportPNG,
  showHeatmap = false,
  onToggleHeatmap,
  energy,
  maxEnergy,
  isRecharging,
}) => {
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [isPalettePickerOpen, setIsPalettePickerOpen] = useState(false);
  const paletteContainerRef = useRef<HTMLDivElement>(null);
  const currentPalette = PALETTES[activePaletteIndex];
  const energyPercent = Math.round((energy / maxEnergy) * 100);

  // Close palette picker when clicking outside
  useEffect(() => {
    if (!isPalettePickerOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        paletteContainerRef.current &&
        !paletteContainerRef.current.contains(e.target as Node)
      ) {
        setIsPalettePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPalettePickerOpen]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center font-[var(--font-body)]">
      {/* Main Single-Row Unified Toolbar */}
      <div className="bg-white/95 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl flex items-center gap-1.5 sm:gap-2.5 shadow-popover border border-zinc-200/90 text-zinc-800 relative">
        {/* Tool modes group */}
        <div className="flex items-center gap-1 border-r border-zinc-200/80 pr-1.5 sm:pr-2 shrink-0">
          <button
            onClick={() => onSelectTool('pen')}
            className={`p-2 rounded-xl transition-all ${
              toolMode === 'pen'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Pen (Single Pixel / Continuous Drag)"
          >
            <PenTool className="h-4 w-4" />
          </button>

          <button
            onClick={() => onSelectTool('picker')}
            className={`p-2 rounded-xl transition-all ${
              toolMode === 'picker'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Eyedropper Color Picker"
          >
            <Pipette className="h-4 w-4" />
          </button>

          <button
            onClick={() => onSelectTool('inspect')}
            className={`p-2 rounded-xl transition-all ${
              toolMode === 'inspect'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Pixel Inspector (View Onchain Author & Transaction)"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={() => onSelectTool('eraser')}
            className={`p-2 rounded-xl transition-all ${
              toolMode === 'eraser'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Eraser (Clear Pixel to Blank Genesis)"
          >
            <Eraser className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleHeatmap}
            className={`p-2 rounded-xl transition-all ${
              showHeatmap
                ? 'bg-gradient-to-r from-amber-500 to-[#FF4D26] text-white shadow-sm scale-105'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title={showHeatmap ? 'Disable Contested Heatmap' : 'Enable Contested Heatmap (Battle Zones)'}
          >
            <Flame className={`h-4 w-4 ${showHeatmap ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Color Palette Selector Button & Swatches Group */}
        <div className="flex items-center gap-1.5 border-r border-zinc-200/80 pr-1.5 sm:pr-2 shrink-0">
          <div ref={paletteContainerRef} className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsPalettePickerOpen((prev) => !prev)}
              className={`p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all flex items-center gap-1.5 text-xs font-[var(--font-mono)] ${
                isPalettePickerOpen ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-xs' : ''
              }`}
              title="Choose Color Palette"
            >
              <PaletteIcon className="h-4 w-4 text-zinc-500 shrink-0" />
              <span className="hidden lg:inline text-[11px] max-w-[80px] truncate">{currentPalette.name}</span>
              <ChevronUp className={`h-3 w-3 text-zinc-400 transition-transform ${isPalettePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropup Menu anchored directly above button */}
            {isPalettePickerOpen && (
              <div
                className="absolute bottom-full mb-3 left-0 z-50 bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-popover border border-zinc-200/90 flex flex-col gap-1 w-60 animate-fade-in text-xs font-[var(--font-mono)]"
              >
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Color Palettes
                </div>
                {PALETTES.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePaletteIndex(idx);
                      setIsPalettePickerOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-3 transition-colors ${
                      activePaletteIndex === idx
                        ? 'bg-zinc-900 text-white font-semibold shadow-sm'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.colors.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Palette Swatches */}
          <div className="flex items-center gap-1">
            {currentPalette.colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onSelectColor(color);
                  if (toolMode === 'eraser') onSelectTool('pen');
                }}
                style={{ backgroundColor: color }}
                className={`h-6 w-6 rounded-lg transition-all shrink-0 ${
                  selectedColor === color && toolMode !== 'eraser'
                    ? 'ring-2 ring-zinc-900 ring-offset-2 scale-110 shadow-sm'
                    : 'hover:scale-105 opacity-90 hover:opacity-100 border border-black/10'
                }`}
                title={color}
              />
            ))}

            {/* Custom Color Input */}
            <div className="relative h-6 w-6 shrink-0 rounded-lg overflow-hidden border border-zinc-300 shadow-sm">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  onSelectColor(e.target.value);
                  if (toolMode === 'eraser') onSelectTool('pen');
                }}
                className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
                title="Custom Hex Color"
              />
            </div>
          </div>
        </div>

        {/* Energy Meter Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs font-[var(--font-mono)] shrink-0">
          <Zap className={`h-3.5 w-3.5 ${isRecharging ? 'text-amber-500 animate-pulse' : 'text-[#FF4D26]'}`} />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-zinc-700">
              <span>{energy}/{maxEnergy}</span>
            </div>
            <div className="w-12 h-1 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-[#FF4D26] transition-all duration-300 rounded-full"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Viewport Zoom & Export Controls Group */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={onZoomIn}
            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={onResetView}
            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
            title="Center Canvas"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onExportPNG}
            className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
            title="Download Canvas PNG"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
