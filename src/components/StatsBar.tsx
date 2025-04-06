import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface StatsBarProps {
  totalPL: number;
  winRate: number;
  trades: number;
}

function StatsBar({ totalPL, winRate, trades }: StatsBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
      <div className="bg-[#1A1A1A] rounded-lg p-6">
        <div className="text-sm text-gray-400 mb-2">Total P/L</div>
        <div className="text-3xl md:text-4xl font-bold text-green-400">
          ${totalPL.toLocaleString()}
        </div>
      </div>
      <div className="bg-[#1A1A1A] rounded-lg p-6 grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-400 mb-2">NAIROBI</div>
          <div className="text-lg md:text-xl">{format(currentTime, 'h:mm a')}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-2">Win Rate</div>
          <div className="text-lg md:text-xl">{winRate}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-2">Trades</div>
          <div className="text-lg md:text-xl">{trades}</div>
        </div>
      </div>
    </div>
  );
}

export default StatsBar;