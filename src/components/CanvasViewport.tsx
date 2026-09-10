import React from 'react';
import { ToolMode } from '../types/canvas';

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toolMode: ToolMode;
  scale: number;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: () => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  canvasRef,
  toolMode,
  scale,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
}) => {
  const getCursorStyle = () => {
    switch (toolMode) {
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

      {/* Subtle top info hint */}
      <div className="absolute top-16 left-4 pointer-events-none z-10 flex items-center gap-2 font-[var(--font-mono)] text-[11px] text-zinc-500 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200/80 shadow-subtle">
        <span className="font-semibold text-brand-600">Click & Drag to Paint (10ms)</span>
        <span className="text-zinc-300">·</span>
        <span>Middle-Click / Shift+Drag to Pan</span>
        <span className="text-zinc-300">·</span>
        <span>Zoom: {Math.round(scale * 10) / 10}x</span>
      </div>
    </div>
  );
};
