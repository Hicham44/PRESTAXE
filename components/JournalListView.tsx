
import React from 'react';
import { DailyJournal, Emotion } from '../types';
import { Language, translations } from '../translations';

interface JournalListViewProps {
  journals: Record<string, DailyJournal>;
  onDayClick: (date: string) => void;
  language: Language;
}

const JournalListView: React.FC<JournalListViewProps> = ({ journals, onDayClick, language }) => {
  const t = translations[language];
  // Add explicit types to sort parameters to fix 'unknown' type errors during compilation
  const sortedJournals = Object.values(journals).sort((a: DailyJournal, b: DailyJournal) => b.date.localeCompare(a.date));

  const getEmotionIcon = (emotion: Emotion) => {
    switch (emotion) {
      case Emotion.CALM: return 'fa-face-smile';
      case Emotion.GREEDY: return 'fa-face-grin-dollar';
      case Emotion.FEARFUL: return 'fa-face-grimace';
      case Emotion.EXCITED: return 'fa-bolt';
      case Emotion.FRUSTRATED: return 'fa-face-angry';
      case Emotion.DISCIPLINED: return 'fa-shield-halved';
      default: return 'fa-face-meh';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">{t.journal}</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Chronological Trading History & Psychological Log</p>
        </div>
        <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-900/20">
          <i className="fa-solid fa-file-export mr-2"></i> Export Journal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedJournals.length === 0 && (
          <div className="py-20 text-center bg-[#14171d] rounded-2xl border border-[#2d333b]">
             <i className="fa-solid fa-book-open text-5xl text-gray-700 mb-4"></i>
             <p className="text-gray-500 font-bold">No entries found. Start trading to fill your log.</p>
          </div>
        )}
        
        {sortedJournals.map((journal: DailyJournal) => {
          // Explicitly type the journal parameter to resolve property access errors
          const totalPnl = journal.trades.reduce((sum, t) => sum + t.pnl, 0);
          return (
            <div 
              key={journal.date}
              onClick={() => onDayClick(journal.date)}
              className="group bg-[#14171d] hover:bg-[#1a1d23] border border-[#2d333b] hover:border-indigo-500/30 rounded-2xl p-6 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center space-x-6">
                <div className="text-center min-w-[80px]">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                    {new Date(journal.date).toLocaleDateString(language, { month: 'short' })}
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter">
                    {new Date(journal.date).getDate()}
                  </p>
                </div>
                
                <div className="h-12 w-[1px] bg-[#2d333b] hidden md:block"></div>
                
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${totalPnl >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {totalPnl >= 0 ? t.win : t.loss}
                    </span>
                    <i className={`fa-solid ${getEmotionIcon(journal.emotion)} text-gray-500 text-xs`}></i>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{journal.emotion}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium line-clamp-1 max-w-md">
                    {journal.notes || "No notes recorded for this day."}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-8 md:text-right">
                <div className="hidden lg:block">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{t.totalTrades}</p>
                  <p className="text-sm font-bold text-gray-300">{journal.trades.length}</p>
                </div>
                <div className="min-w-[120px]">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Daily Net</p>
                  <p className={`text-xl font-black font-mono ${totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0b0f1a] text-gray-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JournalListView;
