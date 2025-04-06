import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TradingAccount } from '../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        // Don't throw on 404, just set empty accounts
        if (error.code === '404') {
          setAccounts([]);
          setTotalBalance(0);
        } else {
          throw error;
        }
      } else {
        setAccounts(data || []);
        setTotalBalance(data?.reduce((sum, acc) => sum + acc.initial_balance, 0) || 0);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      setLoading(false);
    }
  };

  return { accounts, totalBalance, loading, error };
}
