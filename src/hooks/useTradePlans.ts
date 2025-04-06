import { useState, useEffect } from 'react';
import { TradePlan, ChecklistItem } from '../types';
import { supabase } from '../lib/supabase';

export function useTradePlans() {
  const [tradePlans, setTradePlans] = useState<TradePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTradePlans();
  }, []);

  const fetchTradePlans = async () => {
    try {
      const { data: plans, error: plansError } = await supabase
        .from('trade_plans')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      const plansWithChecklists = await Promise.all(
        (plans || []).map(async (plan) => {
          const { data: checklist, error: checklistError } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('trade_plan_id', plan.id)
            .order('created_at', { ascending: true });

          if (checklistError) throw checklistError;

          return {
            ...plan,
            checklist: checklist || []
          };
        })
      );

      setTradePlans(plansWithChecklists);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trade plans:', err);
      setError('Failed to fetch trade plans');
      setLoading(false);
    }
  };

  const addTradePlan = async (plan: Omit<TradePlan, 'id' | 'user_id'>) => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');

      // First create the plan
      const { data: newPlan, error: planError } = await supabase
        .from('trade_plans')
        .insert({
          name: plan.name,
          instrument: plan.instrument,
          user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (planError) throw planError;

      // Then add checklist items if any
      if (plan.checklist?.length) {
        const { error: checklistError } = await supabase
          .from('checklist_items')
          .insert(
            plan.checklist.map(item => ({
              trade_plan_id: newPlan.id,
              text: item.text,
              completed: item.completed,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          );

        if (checklistError) throw checklistError;
      }

      await fetchTradePlans();
      return newPlan;
    } catch (err) {
      console.error('Error adding trade plan:', err);
      setError('Failed to add trade plan');
      return null;
    }
  };

  const updateTradePlan = async (plan: TradePlan) => {
    try {
      const { error } = await supabase
        .from('trade_plans')
        .update({
          name: plan.name,
          instrument: plan.instrument,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (error) throw error;
      await fetchTradePlans(); // Refresh the plans list
      return true;
    } catch (err) {
      console.error('Error updating trade plan:', err);
      setError('Failed to update trade plan');
      return false;
    }
  };

  const deleteTradePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('trade_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      setTradePlans(prev => prev.filter(p => p.id !== planId));
      return true;
    } catch (err) {
      console.error('Error deleting trade plan:', err);
      setError('Failed to delete trade plan');
      return false;
    }
  };

  const updateChecklistItem = async (planId: string, item: ChecklistItem) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({ 
          text: item.text,
          completed: item.completed,
          updated_at: new Date().toISOString()
        })
        .match({ id: item.id, trade_plan_id: planId });

      if (error) throw error;
      
      // Update local state
      setTradePlans(prev => prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            checklist: plan.checklist.map(i => 
              i.id === item.id ? { ...i, text: item.text, completed: item.completed } : i
            )
          };
        }
        return plan;
      }));
      
      return true;
    } catch (err) {
      console.error('Error updating checklist item:', err);
      setError('Failed to update checklist item');
      return false;
    }
  };

  const addChecklistItem = async (planId: string, item: { text: string; completed: boolean }) => {
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          trade_plan_id: planId,
          text: item.text,
          completed: item.completed,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setTradePlans(prev => prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            checklist: [...plan.checklist, data]
          };
        }
        return plan;
      }));
      
      return data;
    } catch (err) {
      console.error('Error adding checklist item:', err);
      setError('Failed to add checklist item');
      return null;
    }
  };

  const deleteChecklistItem = async (planId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .match({ id: itemId, trade_plan_id: planId });

      if (error) throw error;
      
      // Update local state
      setTradePlans(prev => prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            checklist: plan.checklist.filter(item => item.id !== itemId)
          };
        }
        return plan;
      }));
      
      return true;
    } catch (err) {
      console.error('Error deleting checklist item:', err);
      setError('Failed to delete checklist item');
      return false;
    }
  };

  return {
    tradePlans,
    loading,
    error,
    addTradePlan,
    updateTradePlan,
    deleteTradePlan,
    updateChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    fetchTradePlans
  };
}
