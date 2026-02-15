
import { Emotion, Direction, Trade, DailyJournal } from './types';

export const SAMPLE_TRADES: Trade[] = [
  {
    id: '1',
    asset: 'EURUSD',
    // Fix: Using Direction.BUY instead of non-existent Direction.LONG
    direction: Direction.BUY,
    entryPrice: 1.0850,
    exitPrice: 1.0900,
    lots: 1.5,
    pnl: 750,
    strategy: 'Breakout',
    timestamp: '2025-01-15T10:30:00Z',
    durationMinutes: 45
  },
  {
    id: '2',
    asset: 'BTCUSD',
    // Fix: Using Direction.SELL instead of non-existent Direction.SHORT
    direction: Direction.SELL,
    entryPrice: 95000,
    exitPrice: 94000,
    lots: 0.5,
    pnl: 500,
    strategy: 'Trend Following',
    timestamp: '2025-01-15T14:20:00Z',
    durationMinutes: 120
  },
  {
    id: '3',
    asset: 'GOLD',
    // Fix: Using Direction.BUY instead of non-existent Direction.LONG
    direction: Direction.BUY,
    entryPrice: 2650,
    exitPrice: 2640,
    lots: 1.0,
    pnl: -1000,
    strategy: 'Scalp',
    timestamp: '2025-01-16T09:00:00Z',
    durationMinutes: 5
  }
];

export const INITIAL_JOURNAL: Record<string, DailyJournal> = {
  '2025-01-15': {
    date: '2025-01-15',
    trades: [SAMPLE_TRADES[0], SAMPLE_TRADES[1]],
    emotion: Emotion.CALM,
    notes: 'Great day overall. Followed the plan perfectly.',
    disciplineScore: 9,
    checklist: { followedPlan: true, controlledRisk: true, noRevengeTrade: true, properSetup: true }
  },
  '2025-01-16': {
    date: '2025-01-16',
    trades: [SAMPLE_TRADES[2]],
    emotion: Emotion.FRUSTRATED,
    notes: 'Took a bad scalp early on. Need to stick to higher timeframes.',
    disciplineScore: 4,
    checklist: { followedPlan: false, controlledRisk: true, noRevengeTrade: false, properSetup: false }
  }
};
