import React, { useState, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CanvasViewport } from './components/CanvasViewport';
import { Toolbar } from './components/Toolbar';
import { TelemetryHUD } from './components/TelemetryHUD';
import { ActivitySidebar } from './components/ActivitySidebar';
import { CommitModal } from './components/CommitModal';
import { LandingHero } from './components/LandingHero';
import { HowItWorksPage } from './components/HowItWorksPage';
import { PrivyWalletModal } from './components/PrivyWalletModal';
import { useCanvas } from './hooks/useCanvas';
import { useMagicBlockER } from './hooks/useMagicBlockER';
import { ToolMode, Pixel, AuthMode } from './types/canvas';
import { DEFAULT_COLOR } from './lib/palette';

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 128;

// Create starter pixel art (MagicBlock "M" + Solana gradient emblem in center)
function createInitialArt(): Pixel[] {
  const pixels: Pixel[] = [];
  const cx = 64;
  const cy = 64;

  // Simple emblem pattern around center
  const pattern = [
    // Top bar
    { x: -8, y: -8, c: '#FF4D26' }, { x: -7, y: -8, c: '#FF4D26' }, { x: -6, y: -8, c: '#FF4D26' },
    { x: 6, y: -8, c: '#4F46E5' }, { x: 7, y: -8, c: '#4F46E5' }, { x: 8, y: -8, c: '#4F46E5' },
    // Solana slant 1
    { x: -5, y: -4, c: '#14F195' }, { x: -4, y: -4, c: '#14F195' }, { x: -3, y: -4, c: '#14F195' },
    { x: -2, y: -4, c: '#00FF94' }, { x: -1, y: -4, c: '#00FF94' }, { x: 0, y: -4, c: '#00FF94' },
    { x: 1, y: -4, c: '#00FF94' }, { x: 2, y: -4, c: '#00FF94' }, { x: 3, y: -4, c: '#14F195' },
    { x: 4, y: -4, c: '#14F195' }, { x: 5, y: -4, c: '#14F195' },
    // Solana slant 2
    { x: -4, y: 0, c: '#4F46E5' }, { x: -3, y: 0, c: '#4F46E5' }, { x: -2, y: 0, c: '#4F46E5' },
    { x: -1, y: 0, c: '#FF4D26' }, { x: 0, y: 0, c: '#FF4D26' }, { x: 1, y: 0, c: '#FF4D26' },
    { x: 2, y: 0, c: '#FF4D26' }, { x: 3, y: 0, c: '#4F46E5' }, { x: 4, y: 0, c: '#4F46E5' },
    // Solana slant 3
    { x: -5, y: 4, c: '#14F195' }, { x: -4, y: 4, c: '#14F195' }, { x: -3, y: 4, c: '#14F195' },
    { x: -2, y: 4, c: '#00FF94' }, { x: -1, y: 4, c: '#00FF94' }, { x: 0, y: 4, c: '#00FF94' },
    { x: 1, y: 4, c: '#00FF94' }, { x: 2, y: 4, c: '#00FF94' }, { x: 3, y: 4, c: '#14F195' },
    { x: 4, y: 4, c: '#14F195' }, { x: 5, y: 4, c: '#14F195' },
    // Bottom dots
    { x: -8, y: 8, c: '#FF4D26' }, { x: -7, y: 8, c: '#FF4D26' }, { x: -6, y: 8, c: '#FF4D26' },
    { x: 6, y: 8, c: '#4F46E5' }, { x: 7, y: 8, c: '#4F46E5' }, { x: 8, y: 8, c: '#4F46E5' },
  ];

  pattern.forEach((p) => {
    pixels.push({
      x: cx + p.x,
      y: cy + p.y,
      color: p.c,
      author: 'Genesis ER',
      timestamp: Date.now() - 100000,
      isERConfirmed: true,
      isVerified: true,
    });
  });

  return pixels;
}

