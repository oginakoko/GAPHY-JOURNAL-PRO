import { 
  CircleDollarSign,
  BarChart2,
  Target,
  ArrowRightLeft,
  PiggyBank,
  LogOut,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  Minus
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface TradingStatsProps {
  initialBalance: number;
  currentEquity: number;
  roi: number;
  totalPL: number;
  winRate: number;
  totalTrades: number;
  averagePL: number;
  withdrawals: number;
  deposits: number;
  winningTrades: number;
  losingTrades: number;
  breakEven: number;
}

function TradingStats({
  initialBalance,
  currentEquity,
  roi,
  totalPL,
  winRate,
  totalTrades,
  averagePL,
  withdrawals,
  deposits,
  winningTrades,
  losingTrades,
  breakEven
}: TradingStatsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#1A1A1A] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <CircleDollarSign className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm text-gray-400">Account Summary</h2>
        </div>

        <div className="grid gap-6">
          {/* Initial Balance & Current Equity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-gray-400 block mb-2">Initial Balance</span>
              <div className="text-xl font-semibold text-blue-400">
                <AnimatedNumber value={initialBalance} prefix="$" />
              </div>
            </div>
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-gray-400 block mb-2">Current Equity</span>
              <div className="text-xl font-semibold">
                <AnimatedNumber value={currentEquity} prefix="$" />
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-[#252525] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">ROI</span>
              <Percent className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">
              <AnimatedNumber value={roi} suffix="%" />
            </div>
          </div>

          {/* Deposits & Withdrawals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252525] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Deposits</span>
              </div>
              <div className="text-lg font-semibold text-green-400">
                +<AnimatedNumber value={deposits} prefix="$" />
              </div>
            </div>
            <div className="bg-[#252525] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Withdrawals</span>
              </div>
              <div className="text-lg font-semibold text-red-400">
                -<AnimatedNumber value={withdrawals} prefix="$" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm text-gray-400">Performance</h2>
        </div>

        <div className="grid gap-6">
          {/* Total P/L & Average P/L */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252525] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total P/L</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-xl font-semibold text-green-400">
                <AnimatedNumber value={totalPL} prefix="$" />
              </div>
            </div>
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-gray-400 block mb-2">Average P/L</span>
              <div className={`text-xl font-semibold ${averagePL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <AnimatedNumber value={averagePL} prefix="$" />
              </div>
            </div>
          </div>

          {/* Trade Stats */}
          <div className="bg-[#252525] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightLeft className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Trade Distribution</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <div className="text-lg font-semibold text-green-400">{winningTrades}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Winning</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-400" />
                  <div className="text-lg font-semibold text-red-400">{losingTrades}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Losing</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Minus className="w-3 h-3 text-gray-400" />
                  <div className="text-lg font-semibold text-gray-400">{breakEven}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Break Even</div>
              </div>
            </div>
          </div>

          {/* Win Rate & Total Trades */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-gray-400 block mb-2">Win Rate</span>
              <div className="text-xl font-semibold text-green-400">
                <AnimatedNumber value={winRate} suffix="%" />
              </div>
            </div>
            <div className="bg-[#252525] rounded-lg p-4">
              <span className="text-sm text-gray-400 block mb-2">Total Trades</span>
              <div className="text-xl font-semibold">
                <AnimatedNumber value={totalTrades} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradingStats;
