import { useState, useEffect } from 'react';
import { Trade } from '../types';
import { supabase } from '../lib/supabase';

// Strict database schema interface
interface DBTrade {
  user_id: string;
  symbol: string;
  date: string;
  side: string;
  qty: number;
  price: number;
  pl: number;
  type: string;
  instrument: string;
  screenshot: string | null;
  description: string;
  deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useTradeData() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user_id)
        .order('date', { ascending: false });

      if (error) throw error;
      console.log('Fetched trades:', data);
      setTrades(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to fetch trades');
      setLoading(false);
    }
  };

  const addTrade = async (trade: Omit<Trade, 'id' | 'user_id'>) => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');

      // Validate required fields
      if (!trade.symbol) throw new Error('Symbol is required');
      if (!trade.date) throw new Error('Date is required');
      if (!trade.side) throw new Error('Side is required');
      if (trade.qty === undefined) throw new Error('Quantity is required');
      if (trade.price === undefined) throw new Error('Price is required');
      if (trade.pl === undefined) throw new Error('P/L is required');

      // Create trade object strictly matching database schema
      const dbTrade: DBTrade = {
        user_id,
        symbol: trade.symbol,
        date: trade.date,
        side: trade.side,
        qty: Number(trade.qty),
        price: Number(trade.price),
        pl: Number(trade.pl),
        type: 'trade',
        instrument: trade.instrument || 'stock',
        screenshot: null,
        description: trade.description || '',
        deleted: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting database insert:', dbTrade);

      const { data, error } = await supabase
        .from('trades')
        .insert([dbTrade])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }
      
      await fetchTrades();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add trade';
      console.error('Error adding trade:', errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  const addWithdrawal = async (amount: number, description: string = '') => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');
      if (amount <= 0) throw new Error('Withdrawal amount must be greater than 0');

      const withdrawal = {
        user_id,
        type: 'withdrawal',
        symbol: 'WITHDRAWAL',
        date: new Date().toISOString().split('T')[0],
        side: 'Sell',
        qty: 1,
        price: Math.abs(amount),
        pl: -Math.abs(amount),
        instrument: 'all',
        description: description.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the withdrawal
      const { data, error } = await supabase
        .from('trades')
        .insert([withdrawal])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      await fetchTrades();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add withdrawal';
      console.error('Error adding withdrawal:', err);
      setError(errorMessage);
      return null;
    }
  };

  const addDeposit = async (amount: number, description: string = '') => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');
      if (amount <= 0) throw new Error('Deposit amount must be greater than 0');

      const deposit = {
        user_id,
        type: 'deposit',
        symbol: 'DEPOSIT',
        date: new Date().toISOString().split('T')[0],
        side: 'Buy',
        qty: 1,
        price: Math.abs(amount),
        pl: Math.abs(amount),
        instrument: 'all',
        description: description.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([deposit])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      await fetchTrades();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add deposit';
      console.error('Error adding deposit:', err);
      setError(errorMessage);
      return null;
    }
  };

  const updateTrade = async (trade: Trade) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update({
          symbol: trade.symbol,
          date: trade.date,
          side: trade.side,
          qty: Number(trade.qty),
          price: Number(trade.price),
          pl: Number(trade.pl),
          instrument: trade.instrument,
          screenshot: trade.screenshot,
          deleted: trade.deleted,
          deleted_at: trade.deleted_at,
          updated_at: new Date().toISOString()
        })
        .match({ id: trade.id });

      if (error) throw error;

      setTrades(prev => prev.map(t => t.id === trade.id ? { ...t, ...trade } : t));
      return true;
    } catch (err) {
      console.error('Error updating trade:', err);
      setError('Failed to update trade');
      return false;
    }
  };

  const softDeleteTrade = async (id: string) => {
    try {
      setTrades(prev => prev.map(t =>
        t.id === id
          ? { ...t, deleted: true, deleted_at: new Date().toISOString() }
          : t
      ));

      const { error } = await supabase
        .from('trades')
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .match({ id });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error soft deleting trade:', err);
      setError('Failed to delete trade');
      return false;
    }
  };

  const permanentDeleteTrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .match({ id });

      if (error) throw error;
      setTrades(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Error permanently deleting trade:', err);
      setError('Failed to permanently delete trade');
      return false;
    }
  };

  const restoreTrade = async (id: string) => {
    try {
      setTrades(prev => prev.map(t =>
        t.id === id
          ? { ...t, deleted: false, deleted_at: undefined }
          : t
      ));

      const { error } = await supabase
        .from('trades')
        .update({
          deleted: false,
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .match({ id });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error restoring trade:', err);
      setError('Failed to restore trade');
      return false;
    }
  };

  const refetchTrades = () => {
    setLoading(true);
    fetchTrades();
  };

  const calculateTotalEquity = () => {
    // Filter out deleted trades
    const activeTrades = trades.filter(t => !t.deleted);
    
    // Calculate initial balance from deposits
    const deposits = activeTrades
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.price, 0);
    
    // Calculate withdrawals
    const withdrawals = activeTrades
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.price, 0);
    
    // Calculate P/L from trades
    const tradingPL = activeTrades
      .filter(t => t.type === 'trade')
      .reduce((sum, t) => sum + t.pl, 0);
    
    // Total equity = deposits - withdrawals + trading P/L
    return deposits - withdrawals + tradingPL;
  };

  return {
    trades,
    loading,
    error,
    addTrade,
    addWithdrawal,
    addDeposit,
    calculateTotalEquity,
    updateTrade,
    softDeleteTrade,
    permanentDeleteTrade,
    restoreTrade,
    refetchTrades
  };
}
