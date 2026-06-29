export type Role = 'owner' | 'moderator' | 'user' | 'guest';

export type StatsRow = {
  rank: number;
  nick: string;
  points: number;
  questionsWon: number;
  bestStreak: number;
  bestWpm: number;
};

export type SystemKey =
  | 'user_joined'
  | 'user_left'
  | 'question_skipped'
  | 'trivia_paused'
  | 'trivia_resumed'
  | 'season_reset'
  | 'no_permission'
  | 'help';

export type ServerMessage =
  | { type: 'welcome'; nick: string; role: Role }
  | { type: 'userlist'; users: Array<{ nick: string; role: Role }> }
  | { type: 'paused_state'; paused: boolean }
  | { type: 'question'; questionNumber: number; text: string }
  | { type: 'hint'; questionNumber: number; level: 1 | 2; hint: string }
  | { type: 'timeout'; questionNumber: number; answer: string }
  | { type: 'correct'; questionNumber: number; nick: string; answer: string; points: 1 | 2 | 3; totalPoints: number; elapsedMs: number; wpm: number; streak: number; rank: number }
  | { type: 'chat'; nick: string; role: Role; text: string; ts: number }
  | { type: 'system'; key: SystemKey; params: Record<string, string> }
  | { type: 'userjoin'; nick: string; role: Role }
  | { type: 'userleave'; nick: string }
  | { type: 'stats'; subtype: 'season' | 'hof'; seasonName?: string; rows: StatsRow[] }
  | { type: 'error'; code: string; message: string }
  | {
      type: 'personal_stats';
      nick: string;
      seasonName: string;
      season: {
        points: number; questionsWon: number;
        currentStreak: number; bestStreak: number;
        bestWpm: number; bestWpmQuestion: string | null;
        quickestAnswerMs: number; quickestQuestion: string | null;
      } | null;
      allTime: {
        points: number; questionsWon: number;
        bestStreak: number;
        bestWpm: number; bestWpmQuestion: string | null; bestWpmAnswer: string | null;
        quickestAnswerMs: number; quickestQuestion: string | null; quickestAnswer: string | null;
      };
    };

export type ClientMessage =
  | { type: 'chat'; text: string }
  | { type: 'command'; name: string };
