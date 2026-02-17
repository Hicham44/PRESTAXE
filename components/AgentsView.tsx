
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../translations';
import { getGoldMacroAnalysis } from '../services/geminiService';

interface AgentsViewProps {
  language: Language;
}

type TradeAsset = 'XAU' | 'NQ';

const AgentsView: React.FC<AgentsViewProps> = ({ language }) => {
  const t = translations[language];
  const [activeAsset, setActiveAsset] = useState<TradeAsset>('XAU');
  const [macro, setMacro] = useState<{ text: string; sources: any[] }>({ text: 'Recherche de catalyseurs macro...', sources: [] });
  const [isSyncing, setIsSyncing] = useState(false);

  // État de la stratégie Session NY (9:30 EST)
  const [strategyData, setStrategyData] = useState({
    XAU: { high: 2650.50, low: 2642.20, current: 2652.10, sl: 5, multiplier: 10 },
    NQ: { high: 18450.00, low: 18380.00, current: 18465.50, sl: 25, multiplier: 5 }
  });

  const [riskCapital, setRiskCapital] = useState(50000);
  const [riskPercent, setRiskPercent] = useState(0.5);

  const current = strategyData[activeAsset];

  // LOGIQUE RISKSTRUCTAI (Portfolio Manager Desk)
  const isBreakoutUp = current.current > current.high;
  const isBreakoutDown = current.current < current.low;
  const bias = isBreakoutUp ? 'LONG' : isBreakoutDown ? 'SHORT' : 'NO TRADE';
  
  const stopLoss = isBreakoutUp ? current.high - current.sl : isBreakoutDown ? current.low + current.sl : 0;
  const takeProfit = isBreakoutUp ? current.current + ((current.current - stopLoss) * 2) : isBreakoutDown ? current.current - ((stopLoss - current.current) * 2) : 0;
  
  // CALCULS DE RISQUE (Risk Desk)
  const riskAmount = riskCapital * (riskPercent / 100);
  const riskPerUnit = Math.abs(current.current - stopLoss);
  const maxLots = riskPerUnit > 0 ? (riskAmount / (riskPerUnit * current.multiplier)).toFixed(2) : '0.00';

  const fetchMacro = async () => {
    setIsSyncing(true);
    const result = await getGoldMacroAnalysis(); 
    setMacro(result);
    setIsSyncing(false);
  };

  useEffect(() => {
    fetchMacro();
  }, [activeAsset]);

  const updateVal = (key: 'high' | 'low' | 'current', val: number) => {
    setStrategyData(prev => ({
      ...prev,
      [activeAsset]: { ...prev[activeAsset], [key]: val }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      
      {/* 🧭 NAVIGATION DESK */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex bg-[#0b0f1a] p-1.5 rounded-2xl border border-[#2d333b] shadow-2xl">
          <button 
            onClick={() => setActiveAsset('XAU')}
            className={`px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center space-x-3 ${activeAsset === 'XAU' ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <i className="fa-solid fa-coins"></i>
            <span>GOLD ENGINE</span>
          </button>
          <button 
            onClick={() => setActiveAsset('NQ')}
            className={`px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center space-x-3 ${activeAsset === 'NQ' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <i className="fa-solid fa-bolt-lightning"></i>
            <span>NASDAQ QUANT</span>
          </button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
             <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Risk Allocation</p>
             <div className="flex items-center space-x-3">
                <input 
                  type="number" value={riskPercent} step="0.1" 
                  onChange={e => setRiskPercent(Number(e.target.value))}
                  className="w-16 bg-transparent border-b border-gray-800 text-xs font-black text-indigo-400 focus:outline-none focus:border-indigo-500 text-center"
                />
                <span className="text-xs font-black text-gray-500">%</span>
             </div>
          </div>
          <div className="h-10 w-[1px] bg-gray-800"></div>
          <button 
            onClick={fetchMacro}
            className={`px-6 py-3.5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl group ${activeAsset === 'XAU' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'}`}
          >
            <i className={`fa-solid fa-satellite-dish mr-2 group-hover:animate-pulse ${isSyncing ? 'fa-spin' : ''}`}></i>
            Sync Intelligence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1️⃣ FUNDAMENTALBOT (Research Desk) */}
        <div className="bg-[#14171d] rounded-[2.5rem] border border-[#2d333b] p-8 space-y-8 relative overflow-hidden flex flex-col min-h-[550px] shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <i className="fa-solid fa-newspaper text-9xl"></i>
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={`${activeAsset === 'XAU' ? 'text-amber-500' : 'text-indigo-400'} text-[10px] font-black uppercase tracking-[0.4em] mb-1`}>{t.fundamentalBot}</h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Research Desk • Institutional NLP</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          
          <div className="flex-1 space-y-5 relative z-10">
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 backdrop-blur-sm min-h-[300px]">
              <div className="text-[11px] text-gray-300 leading-relaxed font-medium space-y-4">
                {macro.text.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('-') ? 'pl-4 text-gray-400' : 'font-bold'}>{line}</p>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase mb-1">DXY Impact</p>
                  <p className="text-xs font-black text-rose-500">-0.18% (Inverse)</p>
               </div>
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase mb-1">VIX Gauge</p>
                  <p className="text-xs font-black text-emerald-500">13.88 (Stable)</p>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black">
             <span className="text-gray-600 uppercase">Regime</span>
             <span className="text-indigo-400 tracking-widest uppercase">Intraday Momentum</span>
          </div>
        </div>

        {/* 2️⃣ RISKSTRUCTAI (Portfolio Manager / Risk Desk) */}
        <div className={`bg-[#14171d] rounded-[2.5rem] border p-8 space-y-8 relative overflow-hidden shadow-2xl transition-all duration-700 ${activeAsset === 'XAU' ? 'border-amber-500/20' : 'border-indigo-500/20'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <i className="fa-solid fa-calculator text-9xl"></i>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={`${activeAsset === 'XAU' ? 'text-amber-500' : 'text-indigo-400'} text-[10px] font-black uppercase tracking-[0.4em] mb-1`}>{t.riskStructAI}</h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Risk Desk • {activeAsset} Strategy</p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${activeAsset === 'XAU' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
               Active Logic
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">4H Prev High</label>
                   <input 
                      type="number" step="0.01" value={current.high}
                      onChange={e => updateVal('high', Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-black text-white focus:outline-none focus:border-indigo-500"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">4H Prev Low</label>
                   <input 
                      type="number" step="0.01" value={current.low}
                      onChange={e => updateVal('low', Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-black text-white focus:outline-none focus:border-indigo-500"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">9:35 EST Breakout Price</label>
                <div className="relative">
                   <input 
                      type="number" step="0.01" value={current.current}
                      onChange={e => updateVal('current', Number(e.target.value))}
                      className={`w-full bg-black/40 rounded-3xl px-6 py-5 text-2xl font-black text-white focus:outline-none border-2 transition-all ${activeAsset === 'XAU' ? 'border-amber-500/30 focus:border-amber-500 shadow-lg shadow-amber-900/10' : 'border-indigo-500/30 focus:border-indigo-500 shadow-lg shadow-indigo-900/10'}`}
                   />
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-black text-xs">
                      {activeAsset === 'XAU' ? 'USD/OZ' : 'PTS'}
                   </div>
                </div>
             </div>

             <div className={`p-8 rounded-[2rem] border transition-all duration-700 ${bias === 'LONG' ? 'bg-emerald-500/5 border-emerald-500/20' : bias === 'SHORT' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-gray-800/5 border-white/5'}`}>
                <div className="flex justify-between items-center mb-6">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Alpha Strategy Bias</p>
                   <span className={`text-[10px] font-black px-5 py-2 rounded-xl shadow-xl transition-all ${bias === 'LONG' ? 'bg-emerald-600 text-white shadow-emerald-900/20' : bias === 'SHORT' ? 'bg-rose-600 text-white shadow-rose-900/20' : 'bg-gray-800 text-gray-400'}`}>
                      {bias}
                   </span>
                </div>
                
                {bias !== 'NO TRADE' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                       <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Stop Loss</p>
                       <p className="text-sm font-black text-white">${stopLoss.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                       <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Take Profit (2R)</p>
                       <p className="text-sm font-black text-white">${takeProfit.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-[10px] text-gray-600 font-black uppercase italic tracking-widest opacity-50">Awaiting High/Low Breach...</p>
                  </div>
                )}
             </div>

             <div className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${activeAsset === 'XAU' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Position Size</p>
                  <p className={`text-3xl font-black tracking-tighter ${activeAsset === 'XAU' ? 'text-amber-500' : 'text-indigo-400'}`}>{maxLots}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Risk Amount</p>
                  <p className="text-lg font-black text-white">${riskAmount.toFixed(0)}</p>
                </div>
             </div>
          </div>
        </div>

        {/* 3️⃣ EXECTRADEBOT (Execution Desk) */}
        <div className={`bg-[#14171d] rounded-[2.5rem] border p-8 space-y-8 relative overflow-hidden shadow-2xl flex flex-col transition-all duration-700 ${activeAsset === 'XAU' ? 'border-amber-500/20' : 'border-indigo-500/20'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <i className="fa-solid fa-bolt text-9xl"></i>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t.execTradeBot}</h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Execution Desk • DMA Low Latency</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <i className="fa-solid fa-microchip text-emerald-500 text-sm"></i>
            </div>
          </div>
          
          <div className="flex-1 space-y-6 relative z-10">
             <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Terminal Status</p>
                   <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                      Connected
                   </span>
                </div>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-500 uppercase">Latency (MS)</span>
                      <span className="text-white">14.2</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-500 uppercase">Session Phase</span>
                      <span className="text-indigo-400">NY OPEN</span>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Bot Performance Engine</p>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 bg-gray-900/30 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Win Probability</p>
                      <p className="text-sm font-black text-emerald-500">62.8%</p>
                   </div>
                   <div className="p-4 bg-gray-900/30 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Avg Slippage</p>
                      <p className="text-sm font-black text-white">0.2 pts</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-6 space-y-3 relative z-10">
             <button 
               disabled={bias === 'NO TRADE'}
               className={`group w-full py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.25em] transition-all shadow-2xl flex items-center justify-center space-x-3 active:scale-[0.98] ${bias === 'LONG' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white' : bias === 'SHORT' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40 text-white' : 'bg-gray-800/40 text-gray-600 border border-gray-800/60 opacity-50 cursor-not-allowed'}`}
             >
                <i className={`fa-solid ${bias === 'LONG' ? 'fa-arrow-trend-up' : bias === 'SHORT' ? 'fa-arrow-trend-down' : 'fa-lock'} text-sm group-hover:scale-110 transition-transform`}></i>
                <span>{bias === 'NO TRADE' ? 'Market In Range' : `Deploy ${activeAsset} ${bias}`}</span>
             </button>
             
             <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-gray-600 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">
                Institutional Audit Log
             </button>
          </div>
        </div>
      </div>

      {/* 🛡️ INFRASTRUCTURE FOOTER */}
      <div className={`p-10 bg-[#14171d] rounded-[3.5rem] border shadow-2xl transition-all duration-700 ${activeAsset === 'XAU' ? 'border-amber-500/10' : 'border-indigo-500/10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-center">
           <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl ${activeAsset === 'XAU' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                 <i className="fa-solid fa-server text-2xl"></i>
              </div>
              <div>
                 <p className="text-[12px] font-black text-white uppercase tracking-widest mb-1">Desk Engine V9.0</p>
                 <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Prop Firm Compliance Active</p>
              </div>
           </div>
           <div className="col-span-1 md:col-span-3">
              <div className="flex flex-wrap gap-5 justify-end">
                 <TerminalMetric label="Feed Type" value="Direct DMA" />
                 <TerminalMetric label="Encryption" value="AES-256" />
                 <TerminalMetric label="Risk Filter" value="Max 1.0%" color="text-amber-500" />
                 <TerminalMetric label="AI Sync" value="REALTIME" color="text-emerald-500" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const TerminalMetric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-gray-400" }) => (
  <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[120px]">
    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">{label}</span>
    <span className={`text-[10px] font-black ${color} uppercase tracking-widest`}>{value}</span>
  </div>
);

export default AgentsView;
