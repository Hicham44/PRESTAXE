
import React, { useState, useEffect } from 'react';
import { ViewState, DailyJournal, Emotion } from './types';
import { INITIAL_JOURNAL } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import JournalDetail from './components/JournalDetail';
import JournalListView from './components/JournalListView';
import ScannersView from './components/ScannersView';
import AgentsView from './components/AgentsView';
import { getAITradingCoachAdvice } from './services/geminiService';
import { Language } from './translations';
import { DashboardTab, Timeframe } from './components/Layout';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [journals, setJournals] = useState<Record<string, DailyJournal>>(INITIAL_JOURNAL);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("Analyze your psychology to find your edge.");
  const [language, setLanguage] = useState<Language>('en');

  // Portfolio Specific state moved to App level to be shared with Sidebar (Layout)
  const [portfolioTab, setPortfolioTab] = useState<DashboardTab>('performance');
  const [timeframe, setTimeframe] = useState<Timeframe>('at');

  // Persist to local storage
  useEffect(() => {
    const saved = localStorage.getItem('trademind_journals');
    const savedLang = localStorage.getItem('trademind_language');
    if (saved) {
      try {
        setJournals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load journals", e);
      }
    }
    if (savedLang) {
      setLanguage(savedLang as Language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trademind_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('trademind_language', language);
  }, [language]);

  // Fetch AI advice once
  useEffect(() => {
    const fetchAdvice = async () => {
      const advice = await getAITradingCoachAdvice(Object.values(journals));
      setAiAdvice(advice);
    };
    fetchAdvice();
  }, [journals]);

  const handleNavigate = (view: ViewState) => {
    setActiveView(view);
    if (view !== 'journal-day') {
      setSelectedDate(null);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    if (!journals[date]) {
      setJournals(prev => ({
        ...prev,
        [date]: {
          date,
          trades: [],
          emotion: Emotion.CALM,
          notes: '',
          disciplineScore: 10,
          checklist: {
            followedPlan: true,
            controlledRisk: true,
            noRevengeTrade: true,
            properSetup: true
          }
        }
      }));
    }
    setActiveView('journal-day');
  };

  const updateJournal = (updatedJournal: DailyJournal) => {
    setJournals(prev => ({
      ...prev,
      [updatedJournal.date]: updatedJournal
    }));
  };

  return (
    <Layout 
      activeView={activeView} 
      onNavigate={handleNavigate} 
      language={language} 
      onLanguageChange={setLanguage}
      portfolioTab={portfolioTab}
      setPortfolioTab={setPortfolioTab}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
    >
      {activeView === 'dashboard' && (
        <Dashboard 
          journals={journals} 
          aiAdvice={aiAdvice} 
          language={language} 
          activeTab={portfolioTab}
          timeframe={timeframe}
        />
      )}
      
      {activeView === 'calendar' && (
        <CalendarView journals={journals} onDayClick={handleDayClick} />
      )}

      {activeView === 'journal' && (
        <JournalListView journals={journals} onDayClick={handleDayClick} language={language} />
      )}

      {activeView === 'agents' && (
        <AgentsView language={language} />
      )}

      {activeView === 'scanners' && (
        <ScannersView language={language} />
      )}

      {activeView === 'journal-day' && selectedDate && journals[selectedDate] && (
        <JournalDetail 
          journal={journals[selectedDate]} 
          onUpdate={updateJournal}
          onBack={() => handleNavigate('journal')}
          language={language}
        />
      )}
    </Layout>
  );
};

export default App;
