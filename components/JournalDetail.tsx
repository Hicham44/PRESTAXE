
import React, { useState } from 'react';
import { DailyJournal, Emotion, Direction, Trade } from '../types';
import TradeForm from './TradeForm';
import { Language, translations } from '../translations';
import { GoogleGenAI } from "@google/genai";

interface JournalDetailProps {
  journal: DailyJournal;
  onUpdate: (journal: DailyJournal) => void;
  onBack: () => void;
  language: Language;
}

const JournalDetail: React.FC<JournalDetailProps> = ({ journal, onUpdate, onBack, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = React.useState<'trades' | 'psychology' | 'analysis'>('trades');
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const handleSaveTrade = (newTrade: Trade) => {
    onUpdate({
      ...journal,
      trades: [...journal.trades, newTrade]
    });
    setIsAddingTrade(false);
  };

  const removeTrade = (id: string) => {
    onUpdate({
      ...journal,
      trades: journal.trades.filter(t => t.id !== id)
    });
  };

  const updatePsychology = (updates: Partial<DailyJournal>) => {
    onUpdate({ ...journal, ...updates });
  };

  const handleAiRefine = async () => {
    if (!journal.notes || journal.notes.length < 10) return;
    setIsRefining(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Professionalize the following trading journal notes. 
      Improve grammar, use institutional terminology, and provide a constructive critique in the third person.
      Maintain the original intent but make it sound like it was written by a Senior Portfolio Manager.
      
      Original Notes: "${journal.notes}"
      Format: Clean Markdown.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      if (response.text) {
        onUpdate({ ...journal, notes: response.text });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const totalPnl = journal.trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12">
      {isAddingTrade && (
        <TradeForm 
          onSave={handleSaveTrade} 
          onClose={() => setIsAddingTrade(false)} 
          language={language}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors w-fit group">
          <i className={`fa-solid ${language === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'} group-hover:-translate-x-1 transition-transform`}></i>
          <span className="font-bold uppercase tracking-widest text-[10px]">{t.backToCalendar}</span>
        </button>
        <div className={`text-left ${language === 'ar' ? 'md:text-left' : 'md:text-right'}`}>
          <h2 className="text-2xl font-black text-gray-100">{new Date(journal.date).toLocaleDateString(language, { dateStyle: 'full' })}</h2>
          <div className={`flex items-center space-x-3 mt-1 ${language === 'ar' ? 'md:justify-start' : 'md:justify-end'}`}>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Day Total</span>
              <p className={`text-xl font-black ${totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex space-x-8 border-b border-[#1a1d23]">
            {(['trades', 'psychology', 'analysis'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 font-black uppercase tracking-widest text-[10px] transition-all relative ${
                  activeTab === tab ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t[tab as keyof typeof t] || tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'trades' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-widest">{t.totalTrades} ({journal.trades.length})</h3>
                  <button 
                    onClick={() => setIsAddingTrade(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center"
                  >
                    <i className="fa-solid fa-plus mr-2"></i>
                    {t.addTrade}
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-[#2d333b] bg-[#14171d] shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0b0f1a]">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.asset}</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.side}</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.strategy}</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.size}</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">P&L</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2d333b]">
                        {journal.trades.map(trade => (
                          <tr key={trade.id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-8 py-6">
                              <div className="font-bold text-gray-100">{trade.asset}</div>
                              <div className="text-[9px] text-gray-500 font-mono font-bold">{new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                trade.direction === Direction.BUY ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}>
                                {trade.direction === Direction.BUY ? t.buy : t.sell}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                              {trade.strategy || 'Unassigned'}
                            </td>
                            <td className="px-8 py-6 font-mono text-xs text-gray-400 font-bold">{trade.lots}</td>
                            <td className={`px-8 py-6 font-black font-mono ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => removeTrade(trade.id)} 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <i className="fa-solid fa-trash-can text-sm"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'psychology' && (
              <div className="space-y-12 animate-in fade-in duration-300 bg-[#14171d] rounded-3xl border border-[#2d333b] p-10 shadow-2xl">
                <div>
                  <h3 className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] mb-8">{t.emotion}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.values(Emotion).map(emotion => (
                      <button
                        key={emotion}
                        onClick={() => updatePsychology({ emotion })}
                        className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border transition-all ${
                          journal.emotion === emotion 
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-900/10' 
                            : 'bg-[#0b0f1a] border-[#2d333b] text-gray-500 hover:border-gray-600 hover:text-gray-300'
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest">{emotion}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">{t.discipline}</h3>
                    <span className="text-2xl font-black text-indigo-400 font-mono">{journal.disciplineScore}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" step="1"
                    value={journal.disciplineScore}
                    onChange={(e) => updatePsychology({ disciplineScore: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#0b0f1a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    <span>Reckless</span>
                    <span>Perfect Execution</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-[500px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">{t.notes}</h3>
                  <button 
                    onClick={handleAiRefine}
                    disabled={isRefining || !journal.notes}
                    className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                  >
                    <i className={`fa-solid ${isRefining ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                    <span>Coach T® Refine</span>
                  </button>
                </div>
                <textarea
                  className="flex-1 w-full bg-[#14171d] border border-[#2d333b] rounded-3xl p-8 text-gray-200 font-medium placeholder:text-gray-700 focus:outline-none focus:border-indigo-500 transition-colors resize-none shadow-2xl leading-relaxed"
                  placeholder="Draft your market post-mortem here..."
                  value={journal.notes}
                  onChange={(e) => updatePsychology({ notes: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="bg-[#14171d] rounded-3xl border border-[#2d333b] p-8 shadow-2xl">
             <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-6">{t.checklist}</h3>
             <div className="space-y-4">
                <CheckItem 
                  label={t.followedPlan} 
                  checked={journal.checklist.followedPlan} 
                  onChange={(val) => updatePsychology({ checklist: {...journal.checklist, followedPlan: val} })}
                />
                <CheckItem 
                  label={t.controlledRisk} 
                  checked={journal.checklist.controlledRisk} 
                  onChange={(val) => updatePsychology({ checklist: {...journal.checklist, controlledRisk: val} })}
                />
                <CheckItem 
                  label={t.noRevengeTrade} 
                  checked={journal.checklist.noRevengeTrade} 
                  onChange={(val) => updatePsychology({ checklist: {...journal.checklist, noRevengeTrade: val} })}
                />
                <CheckItem 
                  label={t.properSetup} 
                  checked={journal.checklist.properSetup} 
                  onChange={(val) => updatePsychology({ checklist: {...journal.checklist, properSetup: val} })}
                />
             </div>
           </div>

           <div className="bg-indigo-600/5 rounded-3xl border border-indigo-500/20 p-8 shadow-xl">
             <div className="flex items-center space-x-3 mb-4">
               <i className="fa-solid fa-circle-info text-indigo-400 text-sm"></i>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">TradeMind Advice</span>
             </div>
             <p className="text-sm text-gray-300 font-semibold italic leading-relaxed">
               Stick to the process. Your discipline score is the only metric that matters in the long run.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ label: string; checked: boolean; onChange: (val: boolean) => void }> = ({ label, checked, onChange }) => (
  <button 
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between w-full group"
  >
    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${checked ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'border-[#2d333b] group-hover:border-gray-600'}`}>
      {checked && <i className="fa-solid fa-check text-[10px]"></i>}
    </div>
  </button>
);

export default JournalDetail;
