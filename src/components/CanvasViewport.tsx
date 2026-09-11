'use client';

import React from 'react';
import { ToolMode, Pixel } from '../types/canvas';
import { MultiplayerCursors } from './MultiplayerCursors';
import { RemoteCursor } from '../hooks/useRealtimeMultiplayer';
import { Flame, Zap, Search, Users } from 'lucide-react';
import { shortAddress } from '../lib/magicblock';

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toolMode: ToolMode;
  scale: number;
  offset: { x: number; y: number };
  width: number;
  height: number;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e?: React.PointerEvent) => void;
  remoteCursors?: RemoteCursor[];
  hoveredPixel?: { x: number; y: number; pixel?: Pixel } | null;
  showHeatmap?: boolean;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  canvasRef,
  toolMode,
  scale,
  offset,
  width,
  height,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  remoteCursors = [],
  hoveredPixel = null,
  showHeatmap = false,
}) => {
  const getCursorStyle = () => {
    switch (toolMode) {
      case 'inspect':
        return 'cursor-help';
      case 'picker':
        return 'cursor-crosshair';
      case 'eraser':
        return 'cursor-cell';
      case 'pen':
      default:
        return 'cursor-crosshair';
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden light-cyber-grid bg-slate-100/60 touch-none select-none ${getCursorStyle()}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="pixel-canvas absolute inset-0 w-full h-full touch-none select-none" />

      {/* Real Live Multiplayer Cursors Overlay */}
      <MultiplayerCursors
        cursors={remoteCursors}
        scale={scale}
        offset={offset}
      />

      {/* Top Left Viewport Status & Control Hints */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col items-start gap-2">
        <div className="flex items-center gap-2 font-[var(--font-mono)] text-[11px] text-zinc-600 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200/80 shadow-subtle">
          <div className="flex items-center gap-1.5 font-semibold text-brand-600">
            {toolMode === 'inspect' ? (
              <>
                <Search className="w-3.5 h-3.5 text-brand-600" />
                <span>Click pixel to inspect onchain author</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-brand-600" />
                <span>Click & Drag to Paint (10ms)</span>
              </>
            )}
          </div>
          <span className="text-zinc-300">·</span>
          <span suppressHydrationWarning>Zoom: {Math.round(scale * 10) / 10}x</span>
          <span className="text-zinc-300">·</span>
          <span suppressHydrationWarning className="flex items-center gap-1.5 text-[#FF4D26] font-semibold">
            <Users className="w-3 h-3 text-[#FF4D26]" />
            {remoteCursors.length > 0
              ? `${remoteCursors.length + 1} Online`
              : 'Multiplayer Active'}
          </span>
        </div>

        {/* Battle Heatmap Status Badge */}
        {showHeatmap && (
          <div className="flex items-center gap-1.5 font-[var(--font-mono)] text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-[#FF4D26] px-3 py-1 rounded-full shadow-sm animate-fade-in">
            <Flame className="w-3.5 h-3.5 animate-pulse text-yellow-200" />
            <span>Contested Heatmap Active</span>
          </div>
        )}
      </div>

      {/* Live Cursor Coordinate Pill */}
      {hoveredPixel && hoveredPixel.x >= 0 && hoveredPixel.x < width && hoveredPixel.y >= 0 && hoveredPixel.y < height && (
        <div className="absolute top-4 right-80 pointer-events-none z-10 hidden md:flex items-center gap-2 font-[var(--font-mono)] text-[11px] text-zinc-700 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200/90 shadow-subtle animate-fade-in">
          <span className="font-bold text-[#FF4D26]">
            ({hoveredPixel.x}, {hoveredPixel.y})
          </span>
          {hoveredPixel.pixel ? (
            <>
              <span className="text-zinc-300">·</span>
              <span
                className="w-2.5 h-2.5 rounded-sm border border-black/10 shrink-0"
                style={{ backgroundColor: hoveredPixel.pixel.color }}
              />
              <span className="text-zinc-500 font-medium">
                {shortAddress(hoveredPixel.pixel.author, 4)}
              </span>
            </>
          ) : (
            <span className="text-zinc-400">Empty</span>
          )}
        </div>
      )}
    </div>
  );
};
