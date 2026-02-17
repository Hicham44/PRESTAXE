
export enum Emotion {
  CALM = 'Calm',
  GREEDY = 'Greedy',
  FEARFUL = 'Fearful',
  EXCITED = 'Excited',
  FRUSTRATED = 'Frustrated',
  DISCIPLINED = 'Disciplined'
}

export enum Direction {
  BUY = 'Buy',
  SELL = 'Sell'
}

export interface Trade {
  id: string;
  asset: string;
  direction: Direction;
  entryPrice?: number;
  exitPrice?: number;
  lots: number;
  pnl: number;
  strategy: string;
  timestamp: string; // ISO string
  durationMinutes?: number;
  screenshot?: string; // Base64 or URL
  notes?: string;
}

export interface DailyJournal {
  date: string; // YYYY-MM-DD
  trades: Trade[];
  emotion: Emotion;
  notes: string;
  disciplineScore: number; // 1-10
  checklist: {
    followedPlan: boolean;
    controlledRisk: boolean;
    noRevengeTrade: boolean;
    properSetup: boolean;
  };
}

export interface Statistics {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestDay: string;
  mostActiveDay: string;
}

export type ViewState = 'dashboard' | 'calendar' | 'journal-day' | 'scanners' | 'journal' | 'agents';
