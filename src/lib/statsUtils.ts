// Calculate trading statistics for a set of trades
// trades: array of trade objects
// totalBalance: initial account balance (number)
// Returns an object with statistics
export function calculateStats(trades, totalBalance) {
  // Only include actual trades, not withdrawals or deposits
  const tradingTrades = trades.filter(t => t.type === 'trade');
  const totalTrades = tradingTrades.length;
  const winningTrades = tradingTrades.filter(t => t.pl > 0).length;
  const losingTrades = tradingTrades.filter(t => t.pl < 0).length;
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
  }, {});

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
    acc[key].pl += trade.pl;
    // Calculate cumulative P/L by including all previous months
    const allMonthsSorted = Object.keys(acc).sort();
    const currentMonthIndex = allMonthsSorted.indexOf(key);
    acc[key].cumulative = allMonthsSorted
      .slice(0, currentMonthIndex + 1)
      .reduce((sum, monthKey) => sum + acc[monthKey].pl, 0);
    return acc;
  }, {});

  // Sort monthly P/L by date and use cumulative values
  const sortedMonthlyPL = Object.entries(monthlyPL)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .reduce((acc, [key, value]) => {
      acc[key] = value.cumulative;
      return acc;
    }, {});

  // Calculate withdrawals and deposits
  const totalWithdrawals = trades
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.price, 0);
  const totalDeposits = trades
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.price, 0);

  const totalEquity = totalBalance + tradingPL - totalWithdrawals + totalDeposits;
  const returnOnInvestment = totalBalance ? (totalEquity - totalBalance) / totalBalance * 100 : 0;

  // Equity curve calculation
  const equityCurveData = trades
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, trade) => {
      const previousEquity = acc.length > 0 ? acc[acc.length - 1].equity : totalBalance;
      let equityChange = 0;
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
            equity: previousEquity
          });
        }
      }
      return [...acc, {
        date: trade.date,
        equity: newEquity
      }];
    }, [{
      date: trades[0]?.date || new Date().toISOString().split('T')[0],
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
}
