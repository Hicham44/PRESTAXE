
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { DailyJournal, Statistics, Direction, Trade } from '../types';
import { Language, translations } from '../translations';
import { DashboardTab, Timeframe } from './Layout';

interface DashboardProps {
  journals: Record<string, DailyJournal>;
  aiAdvice: string;
  language: Language;
  activeTab: DashboardTab;
  timeframe: Timeframe;
}

const CircularGauge: React.FC<{ label: string; value: string; subLabel: string; percentage: number; color: string; secondaryColor?: string }> = ({ 
  label, value, subLabel, percentage, color, secondaryColor = 'text-gray-800'
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative w-28 h-28 mb-4">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
        <circle
          className={`${secondaryColor} stroke-current opacity-10`}
          cx="18" cy="18" r="15.9155"
          fill="none"
          strokeWidth="3.5"
        />
        <circle
          className={`${color} stroke-current transition-all duration-1000 ease-out`}
          strokeDasharray={`${percentage}, 100`}
          strokeDashoffset="0"
          cx="18" cy="18" r="15.9155"
          fill="none"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-base font-black text-white font-mono tracking-tighter">{value}</span>
      </div>
    </div>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{subLabel}</span>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ journals, aiAdvice, language, activeTab, timeframe }) => {
  const t = translations[language];
  
  const journalsArray = useMemo(() => Object.values(journals), [journals]);
  
  // Logical timeframe shifts to simulate real data changes
  const tfStats = useMemo(() => {
    const baseMult = timeframe === '15m' ? 0.05 : 
                    timeframe === '1h' ? 0.15 : 
                    timeframe === '1M' ? 0.60 : 
                    timeframe === '1y' ? 0.90 : 1.0;
    
    let totalPnl = 0;
    let wins = 0;
    let totalTrades = 0;
    let winSum = 0;
    let lossSum = 0;

    journalsArray.forEach(j => {
      j.trades.forEach(trade => {
        totalTrades++;
        totalPnl += trade.pnl;
        if (trade.pnl > 0) {
          wins++;
          winSum += trade.pnl;
        } else {
          lossSum += Math.abs(trade.pnl);
        }
      });
    });

    const adjustedPnl = totalPnl * baseMult;
    const wr = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    return {
      pnl: adjustedPnl,
      winRate: wr,
      trades: Math.floor(totalTrades * baseMult) || (totalTrades > 0 ? 1 : 0),
      avgGain: (wins > 0 ? (winSum / wins) : 0) * (0.8 + Math.random() * 0.4),
      profitFactor: lossSum > 0 ? winSum / lossSum : 2.5
    };
  }, [journalsArray, timeframe]);

  const sortedJournals = useMemo(() => 
    [...journalsArray].sort((a, b) => a.date.localeCompare(b.date)),
    [journalsArray]
  );

  const chartData = useMemo(() => {
    let cumulative = 47000;
    return sortedJournals.map(j => {
      const dayPnl = j.trades.reduce((s, t) => s + t.pnl, 0);
      cumulative += dayPnl;
      return {
        date: j.date.split('-').slice(1).join('/'),
        balance: cumulative,
        pnl: dayPnl
      };
    });
  }, [sortedJournals]);

  const allTrades = useMemo(() => 
    sortedJournals.flatMap(j => j.trades).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [sortedJournals]
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* AI Intelligence Header */}
      <div className="p-8 bg-[#14171d] rounded-[2rem] border border-[#2d333b] shadow-2xl flex items-center space-x-6 relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
          <i className="fa-solid fa-brain text-[12rem] text-indigo-500"></i>
        </div>
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-xl shadow-indigo-900/40 relative z-10">
          <i className="fa-solid fa-bolt text-2xl"></i>
        </div>
        <div className="relative z-10 flex-1">
          <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Coach T® Intelligence</h3>
          <p className="text-xl text-gray-100 font-semibold italic leading-snug">
            "{aiAdvice}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* TOP METRICS (formerly Gauges column) */}
        <div className="xl:col-span-12">
          <div className="bg-[#14171d] rounded-[2.5rem] border border-[#2d333b] p-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <CircularGauge 
                label={t.profit} 
                value={tfStats.pnl >= 1000 ? `$${(tfStats.pnl/1000).toFixed(1)}k` : `$${tfStats.pnl.toFixed(0)}`}
                subLabel={timeframe === 'at' ? "All Time" : timeframe}
                percentage={Math.min(100, (tfStats.pnl / 10000) * 100)}
                color="text-emerald-500" 
              />
              <CircularGauge 
                label={t.winRate} 
                value={`${tfStats.winRate.toFixed(1)}%`}
                subLabel={timeframe === 'at' ? "All Time" : timeframe}
                percentage={tfStats.winRate}
                color="text-indigo-500" 
              />
              <CircularGauge 
                label={t.avgGainDollar} 
                value={`$${(tfStats.avgGain/1000).toFixed(1)}k`}
                subLabel={timeframe === 'at' ? "All Time" : timeframe}
                percentage={65}
                color="text-amber-500" 
              />
              <CircularGauge 
                label={t.profitFactor} 
                value={tfStats.profitFactor.toFixed(2)}
                subLabel={timeframe === 'at' ? "All Time" : timeframe}
                percentage={Math.min(100, (tfStats.profitFactor / 5) * 100)}
                color="text-rose-500" 
              />
            </div>
          </div>
        </div>

        {/* MAIN COLUMN: Charts & Data */}
        <div className="xl:col-span-12 space-y-8">
          {/* Main Visualizer Container */}
          <div className="bg-[#14171d] rounded-[2.5rem] border border-[#2d333b] p-10 shadow-2xl h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {activeTab === 'performance' ? t.equityCurve : 
                   activeTab === 'profit' ? t.profit :
                   activeTab === 'drawdown' ? t.drawdown :
                   activeTab === 'positions' ? t.positions :
                   t.dailyPerformance}
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Market Feed Synchronized • {timeframe}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                 <button className="px-4 py-2 bg-[#0b0f1a] rounded-xl border border-[#232830] text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors">Export CSV</button>
                 <button className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-colors">
                   <i className="fa-solid fa-expand"></i>
                 </button>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                {activeTab === 'performance' || activeTab === 'profit' ? (
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1d23" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{fontWeight: 700}}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                      tick={{fontWeight: 700}}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #2d333b', borderRadius: '16px', padding: '12px' }}
                      itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                      cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1d23" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{fontWeight: 700}}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `$${val}`}
                      tick={{fontWeight: 700}}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #2d333b', borderRadius: '16px' }}
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    />
                    <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Summary */}
          <div className="bg-[#14171d] rounded-[2.5rem] border border-[#2d333b] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-[#2d333b] flex justify-between items-center bg-[#0b0f1a]/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{t.transactions}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0b0f1a]">
                  <tr>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.asset}</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.side}</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.size}</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Entry</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d333b]">
                  {allTrades.slice(0, 10).map((trade, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-gray-100">{trade.asset}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${trade.direction === Direction.BUY ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                          {trade.direction === Direction.BUY ? t.buy : t.sell}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm font-mono text-gray-400">{trade.lots}</td>
                      <td className="px-10 py-6 text-sm font-mono text-gray-400">${trade.entryPrice?.toFixed(2) || '---'}</td>
                      <td className={`px-10 py-6 text-right font-black font-mono ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
