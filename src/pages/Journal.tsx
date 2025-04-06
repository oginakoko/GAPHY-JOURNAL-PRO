import React, { useState } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import TradeTable from '../components/TradeTable';
import StatsBar from '../components/StatsBar';
import TradePlannerModal from '../components/TradePlannerModal';
import { Trade, InstrumentType } from '../types';
import TradeForm from '../components/TradeForm';
import useLocalStorage from '../hooks/useLocalStorage';
import TradingViewTicker from '../components/TradingViewTicker';
import { useTradeData } from '../hooks/useTradeData';
import { useTradePlans } from '../hooks/useTradePlans';

interface JournalProps {
  isNewTrade?: boolean;
}

function Journal({ isNewTrade = false }: JournalProps) {
  const { 
    trades, 
    loading, 
    error, 
    addTrade, 
    updateTrade, 
    softDeleteTrade, 
    permanentDeleteTrade,
    restoreTrade 
  } = useTradeData();
  const { 
    tradePlans, 
    loading: plansLoading, 
    error: plansError,
    updateChecklistItem 
  } = useTradePlans();
  const [showPlanner, setShowPlanner] = useState(false);
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(isNewTrade);
  const [selectedInstrument, setSelectedInstrument] = useLocalStorage<InstrumentType>('selectedInstrument', 'Stocks');
  const [showDeleted, setShowDeleted] = useLocalStorage<boolean>('showDeleted', false);
  const [selectedPlan, setSelectedPlan] = useLocalStorage<string>('selectedPlan', '');

  const activePlan = tradePlans.find(plan => plan.id === selectedPlan) || tradePlans[0];
  const filteredTrades = trades.filter(trade => 
    (showDeleted ? trade.deleted : !trade.deleted) && 
    (selectedInstrument === 'all' || trade.instrument === selectedInstrument)
  );

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

  const completionPercentage = activePlan
    ? Math.round(
        (activePlan.checklist.filter(item => item.completed).length / activePlan.checklist.length) * 100
      )
    : 0;

  if (loading || plansLoading) {
    return <div>Loading...</div>;
  }

  if (error || plansError) {
    return <div>Error: {error || plansError}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <TradingViewTicker />
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Trading Journal</h1>
        <button
          onClick={() => setIsTradeFormOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          + Add New Trade
        </button>
      </div>

      <StatsBar 
        totalPL={filteredTrades.reduce((sum, trade) => sum + trade.pl, 0)}
        winRate={Math.round((filteredTrades.filter(t => t.pl > 0).length / filteredTrades.length) * 100)}
        trades={filteredTrades.length}
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

        {/* Resized Progress Bar Widget */}
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

      {/* Restored Quote Widget */}
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
        <h3 className="text-xl">Recent Trades</h3>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span>Filters</span>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value as InstrumentType)}
            className="bg-[#1A1A1A] px-4 py-2 rounded-lg text-white"
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
            className={`px-4 py-2 rounded-lg ${showDeleted ? 'bg-red-500' : 'bg-[#1A1A1A]'}`}
          >
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <TradeTable 
          trades={filteredTrades.map((trade) => ({ ...trade, key: trade.id }))}
          onEdit={handleEditTrade}
          onDelete={handleDeleteTrade}
          onPermanentDelete={handlePermanentDelete}
          onRestore={handleRestoreTrade}
          showDeleted={showDeleted}
        />
      </div>

      {isTradeFormOpen && (
        <TradeForm
          onSubmit={handleAddTrade}
          onClose={() => setIsTradeFormOpen(false)}
          selectedInstrument={selectedInstrument}
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