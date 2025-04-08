import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useTradeData } from '../hooks/useTradeData';
import { useAccounts } from '../hooks/useAccounts';

function Statistics() {
  const { trades, loading: tradesLoading, error: tradesError } = useTradeData();
  const { accounts, totalBalance, loading: accountsLoading, error: accountsError } = useAccounts();
  const activeTrades = trades.filter(t => !t.deleted);

  const stats = useMemo(() => {
    // Only include actual trades, not withdrawals or deposits
    const tradingTrades = activeTrades.filter(t => t.type === 'trade');
    const totalTrades = tradingTrades.length;
    const winningTrades = tradingTrades.filter(t => t.pl > 0).length;
    const losingTrades = tradingTrades.filter(t => t.pl < 0).length;
    
    // Calculate total P/L from trading only
    const tradingPL = tradingTrades.reduce((sum, t) => sum + t.pl, 0);
    const averagePL = totalTrades ? tradingPL / totalTrades : 0;
    const winRate = totalTrades ? (winningTrades / totalTrades) * 100 : 0;
    
    // Group trading P/L by instrument
    const byInstrument = tradingTrades.reduce((acc, trade) => {
      acc[trade.instrument] = (acc[trade.instrument] || 0) + trade.pl;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly P/L from trading only
    const monthlyPL = tradingTrades.reduce((acc, trade) => {
      const month = new Date(trade.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + trade.pl;
      return acc;
    }, {} as Record<string, number>);

    // Calculate withdrawals
    const totalWithdrawals = activeTrades
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.price, 0);

    // Calculate deposits
    const totalDeposits = activeTrades
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.price, 0);

    const totalEquity = totalBalance + tradingPL - totalWithdrawals + totalDeposits;
    const returnOnInvestment = totalBalance ? (totalEquity - totalBalance) / totalBalance * 100 : 0;

    // Calculate equity curve data including all transaction types
    const equityCurveData = activeTrades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc: any[], trade) => {
        const previousEquity = acc.length > 0 ? acc[acc.length - 1].equity : totalBalance;
        const equityChange = trade.type === 'withdrawal' 
          ? -trade.price 
          : trade.type === 'deposit' 
            ? trade.price 
            : trade.pl;
            
        return [...acc, {
          date: trade.date,
          equity: previousEquity + equityChange
        }];
      }, [{ date: activeTrades[0]?.date || new Date().toISOString(), equity: totalBalance }]);

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      tradingPL,
      averagePL,
      winRate,
      byInstrument,
      monthlyPL,
      totalEquity,
      returnOnInvestment,
      totalWithdrawals,
      totalDeposits,
      initialBalance: totalBalance,
      equityCurveData
    };
  }, [activeTrades, totalBalance]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (tradesLoading || accountsLoading) return <div>Loading...</div>;
  if (tradesError || accountsError) return <div>Error: {tradesError || accountsError}</div>;
  if (!activeTrades.length) return <div>No trades found. Add some trades to see statistics.</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Trading Statistics</h1>

      {/* Account Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Account Summary</h3>
          <div className="space-y-2">
            <p>Initial Balance: <span className="text-blue-400">${stats.initialBalance.toFixed(2)}</span></p>
            <p>Current Equity: <span className="text-green-400">${stats.totalEquity.toFixed(2)}</span></p>
            <p>ROI: <span className={stats.returnOnInvestment >= 0 ? 'text-green-400' : 'text-red-400'}>
              {stats.returnOnInvestment.toFixed(2)}%
            </span></p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p>Total Withdrawals: <span className="text-red-400">-${stats.totalWithdrawals.toFixed(2)}</span></p>
              <p>Total Deposits: <span className="text-green-400">+${stats.totalDeposits.toFixed(2)}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Overall Performance</h3>
          <div className="space-y-2">
            <p>Total P/L: <span className={stats.tradingPL >= 0 ? 'text-green-400' : 'text-red-400'}>
              ${stats.tradingPL.toFixed(2)}
            </span></p>
            <p>Win Rate: {stats.winRate.toFixed(2)}%</p>
            <p>Total Trades: {stats.totalTrades}</p>
            <p>Average P/L: ${stats.averagePL.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Trade Distribution</h3>
          <div className="space-y-2">
            <p>Winning Trades: <span className="text-green-400">{stats.winningTrades}</span></p>
            <p>Losing Trades: <span className="text-red-400">{stats.losingTrades}</span></p>
            <p>Break Even: {stats.totalTrades - (stats.winningTrades + stats.losingTrades)}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Best Performing</h3>
          <div className="space-y-2">
            {Object.entries(stats.byInstrument)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([instrument, pl]) => (
                <p key={instrument}>
                  {instrument}: <span className={pl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${pl.toFixed(2)}
                  </span>
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly P/L Chart */}
        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Monthly P/L</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(stats.monthlyPL).map(([month, pl]) => ({ month, pl }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pl" fill="#8884d8">
                  {Object.entries(stats.monthlyPL).map(([, pl], index) => (
                    <Cell key={`cell-${index}`} fill={pl >= 0 ? '#00C49F' : '#FF8042'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Instrument Distribution Chart */}
        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">P/L by Instrument</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(stats.byInstrument).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats.byInstrument).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equity Curve Chart */}
        <div className="bg-[#1A1A1A] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Equity Curve</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.equityCurveData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#8884d8" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;