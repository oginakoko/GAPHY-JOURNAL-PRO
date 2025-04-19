import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis,
  BarChart, Bar, ReferenceLine
} from 'recharts';
import { useTradeData } from '../hooks/useTradeData';
import { useAccounts } from '../hooks/useAccounts';
import { 
  ArrowUpRight, Layout, Activity, TrendingUp, 
  Target, BarChart2, TrendingDown 
} from 'lucide-react';
import { MoodGraph } from '../components/MoodGraph';
import { withPageWrapper } from '../components/PageWrapper';
import { MoodType, MOODS } from '../types/mood';
import { Trade } from '../types/trade';

const COLORS = ['#00C49F', '#ff2d78', '#FFBB28', '#FF8042'];
const RADAR_METRICS = ['Win Rate', 'ROI', 'Risk Reward', 'Profit Factor', 'Consistency'];

interface DailyPL {
  [date: string]: number;
}

interface SymbolPerformance {
  [symbol: string]: {
    pl: number;
    trades: number;
  };
}

interface Streak {
  date: string;
  streak: number;
}

interface TimeAnalysis {
  hourlyPerformance: Array<{
    hour: number;
    profit: number;
    trades: number;
  }>;
  streaks: Streak[];
  maxWinStreak: number;
  maxLossStreak: number;
  moodData: Array<{
    date: string;
    mood: MoodType;
    score: number;
  }>;
}

interface TradeWithMood extends Trade {
  mood?: MoodType;
}

