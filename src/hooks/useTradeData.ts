import { useState, useEffect } from 'react';
import { Trade } from '../types';
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
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
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

      // Remove id from trade object and let Supabase generate it
      const { id, ...tradeData } = trade as any;

      const newTrade = {
        ...tradeData,
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
      setTrades(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding trade:', err);
      setError('Failed to add trade');
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
        .match({ id: trade.id });  // Use match instead of eq

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
      // Update local state first
      setTrades(prev => prev.map(t => 
        t.id === id 
          ? { ...t, deleted: true, deleted_at: new Date().toISOString() } 
          : t
      ));

      // Then update in Supabase
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
      // Update local state first
      setTrades(prev => prev.map(t => 
        t.id === id 
          ? { ...t, deleted: false, deleted_at: null } 
          : t
      ));

      // Then update in Supabase
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

  return { 
    trades, 
    loading, 
    error, 
    addTrade, 
    updateTrade, 
    softDeleteTrade, 
    permanentDeleteTrade,
    restoreTrade 
  };
}
