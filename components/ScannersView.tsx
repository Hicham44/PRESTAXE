
import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { getLiveScannerResults } from '../services/geminiService';

interface ScannersViewProps {
  language: Language;
}

const ScannersView: React.FC<ScannersViewProps> = ({ language }) => {
  const t = translations[language];
  const [scanResult, setScanResult] = useState<{title: string, content: string, sources: any[]} | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Manual configuration state for Finviz
  const [finvizLogic, setFinvizLogic] = useState<string[]>([
    "SMA Align (20 > 50 > 200)", 
    "Avg Vol over 500K", 
    "Cur Vol over 1M", 
    "Perf Today Up"
  ]);
  const [isEditingFinviz, setIsEditingFinviz] = useState(false);

  const handleLiveScan = async (name: string, logic: string[]) => {
    setIsScanning(true);
    setScanResult(null);
    const result = await getLiveScannerResults(name, logic);
    setScanResult({
      title: name,
      content: result.text,
      sources: result.sources
    });
    setIsScanning(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
          <i className="fa-solid fa-microchip mr-4 text-indigo-500"></i>
          {t.marketScanners}
        </h2>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest max-w-2xl">
          High-performance quantitative filters for identifying institutional order flow and high-probability momentum setups across stocks and crypto.
        </p>
      </div>

      {/* Live Terminal Output */}
      <div className={`relative min-h-[400px] bg-[#0b0f1a] rounded-2xl border ${isScanning ? 'border-indigo-500/50' : 'border-[#1a1d23]'} shadow-2xl overflow-hidden transition-all duration-500`}>
        {/* Terminal Header */}
        <div className="bg-[#161b22] px-6 py-3 flex items-center justify-between border-b border-[#1a1d23]">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <span className="ml-4 text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest">
              Live Terminal Interface v5.1
            </span>
          </div>
          {scanResult && !isScanning && (
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-bold text-green-500 animate-pulse uppercase tracking-widest font-mono">
                Data Synchronized
              </span>
              <button 
                onClick={() => setScanResult(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-rotate-right text-xs"></i>
              </button>
            </div>
          )}
        </div>

        {/* Terminal Body */}
        <div className="p-8 font-mono">
          {!isScanning && !scanResult && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <i className="fa-solid fa-radar fa-beat text-6xl text-indigo-500/20"></i>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Select an engine below to begin interrogation</p>
                <p className="text-gray-600 text-xs italic">System idling... awaiting user directive...</p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-indigo-400">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span className="text-xs uppercase font-black tracking-widest">{t.scanning}</span>
              </div>
              <div className="space-y-2 opacity-50">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-1/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                  <span>Connecting to SMA Feed...</span>
                  <span>74% complete</span>
                </div>
              </div>
              <div className="pt-8 text-[11px] text-gray-600 space-y-1">
                <p>&gt; Checking SMA 20/50/200 Aligment...</p>
                <p>&gt; Scanning volume anomalies across 482 assets...</p>
                <p>&gt; Validating RSI momentum divergence...</p>
              </div>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">
                  Active Findings: {scanResult.title}
                </h4>
                <p className="text-gray-500 text-[10px] font-bold uppercase">Timestamp: {new Date().toLocaleTimeString()}</p>
              </div>

              <div className="bg-[#0f1115] rounded-xl border border-indigo-500/10 p-6 overflow-x-auto bloomberg-table">
                <div className="text-gray-300 prose prose-invert max-w-none prose-sm">
                  <div dangerouslySetInnerHTML={{ __html: scanResult.content.replace(/\n/g, '<br/>') || '' }} />
                </div>
              </div>

              {scanResult.sources && scanResult.sources.length > 0 && (
                <div className="flex items-center space-x-4 border-t border-[#1a1d23] pt-6">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Primary Sources:</span>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.sources.map((chunk: any, i: number) => (
                      chunk.web && (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 transition-all">
                          <i className="fa-solid fa-link mr-1.5"></i> {chunk.web.title || 'Market Feed'}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EngineCard 
          title={t.scannerMomentum}
          icon="fa-fire-flame-curved"
          color="text-orange-500"
          isScanning={isScanning}
          logic={[
            "EMA 20 > SMA 50 > EMA 200", 
            "RSI14 > 50 & RSI > RSI MA14", 
            "Pullback to EMA 20", 
            "Momentum Breakout Setup"
          ]}
          onRun={() => handleLiveScan(t.scannerMomentum, [
              "EMA 20 > SMA 50 > EMA 200", 
              "RSI14 > 50 & RSI > RSI MA14", 
              "Pullback to EMA 20 zone", 
              "Break of short-term consolidation"
          ])}
          t={t}
        />
        <EngineCard 
          title={t.scannerPro}
          icon="fa-tower-broadcast"
          color="text-indigo-400"
          isScanning={isScanning}
          isQuant={true}
          logic={[
            "Institutional Trend (SMA 20>50>200)", 
            "Price > SMA 200 (Stable)", 
            "Unextended Entry (Max 3% SMA20)", 
            "Volume Spike Detection"
          ]}
          onRun={() => handleLiveScan(t.scannerPro, [
              "Price > SMA200", 
              "SMA20 > SMA50", 
              "SMA50 > SMA200", 
              "Price proximity to SMA20 (within 3%)", 
              "Relative Volume > 2.0"
          ])}
          t={t}
        />
        <EngineCard 
          title={t.scannerOpen}
          icon="fa-bolt-lightning"
          color="text-yellow-500"
          isScanning={isScanning}
          logic={["Change % > 2%", "Volume > 1M", "Avg Vol > 500K", "ATR > 1", "Market = USA"]}
          onRun={() => handleLiveScan(t.scannerOpen, ["US Opening Gap & Go logic", "High volatility stocks", "Volume > 1 million in first 30 mins"])}
          t={t}
        />
        <EngineCard 
          title={t.scannerBuy}
          icon="fa-circle-chevron-up"
          color="text-green-500"
          isScanning={isScanning}
          logic={["Price > SMA200", "SMA20 > SMA50", "Pullback to SMA50", "Hammer or Bullish Pin Bar"]}
          onRun={() => handleLiveScan(t.scannerBuy, ["Institutional pullback setup", "Rejection of SMA 50", "High timeframe trend alignment"])}
          t={t}
        />
        <EngineCard 
          title={t.scannerSell}
          icon="fa-circle-chevron-down"
          color="text-red-500"
          isScanning={isScanning}
          logic={["Price < SMA200", "SMA20 < SMA50", "Pullback to EMA20", "Engulfing Red Candle"]}
          onRun={() => handleLiveScan(t.scannerSell, ["Bearish momentum exhaustion", "EMA 20 dynamic resistance", "Volume confirmation on drop"])}
          t={t}
        />
        <EngineCard 
          title={t.scannerFinviz}
          icon="fa-magnifying-glass-chart"
          color="text-cyan-500"
          isScanning={isScanning}
          logic={finvizLogic}
          onRun={() => handleLiveScan(t.scannerFinviz, finvizLogic)}
          t={t}
          isEditable={true}
          onEdit={() => setIsEditingFinviz(!isEditingFinviz)}
          isEditing={isEditingFinviz}
          onLogicChange={(newLogic) => setFinvizLogic(newLogic.split('\n').filter(l => l.trim() !== ''))}
        />
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

interface EngineCardProps {
  title: string;
  icon: string;
  color: string;
  logic: string[];
  isScanning: boolean;
  onRun: () => void;
  isQuant?: boolean;
  t: any;
  isEditable?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onLogicChange?: (logic: string) => void;
}

const EngineCard: React.FC<EngineCardProps> = ({ 
  title, icon, color, logic, isScanning, onRun, isQuant, t, 
  isEditable, isEditing, onEdit, onLogicChange 
}) => (
  <div className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full group relative ${
    isEditing ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 
    isQuant ? 'bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-500/40 shadow-2xl shadow-indigo-500/5' : 
    'bg-[#1a1d23] border-[#2d333b] hover:border-gray-600 shadow-xl'
  }`}>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl bg-[#0b0f1a] flex items-center justify-center ${color} shadow-lg border border-white/5 group-hover:scale-110 transition-transform`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
        <div>
          <span className={`text-xs font-black uppercase tracking-widest block leading-none ${isQuant ? 'text-indigo-400' : 'text-gray-100'}`}>
            {title}
          </span>
          <span className="text-[8px] text-gray-500 font-black uppercase tracking-tighter mt-1.5 block">
            {isQuant ? 'Institutional Grade v5.2' : 'Quantitative Filter v1.8'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isEditable && (
          <button 
            onClick={onEdit}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isEditing ? 'bg-indigo-600 text-white' : 'bg-[#0b0f1a] text-gray-500 hover:text-white border border-white/5'}`}
          >
            <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-gear'} text-[10px]`}></i>
          </button>
        )}
        {isQuant && (
          <div className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest">
            ALPHA
          </div>
        )}
      </div>
    </div>

    <div className="flex-1 mb-8 overflow-hidden">
      {isEditing ? (
        <textarea
          className="w-full h-full bg-[#0b0f1a] border border-indigo-500/30 rounded-xl p-4 text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
          value={logic.join('\n')}
          onChange={(e) => onLogicChange?.(e.target.value)}
          placeholder="Enter one logic rule per line..."
        />
      ) : (
        <ul className="space-y-2">
          {logic.map((l, i) => (
            <li key={i} className={`flex items-start text-[10px] font-mono leading-relaxed ${isQuant ? 'text-indigo-200/50' : 'text-gray-500'}`}>
              <i className={`fa-solid fa-chevron-right text-[7px] mt-1.5 mr-3 flex-shrink-0 ${isQuant ? 'text-indigo-500' : 'text-indigo-500/30'}`}></i>
              {l}
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="grid grid-cols-2 gap-3 mt-auto">
      <button 
        onClick={() => navigator.clipboard.writeText(logic.join('\n'))}
        className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all"
      >
        {t.copyLogic}
      </button>
      <button 
        disabled={isScanning || isEditing}
        onClick={onRun}
        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-2 ${
          isQuant 
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 active:scale-95' 
          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
        } ${isScanning || isEditing ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <i className="fa-solid fa-bolt text-[8px]"></i>
        <span>{t.liveScan}</span>
      </button>
    </div>
  </div>
);

export default ScannersView;
