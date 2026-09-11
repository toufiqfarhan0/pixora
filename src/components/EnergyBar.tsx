'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface EnergyBarProps {
  energy: number;
  maxEnergy: number;
  isRecharging: boolean;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  energy,
  maxEnergy,
  isRecharging,
}) => {
  const percentage = (energy / maxEnergy) * 100;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200/90 shadow-subtle text-xs font-[var(--font-mono)]">
      <div className="flex items-center gap-1 font-semibold text-[#FF4D26]">
        <Zap className={`h-3.5 w-3.5 ${isRecharging ? 'animate-pulse text-amber-500' : 'text-[#FF4D26]'}`} />
        <span>
          {energy}/{maxEnergy}
        </span>
      </div>

      {/* Energy Meter Bar */}
      <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60 shrink-0">
        <div
          className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-orange-400 to-[#FF4D26]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-[10px] text-zinc-400 font-sans hidden sm:inline">
        {energy === maxEnergy
          ? 'Full (10ms ER)'
          : isRecharging
          ? 'Recharging...'
          : 'Ready'}
      </span>
    </div>
  );
};
