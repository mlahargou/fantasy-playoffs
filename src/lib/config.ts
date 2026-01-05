// ============================================
// FANTASY PLAYOFFS CONFIGURATION
// Edit this file to configure the entire app
// ============================================

// NFL teams in the 2025-2026 playoffs
export const PLAYOFF_TEAM_ABBRS = [
   'DEN', 'NE', 'JAX', 'PIT', 'HOU', 'BUF', 'LAC', // AFC
   'SEA', 'CHI', 'PHI', 'CAR', 'LAR', 'SF', 'GB'   // NFC
];

// Scoring configuration - weeks to include for scoring
// For testing: use regular season weeks
// For playoffs: set season_type to 'post' and weeks to [1, 2, 3, 4]
export const SCORING_CONFIG = {
   season: '2025',
   season_type: 'post' as const, // 'regular' or 'post'
   weeks: [1, 2, 3, 4], // Regular season weeks for testing, or [1, 2, 3, 4] for playoffs
};

// Entry rules
export const ENTRY_CONFIG = {
   maxTeamsPerPerson: 5,
   entryFee: 10, // dollars per team
   // Submission window opened: When the entry form goes live and /leaderboard becomes restricted
   // Sunday Jan 4th, 2026 at 11:59 PM PST = 07:59 AM UTC Jan 5th
   submissionWindowOpened: new Date('2026-01-05T07:59:00Z'),
   // Submission window closed: When entries lock, entry form closes, and leaderboard becomes public again
   // Friday Jan 9th, 2026 at 11:59 PM PST = 07:59 AM UTC Jan 10th
   submissionWindowClosed: new Date('2026-01-10T07:59:00Z'),
};

// Payout structure (percentages that should add up to 1.0)
export const PAYOUT_CONFIG = {
   firstPlace: 0.9,  // 90%
   secondPlace: 0.1, // 10%
};

// Display configuration
export const DISPLAY_CONFIG = {
   seasonLabel: '2025-2026 NFL Playoffs',
   title: 'Fantasy Playoffs',
   subtitle: 'Bracket Challenge',
};

// Positions required for each team
export const POSITIONS = ['QB', 'WR', 'RB', 'TE'] as const;
export type Position = typeof POSITIONS[number];

