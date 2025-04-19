import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Trade, InstrumentType } from '../types';

interface TradeFormProps {
  trade?: Trade;
  onSubmit: (trade: Trade) => void;
  onClose: () => void;
  selectedInstrument: InstrumentType;
}

function TradeForm({ trade, onSubmit, onClose, selectedInstrument }: TradeFormProps) {
  const [formData, setFormData] = useState<Partial<Trade>>(trade || {
    symbol: '',
    date: new Date().toISOString().split('T')[0],
    side: 'Buy',
    qty: '',  // Change from 0 to ''
    price: '', // Change from 0 to ''
    pl: '',    // Change from 0 to ''
    instrument: selectedInstrument === 'all' ? 'Stocks' : selectedInstrument
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(trade?.screenshot);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        setFormData({ ...formData, screenshot: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      qty: Number(formData.qty) || 0,
      price: Number(formData.price) || 0,
      pl: Number(formData.pl) || 0
    } as Trade);
  };

  const getSymbolLabel = () => {
    switch (selectedInstrument) {
      case 'Forex':
        return 'Currency Pair';
      case 'Crypto':
        return 'Token/Coin';
      case 'Options':
        return 'Contract';
      default:
        return 'Symbol';
    }
  };

  const getQtyLabel = () => {
    switch (selectedInstrument) {
      case 'Forex':
        return 'Lot Size';
      case 'Options':
        return 'Contracts';
      default:
        return 'Quantity';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">{trade ? 'Edit Trade' : 'New Trade'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedInstrument === 'all' && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Instrument Type</label>
                  <select
                    value={formData.instrument}
                    onChange={e => setFormData({ ...formData, instrument: e.target.value as InstrumentType })}
                    className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                    required
                  >
                    <option value="Stocks">Stocks</option>
                    <option value="Options">Options</option>
                    <option value="Forex">Forex</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Futures">Futures</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">{getSymbolLabel()}</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Side</label>
                <select
                  value={formData.side}
                  onChange={e => setFormData({ ...formData, side: e.target.value as 'Buy' | 'Sell' })}
                  className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                  required
                >
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">{getQtyLabel()}</label>
                <input
                  type="number"
                  value={formData.qty}
                  onChange={e => setFormData({ 
                    ...formData, 
                    qty: formData.instrument === 'Forex' 
                      ? parseFloat(e.target.value) 
                      : parseInt(e.target.value) 
                  })}
                  className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                  required
                  min={formData.instrument === 'Forex' ? '0.01' : '1'}
                  step={formData.instrument === 'Forex' ? '0.01' : '1'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                  required
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">P/L</label>
                <input
                  type="number"
                  value={formData.pl}
                  onChange={e => setFormData({ ...formData, pl: parseFloat(e.target.value) })}
                  className="w-full bg-[#252525] rounded px-4 py-2 text-white"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Screenshot</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#252525] px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                </div>
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="Trade Screenshot" className="max-h-40 rounded" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#303030]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200"
                >
                  {trade ? 'Save Changes' : 'Add Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradeForm;