import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { useTradeData } from '../hooks/useTradeData';
import { useAccounts } from '../hooks/useAccounts';
import { ExternalLink, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import TradingStats from '../components/TradingStats';
import TradeCard from '../components/TradeCard';

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
      setCurrentTradeIndex((prev) => (prev + 1) % filteredTrades.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredTrades.length]);

  if (tradesLoading || accountsLoading) return <div>Loading...</div>;
  if (tradesError || accountsError) return <div>Error: {tradesError || accountsError}</div>;
  if (!activeTrades.length) return <div>No trades found. Add some trades to see statistics.</div>;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedInstrument}
          onChange={(e) => {
            setSelectedInstrument(e.target.value);
            setSelectedPair('all'); // Reset pair selection when instrument changes
          }}
          className="bg-[#1A1A1A] px-4 py-2 rounded-lg text-white min-w-[150px]"
        >
          <option value="all">All Instruments</option>
          <option value="Stocks">Stocks</option>
          <option value="Options">Options</option>
          <option value="Forex">Forex</option>
          <option value="Crypto">Crypto</option>
          <option value="Futures">Futures</option>
        </select>

        <select
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          className="bg-[#1A1A1A] px-4 py-2 rounded-lg text-white min-w-[150px]"
        >
          <option value="all">All Symbols</option>
          {availableSymbols.map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>

        <span className="text-gray-400">
          {selectedInstrument === 'all' && selectedPair === 'all' 
            ? 'Showing all trades'
            : `Showing ${selectedPair === 'all' ? selectedInstrument : selectedPair} trades`}
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Trading Statistics</h1>

      {/* Account Metrics */}
      <TradingStats
        initialBalance={stats.initialBalance}
        currentEquity={stats.totalEquity}
        roi={stats.returnOnInvestment}
        totalPL={stats.tradingPL}
        winRate={stats.winRate}
        totalTrades={stats.totalTrades}
        averagePL={stats.averagePL}
        withdrawals={stats.totalWithdrawals}
        deposits={stats.totalDeposits}
        winningTrades={stats.winningTrades}
        losingTrades={stats.losingTrades}
        breakEven={stats.totalTrades - (stats.winningTrades + stats.losingTrades)}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equity Curve Chart */}
        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Equity Curve</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.equityCurveData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="equityLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  stroke="#666"
                  minTickGap={50}
                />
                <YAxis 
                  stroke="#666"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#999' }}
                  itemStyle={{ color: '#8884d8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="url(#equityLine)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2,
                    fill: '#8884d8',
                    stroke: '#fff'
                  }}
                  fill="url(#equityGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly P/L Chart */}
        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Monthly P/L</h3>
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

        {/* P/L by Symbol and Performance Analysis */}
        <div className="bg-[#1A1A1A] p-6 rounded-lg lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Bar Chart and Transaction Metrics */}
            <div>
              <h3 className="text-lg font-medium mb-4">P/L by Symbol</h3>
              <div className="h-[300px]">
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

              {/* Transaction Metrics */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-[#252525] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-2">Withdrawals</h4>
                  <div className="space-y-2">
                    <p className="text-xl text-red-400">
                      -${stats.totalWithdrawals.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Count: {filteredTrades.filter(t => t.type === 'withdrawal').length}
                    </p>
                    <p className="text-sm text-gray-400">
                      Avg: ${(stats.totalWithdrawals / 
                        (filteredTrades.filter(t => t.type === 'withdrawal').length || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="bg-[#252525] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-2">Deposits</h4>
                  <div className="space-y-2">
                    <p className="text-xl text-green-400">
                      +${stats.totalDeposits.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Count: {filteredTrades.filter(t => t.type === 'deposit').length}
                    </p>
                    <p className="text-sm text-gray-400">
                      Avg: ${(stats.totalDeposits / 
                        (filteredTrades.filter(t => t.type === 'deposit').length || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Detailed Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Symbol Performance</h3>
              <div className="overflow-hidden relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recent Trades</h3>
                  <Link 
                    to="/trades"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  >
                    View all trades <ExternalLink size={14} />
                  </Link>
                </div>
                
                <div className="relative h-[400px]">
                  {filteredTrades.length > 0 ? (
                    <TradeCard 
                      trade={filteredTrades[currentTradeIndex]} 
                      compact 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No trades to display
                    </div>
                  )}
                </div>
                
                {filteredTrades.length > 0 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {filteredTrades.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentTradeIndex ? 'bg-blue-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;