import { useState } from 'react';
import { useTradeData } from '../hooks/useTradeData';
import TradeCard from '../components/TradeCard';
import { Archive, TrendingUp, TrendingDown, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

function TradeArchives() {
  const { trades } = useTradeData();
  const [filter, setFilter] = useState('all');

  const filteredTrades = trades.filter(trade => 
    filter === 'all' || 
    (filter === 'profit' && trade.pl > 0) ||
    (filter === 'loss' && trade.pl < 0)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const stats = [
    { 
      label: 'Total Trades', 
      value: filteredTrades.length, 
      color: 'from-blue-500/20',
      description: 'All recorded trades'
    },
    { 
      label: 'Profit Trades', 
      value: filteredTrades.filter(t => t.pl > 0).length,
      color: 'from-green-500/20',
      description: 'Successful positions'
    },
    { 
      label: 'Loss Trades', 
      value: filteredTrades.filter(t => t.pl < 0).length,
      color: 'from-red-500/20',
      description: 'Learning opportunities'
    }
  ];

  return (
    <div className="space-y-8">
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
              <Archive className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Trade Archives
              </h1>
              <p className="text-lg text-white/40 mt-2">Your trading journey, visualized with precision</p>
            </div>
          </motion.div>

          {/* Filter Buttons */}
          <div className="flex gap-3 p-2 bg-[#1A1A1A]/50 backdrop-blur-sm rounded-xl border border-white/10">
            {['all', 'profit', 'loss'].map(option => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(option)}
                className={`px-6 py-3 rounded-lg capitalize font-medium transition-all duration-200 flex items-center gap-2 ${
                  filter === option 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-white/5 text-white/60'
                }`}
              >
                {option === 'profit' && <TrendingUp className="w-4 h-4" />}
                {option === 'loss' && <TrendingDown className="w-4 h-4" />}
                {option === 'all' && <LayoutGrid className="w-4 h-4" />}
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} to-transparent p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all`}
          >
            <h3 className="text-sm text-white/40 font-medium mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/30 mt-2">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Trade Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredTrades.map(trade => (
          <motion.div key={trade.id} variants={itemVariants}>
            <TradeCard trade={trade} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredTrades.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-white/40"
        >
          <Archive className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-medium">No trades found</h3>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </motion.div>
      )}
    </div>
  );
}

export default TradeArchives;
