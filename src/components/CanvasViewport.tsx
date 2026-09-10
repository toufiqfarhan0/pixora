'use client';

import React from 'react';
import { ToolMode } from '../types/canvas';
import { MultiplayerCursors } from './MultiplayerCursors';
import { RemoteCursor } from '../hooks/useRealtimeMultiplayer';

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toolMode: ToolMode;
  scale: number;
  offset: { x: number; y: number };
  width: number;
  height: number;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: () => void;
  remoteCursors?: RemoteCursor[];
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
}) => {
  const getCursorStyle = () => {
    switch (toolMode) {
      case 'inspect':
        return 'cursor-help';
      case 'picker':
        return 'cursor-crosshair';
      case 'eraser':
        return 'cursor-cell';
      case 'brush':
      case 'pen':
      default:
        return 'cursor-crosshair';
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden light-cyber-grid bg-slate-100/60 ${getCursorStyle()}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="pixel-canvas absolute inset-0 w-full h-full" />

      {/* Real Live Multiplayer Cursors Overlay (zero hardcoding, only real connected users) */}
      <MultiplayerCursors
        cursors={remoteCursors}
        scale={scale}
        offset={offset}
      />

      {/* Subtle top info hint */}
      <div className="absolute top-16 left-4 pointer-events-none z-10 flex items-center gap-2 font-[var(--font-mono)] text-[11px] text-zinc-500 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200/80 shadow-subtle">
        <span className="font-semibold text-brand-600">
          {toolMode === 'inspect'
            ? '🔍 Click any pixel to inspect onchain author & tx'
            : '⚡ Click & Drag to Paint (10ms)'}
        </span>
        <span className="text-zinc-300">·</span>
        <span>Middle-Click / Shift+Drag to Pan</span>
        <span className="text-zinc-300">·</span>
        <span>Zoom: {Math.round(scale * 10) / 10}x</span>
        <span className="text-zinc-300">·</span>
        <span className="flex items-center gap-1 text-[#FF4D26] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D26] animate-pulse" />
          {remoteCursors.length > 0
            ? `${remoteCursors.length + 1} Artists Active`
            : 'Multiplayer Ready'}
        </span>
      </div>
    </div>
  );
};
