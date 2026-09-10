import { useRef, useEffect, useState, useCallback } from 'react';
import { Pixel, ToolMode } from '../types/canvas';

interface UseCanvasProps {
  width: number;
  height: number;
  selectedColor: string;
  toolMode: ToolMode;
  onPixelPlaced: (x: number, y: number, color: string) => void;
  initialPixels?: Pixel[];
}

export function useCanvas({
  width,
  height,
  selectedColor,
  toolMode,
  onPixelPlaced,
  initialPixels = [],
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // In-memory pixel map: "x,y" => Pixel
  const pixelsRef = useRef<Map<string, Pixel>>(new Map());

  // Viewport transformation: zoom and pan
  const [scale, setScale] = useState<number>(6); // initial zoom factor
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number; pixel?: Pixel } | null>(null);

  const isPanningRef = useRef(false);
  const isDrawingRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPlacedRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize pixels
  useEffect(() => {
    if (initialPixels.length > 0 && pixelsRef.current.size === 0) {
      initialPixels.forEach((p) => {
        pixelsRef.current.set(`${p.x},${p.y}`, p);
      });
      requestRender();
    }
  }, [initialPixels]);

  // Request high-performance redraw
  const animFrameRef = useRef<number | null>(null);

  const requestRender = useCallback(() => {
    if (animFrameRef.current) return;
    animFrameRef.current = requestAnimationFrame(() => {
      animFrameRef.current = null;
      renderCanvas();
    });
  }, [scale, offset, hoveredPixel]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background (Clean modern light viewport)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Apply pan and zoom
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw canvas board base (Crisp white canvas area)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw border around the 128x128 bounds
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
    ctx.lineWidth = 1 / scale;
    ctx.strokeRect(0, 0, width, height);

    // Draw placed pixels
    pixelsRef.current.forEach((pixel) => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    });

    // Draw grid lines when zoomed in sufficiently
    if (scale >= 5) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.lineWidth = 0.5 / scale;

      ctx.beginPath();
      for (let x = 0; x <= width; x++) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y++) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    // Draw hovered pixel outline
    if (hoveredPixel && hoveredPixel.x >= 0 && hoveredPixel.x < width && hoveredPixel.y >= 0 && hoveredPixel.y < height) {
      ctx.strokeStyle = toolMode === 'eraser' ? '#EF4444' : selectedColor;
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeRect(hoveredPixel.x, hoveredPixel.y, 1, 1);

      // Draw faint highlight inside
      ctx.fillStyle = toolMode === 'eraser' ? 'rgba(239, 68, 68, 0.2)' : `${selectedColor}33`;
      ctx.fillRect(hoveredPixel.x, hoveredPixel.y, 1, 1);
    }

    ctx.restore();
    ctx.restore();
  }, [width, height, scale, offset, hoveredPixel, selectedColor, toolMode]);

  useEffect(() => {
    requestRender();
  }, [requestRender]);

  // Screen coords to Canvas grid coords
  const screenToGrid = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const rawX = (clientX - rect.left - offset.x) / scale;
      const rawY = (clientY - rect.top - offset.y) / scale;

      const gridX = Math.floor(rawX);
      const gridY = Math.floor(rawY);

      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        return { x: gridX, y: gridY };
      }
      return null;
    },
    [offset, scale, width, height]
  );

  // Apply brush stroke
  const applyPixelAction = useCallback(
    (gridX: number, gridY: number) => {
      if (lastPlacedRef.current?.x === gridX && lastPlacedRef.current?.y === gridY) {
        return;
      }
      lastPlacedRef.current = { x: gridX, y: gridY };

      if (toolMode === 'eraser') {
        pixelsRef.current.delete(`${gridX},${gridY}`);
        onPixelPlaced(gridX, gridY, '#FFFFFF');
      } else if (toolMode === 'brush') {
        // 3x3 brush radius
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const bx = gridX + dx;
            const by = gridY + dy;
            if (bx >= 0 && bx < width && by >= 0 && by < height) {
              const p: Pixel = {
                x: bx,
                y: by,
                color: selectedColor,
                author: 'Me',
                timestamp: Date.now(),
                isERConfirmed: true,
              };
              pixelsRef.current.set(`${bx},${by}`, p);
              onPixelPlaced(bx, by, selectedColor);
            }
          }
        }
      } else {
        // Standard pen
        const p: Pixel = {
          x: gridX,
          y: gridY,
          color: selectedColor,
          author: 'Me',
          timestamp: Date.now(),
          isERConfirmed: true,
        };
        pixelsRef.current.set(`${gridX},${gridY}`, p);
        onPixelPlaced(gridX, gridY, selectedColor);
      }

      requestRender();
    },
    [toolMode, selectedColor, width, height, onPixelPlaced, requestRender]
  );

  // Mouse wheel: Zoom in/out smoothly toward cursor
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;

    setScale((prevScale) => {
      const newScale = Math.min(Math.max(prevScale * zoomFactor, 1.5), 48);
      setOffset((prevOffset) => ({
        x: mouseX - (mouseX - prevOffset.x) * (newScale / prevScale),
        y: mouseY - (mouseY - prevOffset.y) * (newScale / prevScale),
      }));
      return newScale;
    });
  }, []);

  // Pointer Down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 1 || e.shiftKey || e.altKey) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        return;
      }

      if (e.button === 0) {
        const grid = screenToGrid(e.clientX, e.clientY);
        if (grid) {
          if (toolMode === 'picker') {
            const existing = pixelsRef.current.get(`${grid.x},${grid.y}`);
            if (existing) {
              onPixelPlaced(grid.x, grid.y, existing.color);
            }
            return;
          }

          isDrawingRef.current = true;
          applyPixelAction(grid.x, grid.y);
        } else {
          isPanningRef.current = true;
          panStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        }
      }
    },
    [offset, screenToGrid, toolMode, applyPixelAction, onPixelPlaced]
  );

  // Pointer Move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanningRef.current) {
        setOffset({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
        return;
      }

      const grid = screenToGrid(e.clientX, e.clientY);
      if (grid) {
        const existing = pixelsRef.current.get(`${grid.x},${grid.y}`);
        setHoveredPixel({ x: grid.x, y: grid.y, pixel: existing });

        if (isDrawingRef.current) {
          applyPixelAction(grid.x, grid.y);
        }
      } else {
        setHoveredPixel(null);
      }
    },
    [screenToGrid, applyPixelAction]
  );

  // Pointer Up / Leave
  const handlePointerUp = useCallback(() => {
    isPanningRef.current = false;
    isDrawingRef.current = false;
    lastPlacedRef.current = null;
  }, []);

  // External update (from peer or ER sync)
  const setRemotePixel = useCallback(
    (pixel: Pixel) => {
      pixelsRef.current.set(`${pixel.x},${pixel.y}`, pixel);
      requestRender();
    },
    [requestRender]
  );

  // Attach wheel listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Center canvas on first mount
  const centerCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const initialScale = Math.min(rect.width / (width * 1.4), rect.height / (height * 1.4), 8);
    setScale(initialScale);
    setOffset({
      x: (rect.width - width * initialScale) / 2,
      y: (rect.height - height * initialScale) / 2,
    });
  }, [width, height]);

  useEffect(() => {
    centerCanvas();
  }, [centerCanvas]);

  return {
    canvasRef,
    scale,
    offset,
    hoveredPixel,
    pixelsMap: pixelsRef.current,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    centerCanvas,
    setScale,
    setRemotePixel,
    requestRender,
  };
}
