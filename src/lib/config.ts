// ============================================
// FANTASY PLAYOFFS CONFIGURATION
// Edit this file to configure the entire app
// ============================================

// NFL teams in the 2024-2025 playoffs
export const PLAYOFF_TEAM_ABBRS = [
   'BUF', 'BAL', 'KC', 'HOU', 'LAC', 'PIT', 'DEN', // AFC
   'DET', 'PHI', 'TB', 'LAR', 'MIN', 'WAS', 'GB'   // NFC
];

// Scoring configuration - weeks to include for scoring
// For testing: use regular season weeks
// For playoffs: set season_type to 'post' and weeks to [1, 2, 3, 4]
export const SCORING_CONFIG = {
   season: '2025',
   season_type: 'regular' as const, // 'regular' or 'post'
   weeks: [15, 16, 17], // Regular season weeks for testing, or [1, 2, 3, 4] for playoffs
};

// Entry rules
export const ENTRY_CONFIG = {
   maxTeamsPerPerson: 5,
   entryFee: 10, // dollars per team
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

