import React, { useState, useEffect } from 'react';
import { Plus, Trash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TradingAccount } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

function Settings() {
  const [auth, setAuth] = useLocalStorage('authCredentials', {
    type: 'pin',
    value: '1234'
  });
  const [newValue, setNewValue] = useState('');
  const [authType, setAuthType] = useState(auth.type);
  const [message, setMessage] = useState('');

  const handleAuthUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newValue) {
      setAuth({
        type: authType,
        value: newValue
      });
      setMessage('Authentication updated successfully');
      setNewValue('');
    }
  };

  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [newAccount, setNewAccount] = useState({
    name: '',
    initial_balance: '',
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
      setLoading(false);
    }
  };

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user_id = session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');

      if (!newAccount.name || !newAccount.initial_balance) {
        setError('Please fill in all fields');
        return;
      }

      const { data, error } = await supabase
        .from('trading_accounts')
        .insert([{
          user_id,
          name: newAccount.name,
          initial_balance: Number(newAccount.initial_balance),
          currency: newAccount.currency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data]);
      setNewAccount({ name: '', initial_balance: '', currency: 'USD' });
      setError(null);
    } catch (err: any) {
      console.error('Error adding account:', err);
      setError(err.message || 'Failed to add account');
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.initial_balance, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Settings</h2>
        <form onSubmit={handleAuthUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Authentication Type</label>
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value as 'pin' | 'password')}
              className="w-full bg-[#252525] rounded px-4 py-2"
            >
              <option value="pin">PIN</option>
              <option value="password">Password</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              New {authType === 'pin' ? 'PIN' : 'Password'}
            </label>
            <input
              type={authType === 'pin' ? 'number' : 'password'}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full bg-[#252525] rounded px-4 py-2"
              maxLength={authType === 'pin' ? 4 : undefined}
            />
          </div>
          {message && (
            <p className="text-green-500 text-sm">{message}</p>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Update Authentication
          </button>
        </form>
      </div>

      <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Trading Accounts</h2>
          <div className="text-gray-400">
            Total Balance: ${totalBalance.toLocaleString()}
          </div>
        </div>

        <form onSubmit={addAccount} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Account Name"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              className="bg-[#252525] rounded px-4 py-2"
              required
            />
            <input
              type="number"
              placeholder="Initial Balance"
              value={newAccount.initial_balance}
              onChange={(e) => setNewAccount({ ...newAccount, initial_balance: e.target.value })}
              className="bg-[#252525] rounded px-4 py-2"
              required
              step="0.01"
              min="0"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Account
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {accounts.map(account => (
            <div key={account.id} className="flex items-center justify-between bg-[#252525] p-4 rounded">
              <div>
                <h3 className="font-medium">{account.name}</h3>
                <p className="text-gray-400">Initial Balance: ${account.initial_balance.toLocaleString()}</p>
              </div>
              <button
                onClick={() => deleteAccount(account.id)}
                className="text-red-400 hover:text-red-500 p-2"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;