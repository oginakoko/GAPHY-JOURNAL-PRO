import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TradeTable from '../components/TradeTable';
import StatsBar from '../components/StatsBar';
import TradePlannerModal from '../components/TradePlannerModal';
import { Trade, InstrumentType } from '../types';
import TradeForm from '../components/TradeForm';
import WithdrawalForm from '../components/WithdrawalForm';
import useLocalStorage from '../hooks/useLocalStorage';
import { useTradeData } from '../hooks/useTradeData';
import { useTradePlans } from '../hooks/useTradePlans';
import { TimeFilter, TimeRange } from '../components/TimeFilter';
import { useAccounts } from '../hooks/useAccounts';
import { calculateStats } from '../lib/statsUtils';
import { motion } from 'framer-motion';
import { BookOpen, Pencil, Trash2, PlusCircle, Wallet } from 'lucide-react';
import TickerTape from '../components/TickerTape';
import { withPageWrapper } from '../components/PageWrapper';

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
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return sortedTrades.filter(t => 
          new Date(t.date) >= todayStart
        );
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return sortedTrades.filter(t => 
          new Date(t.date) >= weekAgo
        );
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return sortedTrades.filter(t => 
          new Date(t.date) >= monthAgo
        );
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return sortedTrades.filter(t => 
          new Date(t.date) >= yearAgo
        );
      case 'all':
      default:
        return sortedTrades;
    }
  };

  const filteredTrades = useMemo(() => {
    const filtered = trades.filter(trade => 
      (showDeleted ? trade.deleted : !trade.deleted) && 
      (selectedInstrument === 'all' || trade.instrument === selectedInstrument)
    );
    return filterTradesByTime(filtered);
  }, [trades, showDeleted, selectedInstrument, timeRange]);

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
    try {
      await addWithdrawal(amount, description);
      setIsWithdrawalFormOpen(false);
      // Refresh trades to update balances
      await refetchTrades();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    }
  };

  const completionPercentage = activePlan
    ? Math.round(
        (activePlan.checklist.filter(item => item.completed).length / activePlan.checklist.length) * 100
      )
    : 0;

  const columns = useMemo(() => [
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditTrade(row.original)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
          <button
            onClick={() => handleDeleteTrade(row.original.id)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
          </button>
        </div>
      )
    }
  ], []);

  if (loading || plansLoading || accountsLoading) {
    return <div>Loading...</div>;
  }

  if (error || plansError || accountsError) {
    return <div>Error: {error || plansError || accountsError}</div>;
  }

  return (
    <>
      <div className="space-y-8">
        <TickerTape />
        
        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Trading Journal</h1>
            <p className="text-lg text-white/60 mt-2">Record and analyze your trades</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsTradeFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Trade</span>
            </button>
            <button
              type="button"
              onClick={() => setIsWithdrawalFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#252525] hover:bg-[#303030] text-white rounded-lg border border-white/10 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
          <div className="relative z-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-6 mb-8"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Trade Journal
                </h1>
                <p className="text-lg text-white/80 mt-2">Document your trading journey and learn from your experiences</p>
              </div>
            </motion.div>

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
          </div>
        </div>

        {/* Market Hours Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'NEW YORK', widgetId: 'NuBIMthM1A7wdEpQ6tkC', color: 'blue' },
            { name: 'LONDON', widgetId: '0hyU213eDv9XhrK1av3L', color: 'orange' },
            { name: 'TOKYO', widgetId: 'AIgwp7gFdHVynb2VkguC', color: 'purple' },
            { name: 'SYDNEY', widgetId: '7B9RmIa5DOZTkDx2fbwm', color: 'blue' }
          ].map((market) => (
            <div key={market.name} className="flex flex-col">
              <iframe 
                src={`https://indify.co/widgets/live/clock/${market.widgetId}`}
                className="w-full h-[150px] rounded-t-xl bg-[#1A1A1A]"
                style={{ border: 'none', display: 'block' }}
              />
              <span className={`text-white text-center font-bold bg-${market.color}-800 py-2 rounded-b-xl`}>
                {market.name}
              </span>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trade Planner Card */}
          <div className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white/90">Trade Planner</h3>
              <button 
                onClick={() => setShowPlanner(true)}
                className="text-sm px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                Manage Plans
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tradePlans
                .filter(plan => !plan.deleted)
                .map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanChange(plan.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedPlan === plan.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-[#252525] hover:bg-[#303030] text-white/60'
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
            </div>

            {activePlan && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {activePlan.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleChecklistChange(item.id, !item.completed)}
                        className="rounded bg-[#252525] border-white/10 text-blue-500 focus:ring-blue-500/20"
                      />
                      <span className={`${item.completed ? 'line-through text-white/40' : 'text-white/80'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <div className="flex justify-between items-center text-sm text-white/80 mb-2">
                    <span>Completion Progress</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Widget */}
          <div className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl overflow-hidden">
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
        <div className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl p-6 h-[240px] overflow-hidden">
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

        {/* Trades Table Section */}
        <div className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white/90 mb-1">Recent Trades</h3>
              <span className="text-sm text-white/40">
                {filteredTrades.length} trades shown
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-[#252525] px-4 py-2 rounded-lg flex-1 sm:flex-none">
                <TimeFilter value={timeRange} onChange={setTimeRange} />
              </div>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value as InstrumentType)}
                className="bg-[#252525] px-4 py-2 rounded-lg text-white min-w-[120px] border border-white/10"
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
                  showDeleted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#252525] hover:bg-[#303030]'
                }`}
              >
                {showDeleted ? 'Show Active' : 'Show Deleted'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <TradeTable 
              trades={filteredTrades}
              onEdit={handleEditTrade}
              onDelete={handleDeleteTrade}
              onPermanentDelete={handlePermanentDelete}
              onRestore={handleRestoreTrade}
              showDeleted={showDeleted}
              columns={columns}
            />
          </div>
          
          {filteredTrades.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">No trades found for the selected filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

export default withPageWrapper(Journal, 'Trading Journal');