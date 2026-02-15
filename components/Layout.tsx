
import React from 'react';
import { ViewState } from '../types';
import { Language, translations } from '../translations';

export type DashboardTab = 'performance' | 'profit' | 'drawdown' | 'positions' | 'trades';
export type Timeframe = '15m' | '1h' | '1M' | '1y' | 'at';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  portfolioTab: DashboardTab;
  setPortfolioTab: (tab: DashboardTab) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onNavigate, 
  language, 
  onLanguageChange,
  portfolioTab,
  setPortfolioTab,
  timeframe,
  setTimeframe
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <div className={`flex h-screen overflow-hidden bg-[#0f1115] ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`w-20 md:w-72 border-[#1a1d23] flex flex-col items-center py-8 ${isRTL ? 'border-l' : 'border-r'} overflow-y-auto`}>
        <div className="mb-8 flex items-center space-x-2 px-6 w-full">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <i className="fa-solid fa-chart-line text-white text-xl"></i>
          </div>
          <span className={`hidden md:block font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent ${isRTL ? 'mr-2' : 'ml-2'}`}>
            TradeMind
          </span>
        </div>

        <nav className="flex-1 w-full px-4 space-y-1">
          <NavItem 
            icon="fa-solid fa-house" 
            label={t.dashboard} 
            isActive={activeView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
            isRTL={isRTL}
          />
          <NavItem 
            icon="fa-solid fa-calendar-days" 
            label={t.calendar} 
            isActive={activeView === 'calendar'} 
            onClick={() => onNavigate('calendar')} 
            isRTL={isRTL}
          />
          <NavItem 
            icon="fa-solid fa-book" 
            label={t.journal} 
            isActive={activeView === 'journal' || activeView === 'journal-day'} 
            onClick={() => onNavigate('journal')} 
            isRTL={isRTL}
          />
          <NavItem 
            icon="fa-solid fa-radar" 
            label={t.marketScanners} 
            isActive={activeView === 'scanners'} 
            onClick={() => onNavigate('scanners')} 
            isRTL={isRTL}
          />

          {/* Portfolio Section in Sidebar */}
          <div className="pt-6 pb-2 px-2">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 hidden md:block">
              {t.portfolio}
            </p>
            
            {/* Timeframe Selector */}
            <div className="hidden md:flex items-center space-x-1 bg-[#0b0f1a] p-1 rounded-xl border border-[#232830] mb-4">
              {(['15m', '1h', '1M', '1y', 'at'] as Timeframe[]).map((tf) => (
                <button 
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    onNavigate('dashboard');
                  }}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase transition-all rounded-lg ${
                    timeframe === tf 
                      ? 'text-white bg-indigo-600/30 text-indigo-400' 
                      : 'text-gray-500 hover:text-gray-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <PortfolioSubNavItem 
                icon="fa-chart-pie" 
                label={t.performance} 
                isActive={activeView === 'dashboard' && portfolioTab === 'performance'} 
                onClick={() => { setPortfolioTab('performance'); onNavigate('dashboard'); }} 
                isRTL={isRTL}
              />
              <PortfolioSubNavItem 
                icon="fa-arrow-trend-up" 
                label={t.profit} 
                isActive={activeView === 'dashboard' && portfolioTab === 'profit'} 
                onClick={() => { setPortfolioTab('profit'); onNavigate('dashboard'); }} 
                isRTL={isRTL}
              />
              <PortfolioSubNavItem 
                icon="fa-arrow-trend-down" 
                label={t.drawdown} 
                isActive={activeView === 'dashboard' && portfolioTab === 'drawdown'} 
                onClick={() => { setPortfolioTab('drawdown'); onNavigate('dashboard'); }} 
                isRTL={isRTL}
              />
              <PortfolioSubNavItem 
                icon="fa-list-check" 
                label={t.positions} 
                isActive={activeView === 'dashboard' && portfolioTab === 'positions'} 
                onClick={() => { setPortfolioTab('positions'); onNavigate('dashboard'); }} 
                isRTL={isRTL}
              />
              <PortfolioSubNavItem 
                icon="fa-book-open" 
                label={t.trades} 
                isActive={activeView === 'dashboard' && portfolioTab === 'trades'} 
                onClick={() => { setPortfolioTab('trades'); onNavigate('dashboard'); }} 
                isRTL={isRTL}
              />
            </div>
          </div>

          <div className="pt-6">
            <NavItem 
              icon="fa-solid fa-gear" 
              label={t.settings} 
              isActive={false} 
              onClick={() => {}} 
              isRTL={isRTL}
            />
          </div>
        </nav>

        <div className="mt-auto px-4 w-full pt-4">
          <div className="p-4 bg-[#1a1d23] rounded-xl border border-[#2d333b] hidden md:block">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{t.accountBalance}</p>
            <p className="text-lg font-bold text-green-400">$47,766.80</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#0f1115]/80 backdrop-blur-md border-b border-[#1a1d23]">
          <h1 className="text-lg font-semibold text-gray-200 capitalize">
             {activeView === 'scanners' ? t.marketScanners : (isRTL ? t[activeView.replace('-', '') as keyof typeof t] : t[activeView as keyof typeof t] || activeView.replace('-', ' '))}
          </h1>
          <div className="flex items-center space-x-4">
             <div className="flex items-center bg-[#1a1d23] rounded-lg p-1 border border-[#2d333b]">
               {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
                 <button
                   key={lang}
                   onClick={() => onLanguageChange(lang)}
                   className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition-colors ${
                     language === lang ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'
                   }`}
                 >
                   {lang}
                 </button>
               ))}
             </div>
             <button className="p-2 text-gray-400 hover:text-white transition-colors">
               <i className="fa-solid fa-bell"></i>
             </button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-[#2d333b]"></div>
          </div>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; isRTL: boolean }> = ({ 
  icon, label, isActive, onClick, isRTL
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
        : 'text-gray-400 hover:bg-[#1a1d23] hover:text-gray-200'
    } ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}
  >
    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-800/50'}`}>
      <i className={`${icon} text-sm`}></i>
    </div>
    <span className="hidden md:block font-bold text-[11px] uppercase tracking-wider">{label}</span>
  </button>
);

const PortfolioSubNavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; isRTL: boolean }> = ({ 
  icon, label, isActive, onClick, isRTL
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'text-white' 
        : 'text-gray-500 hover:text-gray-200'
    } ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}
  >
    <div className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-gray-800'}`}></div>
    <span className={`hidden md:block text-[10px] font-black uppercase tracking-[0.15em] ${isActive ? 'text-white' : 'text-gray-500'}`}>{label}</span>
  </button>
);

export default Layout;
