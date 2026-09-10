'use client';

import React from 'react';
import { RemoteCursor } from '../hooks/useRealtimeMultiplayer';

interface MultiplayerCursorsProps {
  cursors: RemoteCursor[];
  scale: number;
  offset: { x: number; y: number };
}

export const MultiplayerCursors: React.FC<MultiplayerCursorsProps> = ({
  cursors,
  scale,
  offset,
}) => {
  // Only render when real peers are actually connected
  if (!cursors || cursors.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {cursors.map((cursor) => {
        // Convert grid coordinate to viewport pixel position
        const screenX = offset.x + cursor.x * scale + scale / 2;
        const screenY = offset.y + cursor.y * scale + scale / 2;

        return (
          <div
            key={cursor.id}
            className="absolute transition-all duration-100 ease-out flex flex-col items-start"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
            }}
          >
            {/* SVG Cursor Pointer */}
            <svg
              className="w-5 h-5 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: cursor.color || '#FF4D26' }}
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill="currentColor"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </svg>

            {/* Floating User Badge */}
            <div
              className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-white shadow-sm border border-white/40 whitespace-nowrap"
              style={{ backgroundColor: cursor.color || '#FF4D26' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{cursor.name}</span>
              {cursor.isDrawing && (
                <span className="text-[9px] bg-black/20 px-1 rounded font-sans font-bold">draw</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
