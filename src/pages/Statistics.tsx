import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line, Cell } from 'recharts';
import { useTradeData } from '../hooks/useTradeData';
import { useAccounts } from '../hooks/useAccounts';
import { ExternalLink, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import TradingStats from '../components/TradingStats';
import TradeCard from '../components/TradeCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  PieChart, 
  ArrowUpRight,
  ChevronRight,
  LineChart,
  DollarSign,
  Percent,
  Target,
  ArrowDownToLine,
  ArrowUpFromLine,
  Calculator,
  Hash,
  Activity
} from 'lucide-react';

function Statistics() {
  const { trades, loading: tradesLoading, error: tradesError } = useTradeData();
  const { totalBalance, loading: accountsLoading, error: accountsError } = useAccounts();
  const activeTrades = trades.filter(t => !t.deleted);

  // Get unique instruments and symbols
  const [selectedInstrument, setSelectedInstrument] = useState('all');
  const [selectedPair, setSelectedPair] = useState('all');

  // Filter trades based on both instrument and symbol
  const filteredTrades = activeTrades.filter(trade => {
    const matchesInstrument = selectedInstrument === 'all' || trade.instrument === selectedInstrument;
    const matchesSymbol = selectedPair === 'all' || trade.symbol.toUpperCase() === selectedPair;
    return matchesInstrument && matchesSymbol;
  });

  // Get available symbols based on selected instrument
  const availableSymbols = Array.from(new Set(
    activeTrades
      .filter(t => t.type === 'trade' && (selectedInstrument === 'all' || t.instrument === selectedInstrument))
      .map(t => t.symbol.toUpperCase())
  )).sort();

  const stats = useMemo(() => {
    // Only include actual trades, not withdrawals or deposits
    const tradingTrades = filteredTrades.filter(t => t.type === 'trade');
    const totalTrades = tradingTrades.length;
    const winningTrades = tradingTrades.filter(t => t.pl > 0).length;
    const losingTrades = tradingTrades.filter(t => t.pl < 0).length;
    
    // Calculate total P/L from trading only
    const tradingPL = tradingTrades.reduce((sum, t) => sum + t.pl, 0);
    const averagePL = totalTrades ? tradingPL / totalTrades : 0;
    const winRate = totalTrades ? (winningTrades / totalTrades) * 100 : 0;

    // Calculate best performing by instrument and symbol
    const performanceBySymbol = tradingTrades.reduce((acc, trade) => {
      const key = trade.symbol;
      if (!acc[key]) {
        acc[key] = {
          pl: 0,
          instrument: trade.instrument,
          trades: 0,
          winningTrades: 0
        };
      }
      acc[key].pl += trade.pl;
      acc[key].trades++;
      if (trade.pl > 0) acc[key].winningTrades++;
      return acc;
    }, {} as Record<string, { pl: number, instrument: string, trades: number, winningTrades: number }>);

    // Calculate monthly P/L from trading only
    const monthlyPL = tradingTrades.reduce((acc, trade) => {
      const date = new Date(trade.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      
      if (!acc[key]) {
        acc[key] = {
          pl: 0,
          cumulative: 0
        };
      }
      
      // Add this trade's P/L to monthly total
      acc[key].pl += trade.pl;
      
      // Calculate cumulative P/L by including all previous months
      const allMonthsSorted = Object.keys(acc).sort();
      const currentMonthIndex = allMonthsSorted.indexOf(key);
      acc[key].cumulative = allMonthsSorted
        .slice(0, currentMonthIndex + 1)
        .reduce((sum, monthKey) => sum + acc[monthKey].pl, 0);
      
      return acc;
    }, {} as Record<string, { pl: number, cumulative: number }>);

    // Sort monthly P/L by date and use cumulative values
    const sortedMonthlyPL = Object.entries(monthlyPL)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .reduce((acc, [key, value]) => {
        acc[key] = value.cumulative; // Use cumulative P/L instead of monthly
        return acc;
      }, {} as Record<string, number>);

    // Calculate withdrawals and deposits
    const totalWithdrawals = filteredTrades
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.price, 0);

    const totalDeposits = filteredTrades
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.price, 0);

    const totalEquity = totalBalance + tradingPL - totalWithdrawals + totalDeposits;
    const returnOnInvestment = totalBalance ? (totalEquity - totalBalance) / totalBalance * 100 : 0;

    // Improve equity curve calculation
    const equityCurveData = filteredTrades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc: any[], trade) => {
        const previousEquity = acc.length > 0 ? acc[acc.length - 1].equity : totalBalance;
        let equityChange = 0;
        
        // Calculate equity change based on trade type
        if (trade.type === 'withdrawal') {
          equityChange = -trade.price;
        } else if (trade.type === 'deposit') {
          equityChange = trade.price;
        } else if (trade.type === 'trade') {
          equityChange = trade.pl;
        }
        
        const newEquity = Math.round((previousEquity + equityChange) * 100) / 100;
        
        // Add intermediate point for smoother curve if there's a gap > 1 day
        if (acc.length > 0) {
          const lastDate = new Date(acc[acc.length - 1].date);
          const currentDate = new Date(trade.date);
          const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 1) {
            const midPoint = new Date(lastDate.getTime() + (daysDiff / 2) * 24 * 60 * 60 * 1000);
            acc.push({
              date: midPoint.toISOString().split('T')[0],
              equity: previousEquity // Use previous equity for smooth transition
            });
          }
        }
        
        return [...acc, {
          date: trade.date,
          equity: newEquity
        }];
      }, [{ 
        date: filteredTrades[0]?.date || new Date().toISOString().split('T')[0], 
        equity: totalBalance 
      }]);

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      tradingPL,
      averagePL,
      winRate,
      monthlyPL: sortedMonthlyPL,
      totalEquity,
      returnOnInvestment,
      totalWithdrawals,
      totalDeposits,
      initialBalance: totalBalance,
      equityCurveData,
      performanceBySymbol
    };
  }, [filteredTrades, totalBalance]);

  // Calculate trading statistics by symbol
  const symbolStats = useMemo(() => {
    const tradingTrades = activeTrades.filter(t => t.type === 'trade');
    const stats = {} as Record<string, { 
      totalTrades: number, 
      winningTrades: number, 
      profitLoss: number,
      instrument: string 
    }>;
    
    tradingTrades.forEach(trade => {
      const symbol = trade.symbol.toUpperCase();
      if (!stats[symbol]) {
        stats[symbol] = {
          totalTrades: 0,
          winningTrades: 0,
          profitLoss: 0,
          instrument: trade.instrument
        };
      }
      
      stats[symbol].totalTrades++;
      if (trade.pl > 0) stats[symbol].winningTrades++;
      stats[symbol].profitLoss += trade.pl;
    });
    
    return stats;
  }, [activeTrades]);

  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTradeIndex((prev) => (prev + 1) % Math.min(filteredTrades.length, 20));
    }, 3000); // Reduced to 3 seconds for better engagement
    return () => clearInterval(interval);
  }, [filteredTrades.length]);

  if (tradesLoading || accountsLoading) return <div>Loading...</div>;
  if (tradesError || accountsError) return <div>Error: {tradesError || accountsError}</div>;
  if (!activeTrades.length) return <div>No trades found. Add some trades to see statistics.</div>;

  // Calculate actual trends based on historical data
  const calculateTrend = (currentValue: number, historicalData: any[]) => {
    if (!historicalData.length) return null;
    const previousValue = historicalData[Math.max(0, historicalData.length - 2)]?.value || currentValue;
    if (previousValue === 0) return null;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  };

  const getHistoricalChange = (metric: string) => {
    // Get last month's value for comparison
    const lastMonthData = Object.entries(stats.monthlyPL)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 2);

    if (lastMonthData.length < 2) return null;
    
    const currentValue = lastMonthData[0][1];
    const previousValue = lastMonthData[1][1];
    
    if (previousValue === 0) return null;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  };

  const metrics = [
    { 
      label: 'Total P/L',
      value: `$${stats.tradingPL.toLocaleString()}`,
      color: 'from-green-500/20',
      icon: DollarSign,
      trend: null
    },
    {
      label: 'Win Rate',
      value: `${Math.round(stats.winRate)}%`,
      color: 'from-blue-500/20',
      icon: Target,
      trend: null
    },
    {
      label: 'ROI',
      value: `${stats.returnOnInvestment.toFixed(2)}%`,
      color: 'from-purple-500/20',
      icon: Percent,
      trend: null
    },
    {
      label: 'Current Equity',
      value: `$${stats.totalEquity.toLocaleString()}`,
      color: 'from-pink-500/20',
      icon: DollarSign,
      trend: null
    },
    {
      label: 'Total Trades',
      value: stats.totalTrades,
      color: 'from-indigo-500/20',
      icon: Hash,
      trend: null
    },
    {
      label: 'Average P/L',
      value: `$${stats.averagePL.toFixed(2)}`,
      color: 'from-amber-500/20',
      icon: Calculator,
      trend: null
    },
    {
      label: 'Total Deposits',
      value: `$${stats.totalDeposits.toFixed(2)}`,
      color: 'from-emerald-500/20',
      icon: ArrowDownToLine,
      trend: null
    },
    {
      label: 'Total Withdrawals',
      value: `$${stats.totalWithdrawals.toFixed(2)}`,
      color: 'from-rose-500/20',
      icon: ArrowUpFromLine,
      trend: null
    }
  ];

  const SymbolPerformanceCard = ({ trade }: { trade: any }) => {
    const getTradeScreenshot = () => {
      if (trade.screenshot) return trade.screenshot;
      
      // Get asset type folder
      const assetTypeFolder = trade.instrument?.toLowerCase() || 'stocks';
      
      // Try asset-specific default first
      const assetDefault = `/images/charts/${assetTypeFolder}/default.png`;
      
      // Return either asset-specific or general default
      return `/images/charts/default-chart.png`;
    };

    return (
      <div className="bg-[#252525] rounded-lg overflow-hidden">
        <div className="h-[280px] relative"> {/* Increased height for better visibility */}
          <img 
            src={getTradeScreenshot()}
            alt={`${trade.symbol} chart`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load, using default chart');
              const target = e.target as HTMLImageElement;
              target.src = '/images/charts/default-chart.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-white font-medium text-lg">{trade.symbol}</h4>
                <p className="text-white/60 text-sm">
                  {new Date(trade.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`${
                trade.pl > 0 ? 'text-green-400' : 'text-red-400'
              } text-lg font-semibold`}>
                ${Math.abs(trade.pl).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Ultra Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-6 mb-8"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
              <Activity className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-white/40 mt-2">Advanced insights into your trading performance</p>
            </div>
          </motion.div>

          {/* Premium Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <metric.icon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-medium text-white/60">{metric.label}</h3>
                  </div>
                  <p className="text-3xl font-bold tracking-tight mb-2">{metric.value}</p>
                  {metric.trend !== null && (
                    <div className={`flex items-center gap-1.5 text-sm ${metric.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <TrendingUp className={`w-4 h-4 ${metric.trend < 0 && 'rotate-180'}`} />
                      <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced chart components with premium styling */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 border border-white/5"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white/90">Equity Curve</h3>
              </div>
              <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Enhanced Equity Chart */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={stats.equityCurveData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF2D78" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF2D78" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="equityLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FF2D78"/>
                      <stop offset="50%" stopColor="#FF2D78"/>
                      <stop offset="100%" stopColor="#4B0082"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26,26,26,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="url(#equityLine)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ 
                      r: 8, 
                      fill: '#FF2D78',
                      stroke: '#fff',
                      strokeWidth: 2
                    }}
                    fill="url(#equityGradient)"
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Monthly P/L Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PieChart className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white/90">Monthly P/L</h3>
              </div>
              <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Enhanced Monthly P/L Chart */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={Object.entries(stats.monthlyPL)
                    .map(([month, pl]) => ({ 
                      month: month.split('-')[1], // Only show month part
                      fullMonth: month, // Keep full date for sorting
                      pl: Math.round(pl * 100) / 100
                    }))
                    .sort((a, b) => new Date(a.fullMonth).getTime() - new Date(b.fullMonth).getTime())
                  }
                >
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#00C49F" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8042" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#FF8042" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    tickFormatter={(month) => month}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                    labelStyle={{
                      color: '#fff'
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <Bar 
                    dataKey="pl" 
                    radius={[4, 4, 0, 0]}
                  >
                    {Object.entries(stats.monthlyPL).map(([, pl], index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={pl >= 0 ? 'url(#profitGradient)' : 'url(#lossGradient)'}
                        stroke={pl >= 0 ? '#00C49F' : '#FF8042'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* P/L by Symbol Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] p-6">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white/90">P/L by Symbol</h3>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(symbolStats)
                    .filter(([, stats]) => Math.abs(stats.profitLoss) > 0)
                    .map(([symbol, stats]) => ({
                      name: symbol,
                      value: Math.round(stats.profitLoss * 100) / 100,
                      instrument: stats.instrument
                    }))
                    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                    .slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <defs>
                    {[
                      { id: 'gradient1', color: '#00C49F' },
                      { id: 'gradient2', color: '#0088FE' },
                      { id: 'gradient3', color: '#FFBB28' },
                      { id: 'gradient4', color: '#FF8042' },
                      { id: 'gradient5', color: '#8884D8' },
                      { id: 'gradient6', color: '#82CA9D' },
                      { id: 'gradient7', color: '#ffc658' },
                      { id: 'gradient8', color: '#8dd1e1' }
                    ].map(({ id, color }) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                  <XAxis type="number" domain={['auto', 'auto']} stroke="#666" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1A1A1A] p-3 rounded-lg border border-gray-700 shadow-xl text-white">
                            <p className="font-medium mb-1">{data.name}</p>
                            <p className="text-gray-400 text-sm mb-2">{data.instrument}</p>
                            <p className={`text-lg font-semibold ${
                              data.value >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${data.value.toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {Object.entries(symbolStats)
                      .filter(([, stats]) => Math.abs(stats.profitLoss) > 0)
                      .sort((a, b) => Math.abs(b[1].profitLoss) - Math.abs(a[1].profitLoss))
                      .slice(0, 8)
                      .map((_, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`url(#gradient${index + 1})`}
                          stroke={[
                            '#00C49F',
                            '#0088FE',
                            '#FFBB28',
                            '#FF8042',
                            '#8884D8',
                            '#82CA9D',
                            '#ffc658',
                            '#8dd1e1'
                          ][index]}
                          strokeWidth={1}
                        />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Symbol Performance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] p-6">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white/90">Symbol Performance</h3>
              <Link 
                to="/trades"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                View all trades <ExternalLink size={14} />
              </Link>
            </div>
            <div className="h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTradeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="h-[350px]"
                >
                  <SymbolPerformanceCard 
                    trade={filteredTrades[currentTradeIndex]} 
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1.5 mt-4">
                {filteredTrades.slice(0, 20).map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      currentTradeIndex === index ? 'bg-blue-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Statistics;