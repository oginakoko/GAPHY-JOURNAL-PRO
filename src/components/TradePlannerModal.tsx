import React, { useState } from 'react';
import { X, Plus, Trash, Edit2, Save, Check } from 'lucide-react';
import { TradePlan, InstrumentType, ChecklistItem } from '../types';
import { useTradePlans } from '../hooks/useTradePlans';

interface TradePlannerModalProps {
  onClose: () => void;
}

function TradePlannerModal({ onClose }: TradePlannerModalProps) {
  const { tradePlans, loading, error, addTradePlan, updateTradePlan, deleteTradePlan, addChecklistItem, deleteChecklistItem, updateChecklistItem } = useTradePlans();
  const [newPlan, setNewPlan] = useState<Partial<TradePlan>>({
    name: '',
    instrument: 'Stocks',
    checklist: []
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editedPlanName, setEditedPlanName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemText, setEditedItemText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const markAsChanged = () => {
    setHasChanges(true);
  };

  const handleApplyChanges = async () => {
    if (editingPlanId) {
      const plan = tradePlans.find(p => p.id === editingPlanId);
      if (plan) {
        await handleSaveEdit(plan);
      }
    }
    if (editingItemId) {
      const plan = tradePlans.find(p =>
        p.checklist.some(item => item.id === editingItemId)
      );
      if (plan) {
        const item = plan.checklist.find(i => i.id === editingItemId);
        if (item) {
          await handleSaveItem(plan.id, item.id);
        }
      }
    }
    setHasChanges(false);
    onClose();
  };

  const handleAddPlan = async () => {
    if (!newPlan.name) return;

    await addTradePlan({
      name: newPlan.name,
      instrument: newPlan.instrument as InstrumentType,
      checklist: []
    });

    setNewPlan({ name: '', instrument: 'Stocks', checklist: [] });
    markAsChanged();
  };

  const handleEditPlan = (plan: TradePlan) => {
    setEditingPlanId(plan.id);
    setEditedPlanName(plan.name);
  };

  const handleSaveEdit = async (plan: TradePlan) => {
    if (!editedPlanName.trim()) return;

    await updateTradePlan({
      ...plan,
      name: editedPlanName
    });
    setEditingPlanId(null);
  };

  const handleAddChecklistItem = async (plan: TradePlan) => {
    if (!newChecklistItem.trim()) return;

    await addChecklistItem(plan.id, {
      text: newChecklistItem,
      completed: false
    });
    setNewChecklistItem('');
    markAsChanged();
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      await deleteTradePlan(planId);
      markAsChanged();
    }
  };

  const handleDeleteChecklistItem = async (planId: string, itemId: string) => {
    if (window.confirm('Are you sure you want to delete this checklist item?')) {
      await deleteChecklistItem(planId, itemId);
      markAsChanged();
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditedItemText(item.text);
  };

  const handleSaveItem = async (planId: string, itemId: string) => {
    if (!editedItemText.trim()) return;

    await updateChecklistItem(planId, {
      id: itemId,
      text: editedItemText,
      completed: false
    });

    setEditingItemId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-2xl p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Trade Planner</h2>
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={handleApplyChanges}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Apply Changes
              </button>
            )}
            <button
              onClick={() => {
                if (hasChanges && !confirm('You have unsaved changes. Are you sure you want to close?')) {
                  return;
                }
                onClose();
              }}
              className="hover:bg-[#252525] p-2 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Create New Plan Form */}
          <div className="bg-[#252525] p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Create New Plan</h3>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/90 mb-2">Plan Name</label>
              <input
                type="text"
                placeholder="Plan Name"
                value={newPlan.name}
                onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                className="w-full bg-[#1A1A1A] rounded px-4 py-2"
              />
              <select
                value={newPlan.instrument}
                onChange={e => setNewPlan({ ...newPlan, instrument: e.target.value as InstrumentType })}
                className="w-full bg-[#1A1A1A] rounded px-4 py-2"
              >
                <option value="Stocks">Stocks</option>
                <option value="Options">Options</option>
                <option value="Forex">Forex</option>
                <option value="Crypto">Crypto</option>
                <option value="Futures">Futures</option>
              </select>
              <button
                onClick={handleAddPlan}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Plan
              </button>
            </div>
          </div>

          {/* Existing Plans */}
          <div className="space-y-4">
            <div className="text-sm text-white/80 mb-4">Your Trade Plans</div>
            {tradePlans.map(plan => (
              <div key={plan.id} className="bg-[#252525] p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  {editingPlanId === plan.id ? (
                    <input
                      type="text"
                      value={editedPlanName}
                      onChange={(e) => setEditedPlanName(e.target.value)}
                      className="bg-[#1A1A1A] rounded px-4 py-2 flex-1 mr-2"
                      autoFocus
                    />
                  ) : (
                    <h4 className="text-lg font-medium">{plan.name}</h4>
                  )}
                  <div className="flex gap-2">
                    {editingPlanId === plan.id ? (
                      <button
                        onClick={() => handleSaveEdit(plan)}
                        className="hover:bg-blue-500 p-2 rounded"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="hover:bg-[#303030] p-2 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="hover:bg-red-500 p-2 rounded"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90 mb-2">Checklist Items</label>
                  {plan.checklist?.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => updateTradePlan({
                          ...plan,
                          checklist: plan.checklist.map(i =>
                            i.id === item.id ? { ...i, completed: !i.completed } : i
                          )
                        })}
                        className="rounded bg-[#1A1A1A]"
                      />
                      {editingItemId === item.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editedItemText}
                            onChange={(e) => setEditedItemText(e.target.value)}
                            className="flex-1 bg-[#1A1A1A] rounded px-4 py-2"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveItem(plan.id, item.id)}
                            className="hover:bg-blue-500 p-2 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span>{item.text}</span>
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="hover:text-blue-500"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChecklistItem(plan.id, item.id)}
                              className="hover:text-red-500"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Checklist Item */}
                <form 
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddChecklistItem(plan);
                  }}
                >
                  <span className="text-sm text-white/80">Add items to your checklist below</span>
                  <input
                    type="text"
                    placeholder="Add new checklist item"
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] rounded px-4 py-2"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradePlannerModal;