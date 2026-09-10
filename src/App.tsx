'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Navbar } from './components/Navbar';
import { CanvasViewport } from './components/CanvasViewport';
import { Toolbar } from './components/Toolbar';
import { TelemetryHUD } from './components/TelemetryHUD';
import { ActivitySidebar } from './components/ActivitySidebar';
import { CommitModal } from './components/CommitModal';
import { PixelInspectorModal } from './components/PixelInspectorModal';
import { LandingHero } from './components/LandingHero';
import { HowItWorksPage } from './components/HowItWorksPage';
import { useCanvas } from './hooks/useCanvas';
import { useMagicBlockER } from './hooks/useMagicBlockER';
import { useRealtimeMultiplayer } from './hooks/useRealtimeMultiplayer';
import { ToolMode, Pixel, AuthMode } from './types/canvas';
import { DEFAULT_COLOR } from './lib/palette';

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 128;

export const App: React.FC = () => {
  // Navigation View: 'landing' | 'canvas' | 'how-it-works'
  const [currentView, setCurrentView] = useState<'landing' | 'canvas' | 'how-it-works'>('landing');

  // Privy Web3 Authentication (MetaMask verified)
  const { ready, authenticated, user, login, logout } = usePrivy();

  const solanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && (account as any).chainType === 'solana'
  );
  const userAddress = authenticated
    ? ((solanaWallet && 'address' in solanaWallet ? (solanaWallet as any).address : null) ??
      user?.wallet?.address ??
      null)
    : null;

  const loginMethod = authenticated
    ? (user?.wallet?.walletClientType === 'metamask'
        ? 'MetaMask'
        : user?.wallet?.walletClientType === 'phantom'
        ? 'Phantom'
        : solanaWallet
        ? 'Solana Wallet'
        : 'MetaMask Verified')
    : null;

  const authMode: AuthMode = 'live';

  // Canvas interaction state
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);

  // Clean empty starter canvas ready for real painters
  const initialPixels = useMemo<Pixel[]>(() => [], []);

  // MagicBlock Ephemeral Rollup hook
  const {
    telemetry,
    activities,
    streamPixel,
    recordRemotePixel,
    commitToSolanaL1,
    isCommitting,
    lastCommitResult,
  } = useMagicBlockER({
    userAddress,
    authMode,
  });

  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  // Real-time peer cursors & multiplayer sync across tabs and windows
  const { remotePeers, broadcastCursor, broadcastPixel, peerCount } = useRealtimeMultiplayer({
    userAddress,
    selectedColor,
    onRemotePaint: (pixel) => {
      setRemotePixel(pixel);
      recordRemotePixel(pixel);
    },
  });

  // Local placement callback
  const handlePixelPlaced = useCallback(
    (x: number, y: number, color: string) => {
      if (!authenticated) {
        setWelcomeToast('🔒 Connect your MetaMask wallet via Privy to place pixels on Solana ER!');
        setTimeout(() => setWelcomeToast(null), 4000);
        if (ready) login();
        return;
      }
      const newPixel = streamPixel(x, y, color);
      broadcastPixel(newPixel);
    },
    [authenticated, ready, login, streamPixel, broadcastPixel]
  );

  const [inspectedPixel, setInspectedPixel] = useState<{
    x: number;
    y: number;
    pixel: Pixel | null;
  } | null>(null);

  const handleInspectPixel = useCallback((x: number, y: number, pixel: Pixel | null) => {
    setInspectedPixel({ x, y, pixel });
  }, []);

  // Canvas engine hook
  const {
    canvasRef,
    scale,
    offset,
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
    onInspectPixel: handleInspectPixel,
    initialPixels,
    onCursorMove: broadcastCursor,
  });

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.3, 48));
  const handleZoomOut = () => setScale((s) => Math.max(s * 0.7, 1.5));

  // Convert pixelsMap to array
  const allPixelsArray = useMemo(() => Array.from(pixelsMap.values()), [pixelsMap]);

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

  const handleOpenPrivyModal = useCallback(() => {
    if (ready) login();
  }, [ready, login]);

  const handleDisconnect = useCallback(() => {
    logout();
    setWelcomeToast('⚡ Disconnected. Connect your wallet via Privy to paint.');
    setTimeout(() => setWelcomeToast(null), 3500);
  }, [logout]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-base)] flex flex-col font-[var(--font-body)]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenCommit={() => {
          if (!authenticated) {
            setWelcomeToast('🔒 Connect your MetaMask wallet to commit to Solana L1!');
            setTimeout(() => setWelcomeToast(null), 4000);
            if (ready) login();
            return;
          }
          setIsCommitModalOpen(true);
        }}
        onOpenWalletModal={handleOpenPrivyModal}
        onDisconnect={handleDisconnect}
        userAddress={userAddress}
        loginMethod={loginMethod}
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
              onOpenWalletModal={handleOpenPrivyModal}
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
                offset={offset}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                handlePointerDown={handlePointerDown}
                handlePointerMove={handlePointerMove}
                handlePointerUp={handlePointerUp}
                remoteCursors={remotePeers}
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

            {/* Bottom-left Telemetry HUD */}
            <TelemetryHUD telemetry={telemetry} hoveredPixel={hoveredPixel} />

            {/* Top-right Activity Stream Sidebar */}
            <ActivitySidebar
              activities={activities}
              totalPixels={allPixelsArray.length}
              userAddress={userAddress}
              authMode={authMode}
              loginMethod={loginMethod}
            />
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {welcomeToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-popover flex items-center gap-2 border border-zinc-700/80 animate-fade-in font-[var(--font-body)]">
          <span className="w-2 h-2 rounded-full bg-[#FF4D26] animate-pulse shrink-0" />
          <span>{welcomeToast}</span>
        </div>
      )}

      {/* Commit to L1 Modal */}
      <CommitModal
        isOpen={isCommitModalOpen}
        onClose={() => setIsCommitModalOpen(false)}
        pixels={allPixelsArray}
        onCommit={commitToSolanaL1}
        isCommitting={isCommitting}
        lastCommitResult={lastCommitResult}
        authMode={authMode}
        onOpenPrivyModal={handleOpenPrivyModal}
      />

      {/* Pixel Provenance Inspector Modal */}
      {inspectedPixel && (
        <PixelInspectorModal
          isOpen={true}
          onClose={() => setInspectedPixel(null)}
          pixel={inspectedPixel.pixel}
          x={inspectedPixel.x}
          y={inspectedPixel.y}
          onSelectColor={setSelectedColor}
        />
      )}
    </div>
  );
};
