import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Wallet,
  CircleDollarSign,
  BarChart2,
  Award,
  ArrowRightLeft
} from 'lucide-react';
import { fadeInUp } from '../utils/animations';

interface StatsBarProps {
  winRate: number;
  trades: number;
  withdrawals: number;
  equity: number;
  deposits: number;
  initialBalance: number;
  roi: number;
}

function StatsBar({ winRate, trades, withdrawals, equity, deposits, initialBalance, roi }: StatsBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateSessionProgress = (start: number, end: number) => {
    const currentHour = currentTime.getUTCHours();
    const currentMinute = currentTime.getUTCMinutes();
    const currentTimeInMinutes = (currentHour * 60) + currentMinute;
    const startTimeInMinutes = start * 60;
    const endTimeInMinutes = end * 60;
    // Handle sessions that cross midnight
    if (start > end) {
      const totalMinutes = (24 * 60) - startTimeInMinutes + endTimeInMinutes;
      let progress = 0;
      if (currentTimeInMinutes >= startTimeInMinutes) {
        progress = ((currentTimeInMinutes - startTimeInMinutes) / totalMinutes) * 100;
      } else if (currentTimeInMinutes < endTimeInMinutes) {
        progress = (((24 * 60) - startTimeInMinutes + currentTimeInMinutes) / totalMinutes) * 100;
      }
      return Math.min(Math.max(progress, 0), 100);
    }
    // Regular sessions
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      const totalMinutes = endTimeInMinutes - startTimeInMinutes;
      const elapsedMinutes = currentTimeInMinutes - startTimeInMinutes;
      const progress = (elapsedMinutes / totalMinutes) * 100;
      return Math.min(Math.max(progress, 0), 100);
    }
    return 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      {/* Account Summary Card */}
      <div className="bg-[#1A1A1A] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm text-white/90">Account Summary</h3>
        </div>

        <div className="grid gap-6">
          {/* Main Metric */}
          <div className="bg-[#252525] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">Current Equity</span>
              <CircleDollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">${equity.toLocaleString()}</div>
          </div>

          {/* Initial Balance */}
          <div className="bg-[#252525] rounded-lg p-4">
            <span className="text-sm text-white/90 block mb-2">Initial Balance</span>
            <div className="text-xl font-semibold text-blue-400">${initialBalance.toLocaleString()}</div>
          </div>

          {/* Deposits & Withdrawals Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-white/90 block mb-2">Deposits</span>
              <div className="text-lg font-semibold text-green-400">+${deposits.toLocaleString()}</div>
            </div>
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-white/90 block mb-2">Withdrawn</span>
              <div className="text-lg font-semibold text-red-400">-${withdrawals.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Card */}
      <div className="bg-[#1A1A1A] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm text-white/90">Performance Metrics</h3>
        </div>

        <div className="grid gap-6">
          {/* Main Metric */}
          <div className="bg-[#252525] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">Total P/L</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {roi.toFixed(2)}
              <span className="text-white/80">%</span>
            </div>
          </div>

          {/* Trades & Win Rate Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252525] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/90">Trades</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {trades.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#252525] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white/90">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {winRate}
                <span className="text-white/80">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Hours Card */}
      <motion.div
        variants={fadeInUp}
        className="bg-[#1A1A1A] rounded-lg p-6"
      >
        <div className="text-sm text-white/90 font-medium">Market Hours</div>
        <div className="grid gap-3 h-[calc(100%-2rem)]">
          {[
            { name: 'Sydney', start: 22, end: 6, color: 'from-pink-500/20' },
            { name: 'Tokyo', start: 0, end: 8, color: 'from-yellow-500/20' },
            { name: 'London', start: 8, end: 16, color: 'from-blue-500/20' },
            { name: 'New York', start: 13, end: 21, color: 'from-green-500/20' }
          ].map((session) => {
            const currentHour = currentTime.getUTCHours();
            const currentMinute = currentTime.getUTCMinutes();
            const currentTimeInMinutes = (currentHour * 60) + currentMinute;
            const startTimeInMinutes = session.start * 60;
            const endTimeInMinutes = session.end * 60;
            let isActive = false;
            if (session.start > session.end) {
              isActive = currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes;
            } else {
              isActive = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
            }
            const progress = isActive ? calculateSessionProgress(session.start, session.end) : 0;
            
            return (
              <div
                key={session.name}
                className={`relative h-full min-h-[4rem] rounded-lg overflow-hidden border border-gray-700 
                  transition-all duration-300 will-change-transform transform-gpu ${
                  isActive ? 'bg-gradient-to-r ' + session.color : 'bg-[#1f1f1f]'
                }`}
                style={{ 
                  boxShadow: isActive ? '0 0 12px 2px rgba(34,197,94,0.2)' : undefined,
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 bottom-0 w-full bg-gradient-to-t from-[rgba(34,197,94,0.1)] to-[rgba(22,163,74,0.2)] transform-gpu"
                    style={{
                      height: `${progress}%`,
                      transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      willChange: 'height',
                    }}
                  />
                )}
                <div className="absolute inset-0 flex flex-col justify-between p-3 z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-white drop-shadow-sm">
                      {session.name}
                    </span>
                    {isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400">
                      {session.start.toString().padStart(2, '0')}:00 - {session.end.toString().padStart(2, '0')}:00
                    </span>
                    {isActive && (
                      <span className="text-xs text-green-400">
                        {Math.round(progress)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StatsBar;