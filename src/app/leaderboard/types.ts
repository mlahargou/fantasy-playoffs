export interface ScoreBreakdown {
  qb: number;
  wr: number;
  rb: number;
  te: number;
}

export interface Entry {
  id: number;
  email: string;
  user_name: string | null;
  team_number: number;
  qb_name: string;
  qb_team: string;
  wr_name: string;
  wr_team: string;
  rb_name: string;
  rb_team: string;
  te_name: string;
  te_team: string;
  created_at: string;
  total_score: number;
  score_breakdown: ScoreBreakdown;
}

export interface ScoringConfig {
  season: string;
  seasonType: string;
  weeks: number[];
}

