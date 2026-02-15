
import React from 'react';
import { DailyJournal } from '../types';

interface CalendarProps {
  journals: Record<string, DailyJournal>;
  onDayClick: (date: string) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ journals, onDayClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  // Add empty slots for the first week
  for (let i = 0; i < offset; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border border-[#1a1d23] bg-[#0f1115]/50"></div>);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const journal = journals[dateStr];
    const pnl = journal?.trades.reduce((sum, t) => sum + t.pnl, 0) || 0;
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    days.push(
      <div 
        key={d} 
        onClick={() => onDayClick(dateStr)}
        className={`h-32 p-3 border border-[#1a1d23] cursor-pointer hover:bg-[#1a1d23] transition-colors relative group
          ${pnl > 0 ? 'bg-green-500/5' : pnl < 0 ? 'bg-red-500/5' : 'bg-[#0f1115]'}
          ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}
        `}
      >
        <span className={`text-sm font-bold ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full -mt-1 -ml-1' : 'text-gray-500'}`}>
          {d}
        </span>
        
        {journal && (
          <div className="mt-2 space-y-1">
            <p className={`text-lg font-black tracking-tight ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {journal.trades.length} trades
            </p>
          </div>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="fa-solid fa-chevron-right text-xs text-gray-600"></i>
        </div>
      </div>
    );
  }

  const weekHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fr', 'Sa'].map(day => (
    <div key={day} className="py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-widest border-b border-[#1a1d23]">
      {day}
    </div>
  ));

  return (
    <div className="bg-[#1a1d23] rounded-2xl border border-[#2d333b] overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-6 bg-[#0f1115]">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">{monthName} {year}</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Monthly Performance Overview</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1d23] hover:bg-gray-800 text-gray-300 transition-colors">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1d23] hover:bg-gray-800 text-gray-300 transition-colors">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-[#0f1115]">
        {weekHeader}
        {days}
      </div>
    </div>
  );
};

export default CalendarView;