export const App: React.FC = () => {
  // Navigation View: 'landing' | 'canvas' | 'how-it-works'
  const [currentView, setCurrentView] = useState<'landing' | 'canvas' | 'how-it-works'>('landing');

  // Mode: 'guest' (Instant Free Canvas) vs 'live' (Privy Verified)
  const initialGuestAddress = useMemo(
    () => 'Guest_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    []
  );
  const [authMode, setAuthMode] = useState<AuthMode>('guest');
  const [userAddress, setUserAddress] = useState<string>(initialGuestAddress);
  const [loginMethod, setLoginMethod] = useState<string | null>(null);

  // Canvas interaction state
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Initial starter art
  const initialPixels = useMemo(() => createInitialArt(), []);

  // MagicBlock Ephemeral Rollup hook
  const {
    telemetry,
    activities,
    streamPixel,
    commitToSolanaL1,
    isCommitting,
    lastCommitResult,
  } = useMagicBlockER({
    userAddress,
    authMode,
    onRemotePixel: (p) => {
      setRemotePixel(p);
    },
  });

  // Local placement callback
  const handlePixelPlaced = useCallback(
    (x: number, y: number, color: string) => {
      streamPixel(x, y, color);
    },
    [streamPixel]
  );

  // Canvas engine hook
  const {
    canvasRef,
    scale,
    hoveredPixel,
    pixelsMap,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    centerCanvas,
    setScale,
    setRemotePixel,
  } = useCanvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    selectedColor,
    toolMode,
    onPixelPlaced: handlePixelPlaced,
    initialPixels,
  });

  // Convert pixelsMap to array
  const allPixelsArray = useMemo(() => Array.from(pixelsMap.values()), [pixelsMap, telemetry.txCount]);

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(s * 1.3, 48));
  const handleZoomOut = () => setScale((s) => Math.max(s * 0.7, 1.5));

  // Export Canvas PNG
  const handleExportPNG = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CANVAS_WIDTH;
    exportCanvas.height = CANVAS_HEIGHT;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    pixelsMap.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 1, 1);
    });

    const url = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixora-canvas-${Date.now()}.png`;
    a.click();
  };

  const handleWalletConnected = (address: string, method: string) => {
    setUserAddress(address);
    setLoginMethod(method);
    setAuthMode('live');
  };

  const handleDisconnect = () => {
    setUserAddress(initialGuestAddress);
    setLoginMethod(null);
    setAuthMode('guest');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-base)] flex flex-col font-[var(--font-body)]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenCommit={() => setIsCommitModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        userAddress={userAddress}
        authMode={authMode}
        isCommitting={isCommitting}
      />

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] mt-14 overflow-hidden">
        {/* Landing Page View */}
        {currentView === 'landing' && (
          <div className="w-full h-full overflow-y-auto">
            <LandingHero
              onLaunchCanvas={() => setCurrentView('canvas')}
              onOpenHowItWorks={() => setCurrentView('how-it-works')}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              userAddress={userAddress}
            />
          </div>
        )}

        {/* How It Works Page View */}
        {currentView === 'how-it-works' && (
          <div className="w-full h-full overflow-y-auto">
            <HowItWorksPage
              onBackToLanding={() => setCurrentView('landing')}
              onLaunchCanvas={() => setCurrentView('canvas')}
            />
          </div>
        )}

        {/* Live Canvas View */}
        {currentView === 'canvas' && (
          <div className="relative w-full h-full overflow-hidden">
            <main className="w-full h-full">
              <CanvasViewport
                canvasRef={canvasRef}
                toolMode={toolMode}
                scale={scale}
                handlePointerDown={handlePointerDown}
                handlePointerMove={handlePointerMove}
                handlePointerUp={handlePointerUp}
              />
            </main>

            {/* Floating Bottom Toolbar */}
            <Toolbar
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              toolMode={toolMode}
              onSelectTool={setToolMode}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={centerCanvas}
              onExportPNG={handleExportPNG}
            />

            {/* Bottom-left Telemetry HUD (Judge Highlight!) */}
            <TelemetryHUD telemetry={telemetry} hoveredPixel={hoveredPixel} />

            {/* Top-right Activity Stream Sidebar */}
            <ActivitySidebar activities={activities} totalPixels={allPixelsArray.length} />
          </div>
        )}
      </div>

      {/* Privy-style Embedded Wallet Auth Modal */}
      <PrivyWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnected={handleWalletConnected}
      />

      {/* Commit to L1 Modal */}
      <CommitModal
        isOpen={isCommitModalOpen}
        onClose={() => setIsCommitModalOpen(false)}
        pixels={allPixelsArray}
        onCommit={commitToSolanaL1}
        isCommitting={isCommitting}
        lastCommitResult={lastCommitResult}
        authMode={authMode}
        onOpenPrivyModal={() => setIsWalletModalOpen(true)}
      />
    </div>
  );
};
