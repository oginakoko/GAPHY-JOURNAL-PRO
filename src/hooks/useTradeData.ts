import { useState, useEffect } from 'react';
import { Trade, TradeType } from '../types';
import { supabase } from '../lib/supabase';

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

      const { id, ...tradeData } = trade as any;

      const newTrade = {
        ...tradeData,
        type: 'trade' as TradeType,
        user_id,
        qty: Number(trade.qty),
        price: Number(trade.price),
        pl: Number(trade.pl),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([newTrade])
        .select('*')
        .single();

      if (error) throw error;
      await fetchTrades();
      return data;
    } catch (err) {
      console.error('Error adding trade:', err);
      setError('Failed to add trade');
      return null;
    }
  };

  const addWithdrawal = async (amount: number, description: string = '') => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');
      if (amount <= 0) throw new Error('Withdrawal amount must be greater than 0');

      // First try to verify the schema
      const { error: schemaError } = await supabase
        .from('trades')
        .select('type, description')
        .limit(1);

      if (schemaError) {
        console.error('Schema verification failed:', schemaError);
        throw new Error('Database schema is not properly configured. Please contact support.');
      }

      const withdrawal = {
        user_id,
        type: 'withdrawal' as TradeType,
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

      // Try inserting with explicit column list
      const { data, error } = await supabase
        .from('trades')
        .insert([withdrawal])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        // If the error is related to schema cache, try to clear it
        if (error.message.includes('schema cache')) {
          await supabase.rest.removeCacheBySchema('public');
          throw new Error('Please try again - schema cache has been reset');
        }
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
    return trades.reduce((sum, item) => {
      if (item.type === 'withdrawal') {
        return sum - item.price;
      } else if (item.type === 'deposit') {
        return sum + item.price;
      } else {
        return sum + item.pl;
      }
    }, 0);
  };

  return {
    trades,
    loading,
    error,
    addTrade,
    addWithdrawal,
    calculateTotalEquity,
    updateTrade,
    softDeleteTrade,
    permanentDeleteTrade,
    restoreTrade,
    refetchTrades
  };
}
