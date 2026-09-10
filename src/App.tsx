'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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

  // Official Privy Web3 Authentication
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Dynamic user address from connected wallet (strictly real, never hardcoded)
  const userAddress = authenticated ? (user?.wallet?.address ?? null) : null;

  const loginMethod = authenticated
    ? (user?.wallet?.walletClientType === 'metamask'
        ? 'MetaMask'
        : user?.wallet?.walletClientType === 'phantom'
        ? 'Phantom'
        : user?.wallet?.walletClientType === 'solflare'
        ? 'Solflare'
        : user?.wallet?.chainType === 'solana'
        ? 'Solana'
        : 'Wallet Verified')
    : null;

  const authMode: AuthMode = 'live';

  // Canvas interaction state
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

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

  // Fast recharging stroke energy (allows fluid drag-painting)
  const maxEnergy = 30;
  const [energy, setEnergy] = useState<number>(30);
  const isRecharging = energy < maxEnergy;
  const lastEnergyDeductTimeRef = useRef(0);

  useEffect(() => {
    if (energy >= maxEnergy) return;
    const timer = setTimeout(() => {
      setEnergy((prev) => Math.min(prev + 1, maxEnergy));
    }, 800);
    return () => clearTimeout(timer);
  }, [energy, maxEnergy]);

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
        setWelcomeToast('🔒 Connect your wallet via Privy to place pixels on Solana ER!');
        setTimeout(() => setWelcomeToast(null), 4000);
        if (ready) login();
        return;
      }
      const now = Date.now();
      // Deduct stroke energy smoothly during continuous drag (at most once every 350ms of active dragging)
      if (now - lastEnergyDeductTimeRef.current > 350) {
        if (energy <= 0) {
          setWelcomeToast('⚡ Energy recharging! Ready in a moment...');
          setTimeout(() => setWelcomeToast(null), 2500);
          return;
        }
        lastEnergyDeductTimeRef.current = now;
        setEnergy((prev) => Math.max(0, prev - 1));
      }

      const newPixel = streamPixel(x, y, color);
      broadcastPixel(newPixel);
    },
    [authenticated, ready, login, energy, streamPixel, broadcastPixel]
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
    allPixels,
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
    showHeatmap,
  });

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.3, 48));
  const handleZoomOut = () => setScale((s) => Math.max(s * 0.7, 1.5));

  // Direct reactive array of all placed canvas pixels
  const allPixelsArray = allPixels;

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

  const handleOpenWalletModal = useCallback(() => {
    if (ready) login();
  }, [ready, login]);

  const handleDisconnect = useCallback(() => {
    logout();
    setWelcomeToast('⚡ Disconnected wallet.');
    setTimeout(() => setWelcomeToast(null), 3000);
  }, [logout]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-base)] flex flex-col font-[var(--font-body)]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenCommit={() => {
          if (!authenticated) {
            setWelcomeToast('🔒 Connect your wallet to commit to Solana L1!');
            setTimeout(() => setWelcomeToast(null), 4000);
            if (ready) login();
            return;
          }
          setIsCommitModalOpen(true);
        }}
        onOpenWalletModal={handleOpenWalletModal}
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
              onOpenWalletModal={handleOpenWalletModal}
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
                hoveredPixel={hoveredPixel}
                showHeatmap={showHeatmap}
              />
            </main>

            {/* Floating Bottom Toolbar (Unified stack: EnergyBar -> Palette -> Tools) */}
            <Toolbar
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              toolMode={toolMode}
              onSelectTool={setToolMode}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={centerCanvas}
              onExportPNG={handleExportPNG}
              showHeatmap={showHeatmap}
              onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
              energy={energy}
              maxEnergy={maxEnergy}
              isRecharging={isRecharging}
            />

            {/* Bottom-left Telemetry HUD */}
            <TelemetryHUD telemetry={telemetry} hoveredPixel={hoveredPixel} loginMethod={loginMethod} />

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
        onOpenPrivyModal={handleOpenWalletModal}
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
