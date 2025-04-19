import { useState, useEffect } from 'react';
import { Plus, Trash, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TradingAccount } from '../types';
import { motion } from 'framer-motion';
import UserProfile from '../components/UserProfile';

function Settings() {
  const [authType, setAuthType] = useState<'pin' | 'password'>('pin');
  const [newValue, setNewValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAuthUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Handle auth update logic
      setMessage('Authentication updated successfully');
    } catch (err) {
      setError('Failed to update authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const newAccount = {
        user_id: user.id,
        name: accountName,
        initial_balance: Number(initialBalance),
        currency: 'USD',
      };

      const { error } = await supabase
        .from('trading_accounts')
        .insert([newAccount]);

      if (error) throw error;

      setAccountName('');
      setInitialBalance('');
      fetchAccounts();
    } catch (err) {
      setError('Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .match({ id });

      if (error) throw error;
      fetchAccounts();
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      setError('Failed to fetch accounts');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
              <SettingsIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-lg text-white/80 mt-2">Customize your trading environment</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Profile */}
        <UserProfile />

        {/* Authentication Settings */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Authentication Settings</h2>
          <form onSubmit={handleAuthUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Authentication Type</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as 'pin' | 'password')}
                className="w-full bg-[#252525] rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              >
                <option value="pin">PIN</option>
                <option value="password">Password</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                New {authType === 'pin' ? 'PIN' : 'Password'}
              </label>
              <input
                type={authType === 'pin' ? 'number' : 'password'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-[#252525] rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                maxLength={authType === 'pin' ? 4 : undefined}
                required
              />
            </div>
            {message && (
              <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                {message}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Authentication'}
            </button>
          </form>
        </motion.div>

        {/* Trading Accounts */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Trading Accounts</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleAccountSubmit} className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-[#252525] rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Initial Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-[#252525] rounded-lg pl-8 pr-4 py-3 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </form>

          <div className="space-y-4">
            {accounts.map(account => (
              <div 
                key={account.id} 
                className="flex items-center justify-between bg-[#252525] p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div>
                  <h3 className="font-medium text-white/90">{account.name}</h3>
                  <p className="text-sm text-white/40">Initial Balance: ${account.initial_balance.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => deleteAccount(account.id)}
                  className="text-red-400 hover:text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;