function Dashboard() {
  const { trades, loading: tradesLoading } = useTradeData();
  const { totalBalance, loading: accountsLoading } = useAccounts();

  const stats = useMemo(() => {
    if (!trades?.length) return null;

    const tradingTrades = trades.filter(t => !t.deleted && t.type === 'trade');
    if (!tradingTrades.length) return null;

    const winningTrades = tradingTrades.filter(t => t.pl > 0);
    const losingTrades = tradingTrades.filter(t => t.pl < 0);

    const winRate = tradingTrades.length ? (winningTrades.length / tradingTrades.length) * 100 : 0;
    const totalPL = tradingTrades.reduce((sum, t) => sum + (t.pl || 0), 0);
    const avgWin = winningTrades.length ? winningTrades.reduce((sum, t) => sum + t.pl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length ? losingTrades.reduce((sum, t) => sum + t.pl, 0) / losingTrades.length : 0;
    const riskReward = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    const profitFactor = losingTrades.reduce((sum, t) => sum + t.pl, 0) !== 0
      ? Math.abs(winningTrades.reduce((sum, t) => sum + t.pl, 0) / losingTrades.reduce((sum, t) => sum + t.pl, 0))
      : 0;

    const dailyPL = tradingTrades.reduce<DailyPL>((acc, trade) => {
      const date = new Date(trade.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + trade.pl;
      return acc;
    }, {});

    return {
      winRate,
      totalPL,
      riskReward,
      profitFactor,
      dailyPL: Object.entries(dailyPL).map(([date, pl]) => ({ date, pl })),
      pieData: [
        { name: 'Winning', value: winningTrades.length },
        { name: 'Losing', value: losingTrades.length }
      ],
      radarData: [{
        metric: 'Overall',
        'Win Rate': winRate,
        'ROI': (totalPL / totalBalance) * 100,
        'Risk Reward': riskReward * 10,
        'Profit Factor': profitFactor * 10,
        'Consistency': (winRate * riskReward) / 2
      }],
      symbolPerformance: tradingTrades.reduce<SymbolPerformance>((acc, trade) => {
        if (!acc[trade.symbol]) {
          acc[trade.symbol] = { pl: 0, trades: 0 };
        }
        acc[trade.symbol].pl += trade.pl;
        acc[trade.symbol].trades++;
        return acc;
      }, {}),
      kpis: {
        totalTrades: tradingTrades.length,
        winRate: winRate.toFixed(1),
        profitLoss: totalPL.toFixed(2),
        avgWin: avgWin?.toFixed(2) || '0',
        avgLoss: Math.abs(avgLoss)?.toFixed(2) || '0'
      }
    };
  }, [trades, totalBalance]);

  const timeAnalysis = useMemo<TimeAnalysis | null>(() => {
    if (!trades?.length) return null;
    const tradingTrades = trades.filter(t => !t.deleted && t.type === 'trade');

    const hourlyPerformance = Array(24).fill(0).map((_, hour) => ({
      hour,
      profit: 0,
      trades: 0
    }));

    tradingTrades.forEach(trade => {
      const hour = new Date(trade.date).getHours();
      hourlyPerformance[hour].profit += trade.pl;
      hourlyPerformance[hour].trades++;
    });

    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    const streaks: Streak[] = [];

    tradingTrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((trade, index) => {
        if (trade.pl > 0) {
          if (currentStreak >= 0) {
            currentStreak++;
          } else {
            streaks.push({ date: trade.date, streak: currentStreak });
            currentStreak = 1;
          }
          maxWinStreak = Math.max(maxWinStreak, currentStreak);
        } else {
          if (currentStreak <= 0) {
            currentStreak--;
          } else {
            streaks.push({ date: trade.date, streak: currentStreak });
            currentStreak = -1;
          }
          maxLossStreak = Math.min(maxLossStreak, currentStreak);
        }
        if (index === tradingTrades.length - 1) {
          streaks.push({ date: trade.date, streak: currentStreak });
        }
      });

    const moodData = tradingTrades.map(trade => ({
      date: trade.date,
      mood: (trade as TradeWithMood).mood || 'NEUTRAL' as MoodType,
      score: MOODS[(trade as TradeWithMood).mood || 'NEUTRAL'].score
    }));

    return {
      hourlyPerformance,
      streaks,
      maxWinStreak,
      maxLossStreak,
      moodData
    };
  }, [trades]);

  const moodData = useMemo(() => {
    if (!trades?.length) return [];
    
    return trades
      .filter((t): t is TradeWithMood => Boolean((t as TradeWithMood).mood && !t.deleted))
      .map(t => ({
        date: t.date,
        mood: t.mood,
        score: MOODS[t.mood].score,
        pl: t.pl || 0,
        tradeId: t.id,
        source: 'trade' as const
      }));
  }, [trades]);

  const formattedMetrics = useMemo(() => {
    if (!stats) return [];
    
    return RADAR_METRICS.map(metric => ({
      name: metric,
      value: Number(stats.radarData[0][metric as keyof typeof stats.radarData[0]]),
      color: metric === 'Win Rate' ? '#00C49F' :
             metric === 'ROI' ? '#ff2d78' :
             metric === 'Risk Reward' ? '#FFBB28' :
             metric === 'Profit Factor' ? '#FF8042' :
             '#8884d8'
    }));
  }, [stats]);

  if (tradesLoading || accountsLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center text-white/60 py-12">
        No trading data available. Start by adding some trades.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
              <Layout className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Trading Dashboard
              </h1>
              <p className="text-lg text-white/40 mt-2">Your trading performance at a glance</p>
            </div>
          </motion.div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <KpiCard 
              title="Total Trades"
              value={stats.kpis.totalTrades}
              icon={BarChart2}
            />
            <KpiCard 
              title="Win Rate"
              value={`${stats.kpis.winRate}%`}
              icon={Target}
              trend={Number(stats.kpis.winRate) > 50 ? 'up' : 'down'}
            />
            <KpiCard 
              title="Profit/Loss"
              value={`$${stats.kpis.profitLoss}`}
              icon={Activity}
              trend={Number(stats.kpis.profitLoss) > 0 ? 'up' : 'down'}
            />
            <KpiCard 
              title="Avg Win/Loss"
              value={`$${stats.kpis.avgWin}/$${stats.kpis.avgLoss}`}
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit/Loss Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white/90">Profit/Loss Over Time</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyPL}>
                <defs>
                  <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26,26,26,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pl" 
                  stroke="#00C49F" 
                  fill="url(#colorPL)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Trade Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white/90">Trade Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26,26,26,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white/90">Performance Metrics</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {formattedMetrics.map(({ name, value, color }) => (
              <div key={name} className="bg-[#252525]/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">{name}</span>
                  <span className="text-sm font-medium" style={{ color }}>
                    {value.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, value)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Symbol Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white/90">Symbol Performance</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.symbolPerformance)
              .sort(([, a], [, b]) => b.pl - a.pl)
              .slice(0, 5)
              .map(([symbol, data]) => (
                <div key={symbol} className="flex items-center justify-between p-4 bg-[#252525] rounded-lg">
                  <div>
                    <h4 className="font-medium text-white/90">{symbol}</h4>
                    <p className="text-sm text-white/60">{data.trades} trades</p>
                  </div>
                  <div className={`flex items-center gap-2 ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <ArrowUpRight className={`w-4 h-4 ${data.pl < 0 ? 'rotate-90' : ''}`} />
                    <span className="font-medium">${Math.abs(data.pl).toLocaleString()}</span>
                  </div>
                </div>
            ))}
          </div>
        </motion.div>

        {/* Mood Tracking Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white/90">Mood & Performance Correlation</h3>
            </div>
          </div>
          <MoodGraph 
            moodData={moodData} 
            title="Mood & Performance Analysis"
            subtitle={`Based on ${moodData.length} data points`}
          />
        </motion.div>

        {/* Time-of-Day Profitability Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white/90">Hourly Performance</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeAnalysis?.hourlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="rgba(255,255,255,0.5)"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26,26,26,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                  }}
                  formatter={(value: number) => [`$${value}`, 'Profit/Loss']}
                />
                <Bar 
                  dataKey="profit"
                  fill="#00C49F"
                >
                  {(timeAnalysis?.hourlyPerformance || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? '#00C49F' : '#ff2d78'}
                    />
                  ))}
                </Bar>
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Win Streak/Loss Streak Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium text-white/90">Win/Loss Streaks</h3>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="text-white/60">Max Win: {timeAnalysis?.maxWinStreak || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="text-white/60">Max Loss: {timeAnalysis?.maxLossStreak ? Math.abs(timeAnalysis.maxLossStreak) : 0}</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeAnalysis?.streaks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26,26,26,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                  }}
                  formatter={(value: number) => [
                    `${Math.abs(value)} ${value > 0 ? 'Wins' : 'Losses'}`,
                    'Streak'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="streak"
                  stroke="#00C49F"
                  fill="url(#streakGradient)"
                />
                <defs>
                  <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down';
}

function KpiCard({ title, value, icon: Icon, trend }: KpiCardProps) {
  return (
    <div className="bg-[#252525]/50 backdrop-blur-xl rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 text-white/60 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-white">{value}</span>
        {trend && (
          <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        )}
      </div>
    </div>
  );
}

export default withPageWrapper(Dashboard, 'Dashboard');