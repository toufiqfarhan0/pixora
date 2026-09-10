import React, { useState } from 'react';
import {
  PenTool,
  Paintbrush,
  Pipette,
  Eraser,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Palette as PaletteIcon,
  Search,
  Flame,
} from 'lucide-react';
import { ToolMode } from '../types/canvas';
import { PALETTES } from '../lib/palette';
import { EnergyBar } from './EnergyBar';

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
  const currentPalette = PALETTES[activePaletteIndex];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[calc(100vw-2rem)] font-[var(--font-body)]">
      {/* Row 1: Floating Energy & Cooldown Bar */}
      <EnergyBar
        energy={energy}
        maxEnergy={maxEnergy}
        isRecharging={isRecharging}
      />

      {/* Row 2: Palette Selector Bar */}
      <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 shadow-subtle flex items-center gap-1.5 overflow-x-auto max-w-full text-xs font-[var(--font-mono)]">
        <PaletteIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0 mr-1" />
        {PALETTES.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActivePaletteIndex(idx)}
            className={`px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap transition-all ${
              activePaletteIndex === idx
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Tools & Swatches Bar */}
      <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl flex items-center gap-2 sm:gap-3 shadow-popover border border-zinc-200/90 text-zinc-800">
        {/* Tool modes */}
        <div className="flex items-center gap-1 border-r border-zinc-200/80 pr-2 sm:pr-3">
          <button
            onClick={() => onSelectTool('pen')}
            className={`p-2 rounded-xl transition-all ${
              toolMode === 'pen'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Single Pixel Pen (10ms ER)"
          >
            <PenTool className="h-4 w-4" />
          </button>

          <button
            onClick={() => onSelectTool('brush')}
            className={`p-2 rounded-xl transition-all ${
              toolMode === 'brush'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="3x3 Brush"
          >
            <Paintbrush className="h-4 w-4" />
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
            title="Pixel Inspector (Click pixel to inspect onchain provenance)"
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
            title="Eraser"
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
            title={showHeatmap ? 'Disable Battle Heatmap' : 'Battle Heatmap (View Contested Zones)'}
          >
            <Flame className={`h-4 w-4 ${showHeatmap ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5">
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

        {/* Viewport Zoom & Export Controls */}
        <div className="flex items-center gap-1 border-l border-zinc-200/80 pl-2 sm:pl-3">
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
