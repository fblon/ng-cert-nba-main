export interface Game {
  id: number;
  date: Date;
  home_team: Team;
  home_team_score: number;
  period: number;
  postseason: boolean;
  season: number;
  status: string;
  time: string;
  visitor_team: Team;
  visitor_team_score: number;
}

export type Conference = 'East' | 'West';
export interface Division {
  readonly conference: Conference;
  readonly division: string;
}

export interface Team {
  id: number;
  abbreviation: string;
  city: string;
  conference: Conference;
  division: string;
  full_name: string;
  name: string;
}

export interface Stats {
  wins: number;
  losses: number;
  averagePointsScored: number;
  averagePointsConceded: number;
  lastGames: Result[];
}

export type Result = 'W' | 'L';
