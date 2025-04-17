import { useState, useEffect, useMemo } from 'react';
import TradeTable from '../components/TradeTable';
import StatsBar from '../components/StatsBar';
import TradePlannerModal from '../components/TradePlannerModal';
import { Trade, InstrumentType } from '../types';
import TradeForm from '../components/TradeForm';
import WithdrawalForm from '../components/WithdrawalForm';
import useLocalStorage from '../hooks/useLocalStorage';
import TradingViewTicker from '../components/TradingViewTicker';
import { useTradeData } from '../hooks/useTradeData';
import { useTradePlans } from '../hooks/useTradePlans';
import { TimeFilter, TimeRange } from '../components/TimeFilter';
import { useAccounts } from '../hooks/useAccounts';
import { calculateStats } from '../lib/statsUtils';

interface JournalProps {
  isNewTrade?: boolean;
}

function Journal({ isNewTrade = false }: JournalProps) {
  const { 
    trades, 
    loading, 
    error, 
    addTrade, 
    addWithdrawal,
    updateTrade, 
    softDeleteTrade, 
    permanentDeleteTrade,
    restoreTrade,
    refetchTrades
  } = useTradeData();
  const { totalBalance: initialBalance, loading: accountsLoading, error: accountsError } = useAccounts();

  useEffect(() => {
    refetchTrades();
  }, []);

  const { 
    tradePlans, 
    loading: plansLoading, 
    error: plansError,
    updateChecklistItem 
  } = useTradePlans();
  const [showPlanner, setShowPlanner] = useState(false);
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(isNewTrade);
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useLocalStorage<InstrumentType>('selectedInstrument', 'Stocks');
  const [showDeleted, setShowDeleted] = useLocalStorage<boolean>('showDeleted', false);
  const [selectedPlan, setSelectedPlan] = useLocalStorage<string>('selectedPlan', '');
  const [timeRange, setTimeRange] = useLocalStorage<TimeRange>('timeRange', 'last3');

  const activePlan = tradePlans.find(plan => plan.id === selectedPlan) || tradePlans[0];

  const filterTradesByTime = (trades: Trade[]) => {
    if (!trades.length) return [];
    
    const now = new Date();
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    switch (timeRange) {
      case 'last3':
        return sortedTrades.slice(0, 3);
      case 'today':
        return sortedTrades.filter(t => 
          new Date(t.date).toDateString() === now.toDateString()
        );
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sortedTrades.filter(t => 
          new Date(t.date) >= weekAgo
        );
      case 'month':
        return sortedTrades.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        });
      case 'year':
        return sortedTrades.filter(t => 
          new Date(t.date).getFullYear() === now.getFullYear()
        );
      default:
        return sortedTrades;
    }
  };

  // Move filtering logic here for better performance
  const filteredTrades = useMemo(() => {
    const filtered = trades.filter(trade => 
      (showDeleted ? trade.deleted : !trade.deleted) && 
      (selectedInstrument === 'all' || trade.instrument === selectedInstrument)
    );
    return filterTradesByTime(filtered);
  }, [trades, showDeleted, selectedInstrument, timeRange]);

  // Calculate stats only once
  const stats = calculateStats(trades, initialBalance);
  
  const handleAddTrade = (trade: Trade) => {
    const newTrade = {
      ...trade,
      id: Date.now().toString(),
      instrument: selectedInstrument
    };
    addTrade(newTrade);
    setIsTradeFormOpen(false);
  };

  const handleEditTrade = (trade: Trade) => {
    updateTrade(trade);
  };

  const handleDeleteTrade = (id: string) => {
    softDeleteTrade(id);
  };

  const handleRestoreTrade = (id: string) => {
    restoreTrade(id);
  };

  const handlePermanentDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this trade? This cannot be undone.')) {
      permanentDeleteTrade(id);
    }
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleChecklistChange = async (itemId: string, completed: boolean) => {
    if (!activePlan) return;
    
    const item = activePlan.checklist.find(i => i.id === itemId);
    if (item) {
      await updateChecklistItem(activePlan.id, { ...item, completed });
    }
  };

  const handleWithdrawal = async (amount: number, description: string) => {
    await addWithdrawal(amount, description);
    setIsWithdrawalFormOpen(false);
  };

  const completionPercentage = activePlan
    ? Math.round(
        (activePlan.checklist.filter(item => item.completed).length / activePlan.checklist.length) * 100
      )
    : 0;

  if (loading || plansLoading || accountsLoading) {
    return <div>Loading...</div>;
  }

  if (error || plansError || accountsError) {
    return <div>Error: {error || plansError || accountsError}</div>;
  }

  // Use the correct values from UI
  const totalDeposits = 10;
  const totalWithdrawals = 10;

  return (
    <>
      <div className="mb-4">
        <TradingViewTicker />
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Trading Journal</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsWithdrawalFormOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            Withdraw
          </button>
          <button
            onClick={() => setIsTradeFormOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            + Add New Trade
          </button>
        </div>
      </div>

      <StatsBar 
        winRate={Math.round(stats.winRate)}
        trades={stats.totalTrades}
        withdrawals={stats.totalWithdrawals}
        equity={stats.totalEquity}
        deposits={stats.totalDeposits}
        profitLoss={stats.tradingPL}
        initialBalance={stats.initialBalance}
        roi={stats.returnOnInvestment}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
        {/* Trade Planner */}
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Trade Planner</h3>
              <button 
                onClick={() => setShowPlanner(true)}
                className="bg-[#252525] hover:bg-[#303030] px-4 py-2 rounded-lg text-sm"
              >
                Manage Plans
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tradePlans
                .filter(plan => !plan.deleted)
                .map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanChange(plan.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedPlan === plan.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-[#252525] hover:bg-[#303030]'
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
            </div>

            <div className="mt-2">
              <h4 className="font-medium mb-2">Current Plan Checklist</h4>
              <div className="space-y-2">
                {activePlan?.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleChecklistChange(item.id, !item.completed)}
                      className="rounded bg-[#252525]"
                    />
                    <span className={item.completed ? 'line-through text-gray-500' : ''}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2">
              <div className="w-full bg-[#252525] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 mt-1">
                {completionPercentage}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Widget */}
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <iframe 
            src="https://indify.co/widgets/live/progressBar/ZW9Y0RaJjf02Xp8buyDA"
            className="w-full h-[300px]"
            style={{
              border: 'none',
              background: '#141414',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Quote Widget */}
      <div className="bg-[#1A1A1A] rounded-lg p-4 h-[240px] overflow-hidden mb-8">
        <iframe 
          src="https://kwize.com/quote-of-the-day/embed/&txt=0&font=&color=eedddd&background=141414"
          className="w-full h-full"
          style={{
            border: 'none',
            background: '#141414',
            display: 'block'
          }}
        />
      </div>

      {/* Clocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="flex flex-col items-center">
          <iframe 
            src="https://indify.co/widgets/live/clock/NuBIMthM1A7wdEpQ6tkC" 
            className="w-full h-[150px]"
            style={{
              border: 'none',
              background: '#141414',
              display: 'block'
            }}
          />
          <span className="text-white mt-2 font-bold bg-blue-800 px-2 py-1 rounded">NEW YORK</span>
        </div>
        <div className="flex flex-col items-center">
          <iframe 
            src="https://indify.co/widgets/live/clock/AIgwp7gFdHVynb2VkguC" 
            className="w-full h-[150px]"
            style={{
              border: 'none',
              background: '#141414',
              display: 'block'
            }}
          />
          <span className="text-white mt-2 font-bold bg-purple-800 px-2 py-1 rounded">NAIROBI</span>
        </div>
        <div className="flex flex-col items-center">
          <iframe 
            src="https://indify.co/widgets/live/clock/0hyU213eDv9XhrK1av3L" 
            className="w-full h-[150px]"
            style={{
              border: 'none',
              background: '#141414',
              display: 'block'
            }}
          />
          <span className="text-white mt-2 font-bold bg-orange-800 px-2 py-1 rounded">LONDON</span>
        </div>
        <div className="flex flex-col items-center">
          <iframe 
            src="https://indify.co/widgets/live/clock/7B9RmIa5DOZTkDx2fbwm" 
            className="w-full h-[150px]"
            style={{
              border: 'none',
              background: '#141414',
              display: 'block'
            }}
          />
          <span className="text-white mt-2 font-bold bg-purple-800 px-2 py-1 rounded">ASIA</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold">Recent Trades</h3>
          <span className="text-gray-400 text-sm">
            {filteredTrades.length} trades shown
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-4 py-2 rounded-lg">
            <TimeFilter value={timeRange} onChange={setTimeRange} />
          </div>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value as InstrumentType)}
            className="bg-[#1A1A1A] px-4 py-2 rounded-lg text-white min-w-[120px]"
          >
            <option value="all">All Instruments</option>
            <option value="Stocks">Stocks</option>
            <option value="Options">Options</option>
            <option value="Forex">Forex</option>
            <option value="Crypto">Crypto</option>
            <option value="Futures">Futures</option>
          </select>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showDeleted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1A1A1A] hover:bg-[#252525]'
            }`}
          >
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <TradeTable 
          trades={filteredTrades}
          onEdit={handleEditTrade}
          onDelete={handleDeleteTrade}
          onPermanentDelete={handlePermanentDelete}
          onRestore={handleRestoreTrade}
          showDeleted={showDeleted}
        />
        {filteredTrades.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No trades found for the selected filters
          </div>
        )}
      </div>

      {isTradeFormOpen && (
        <TradeForm
          onSubmit={handleAddTrade}
          onClose={() => setIsTradeFormOpen(false)}
          selectedInstrument={selectedInstrument}
        />
      )}

      {isWithdrawalFormOpen && (
        <WithdrawalForm
          onSubmit={handleWithdrawal}
          onClose={() => setIsWithdrawalFormOpen(false)}
        />
      )}

      {showPlanner && (
        <TradePlannerModal 
          onClose={() => setShowPlanner(false)}
        />
      )}
    </>
  );
}

export default Journal;