
import React, { useState } from 'react';
import { Direction, Trade } from '../types';
import { Language, translations } from '../translations';

interface TradeFormProps {
  onSave: (trade: Trade) => void;
  onClose: () => void;
  language: Language;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSave, onClose, language }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    asset: '',
    direction: Direction.BUY,
    lots: 1,
    pnl: 0,
    strategy: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      timestamp: new Date().toISOString(),
    };
    onSave(newTrade);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1d23] border border-[#2d333b] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="p-6 border-b border-[#2d333b] flex justify-between items-center bg-[#0f1115]">
          <h3 className="text-lg font-bold text-gray-100 flex items-center">
            <i className="fa-solid fa-plus-circle text-indigo-500 mr-2"></i>
            {t.manualEntry}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.asset}</label>
              <input 
                required
                type="text" 
                className="w-full bg-[#0f1115] border border-[#2d333b] rounded-xl px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                value={formData.asset}
                onChange={e => setFormData({...formData, asset: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.direction}</label>
              <select 
                className="w-full bg-[#0f1115] border border-[#2d333b] rounded-xl px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                value={formData.direction}
                onChange={e => setFormData({...formData, direction: e.target.value as Direction})}
              >
                <option value={Direction.BUY}>{t.buy}</option>
                <option value={Direction.SELL}>{t.sell}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.size}</label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full bg-[#0f1115] border border-[#2d333b] rounded-xl px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                value={formData.lots}
                onChange={e => setFormData({...formData, lots: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.netResult}</label>
              <input 
                required
                type="number" 
                step="0.01"
                className={`w-full bg-[#0f1115] border border-[#2d333b] rounded-xl px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 ${formData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
                value={formData.pnl}
                onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.strategy}</label>
            <input 
              type="text" 
              className="w-full bg-[#0f1115] border border-[#2d333b] rounded-xl px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
              value={formData.strategy}
              onChange={e => setFormData({...formData, strategy: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98]"
            >
              {t.saveTrade}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
