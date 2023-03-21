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
  readonly id: number;
  readonly abbreviation: string;
  readonly city: string;
  readonly conference: Conference;
  readonly division: string;
  readonly full_name: string;
  readonly name: string;
  readonly numberOfDays: number;
}

export type ServerTeam = Omit<Team, 'numberOfDays'>;

export interface Stats {
  wins: number;
  losses: number;
  averagePointsScored: number;
  averagePointsConceded: number;
  lastGames: Result[];
}

export type Result = 'W' | 'L';
