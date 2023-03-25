import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, map, Observable} from 'rxjs';
import { format, subDays } from 'date-fns';
import {Conference, Division, Game, ServerTeam, Stats, Team} from './data.models';

@Injectable({
  providedIn: 'root'
})
export class NbaService {

  private _numberOfDays = 12;
  public get numberOfDays() : number {
    return this._numberOfDays;
  }
  public set numberOfDays(value: number) {
    this._numberOfDays = value;

    this.nextTrackedTeams(this.trackedTeams$.value);
  }

  private headers = {'X-RapidAPI-Key': '2QMXSehDLSmshDmRQcKUIAiQjIZAp1UvKUrjsnewgqSP6F5oBX',
    'X-RapidAPI-Host': 'free-nba.p.rapidapi.com'};
  private API_URL = "https://free-nba.p.rapidapi.com";
  private trackedTeams$ = new BehaviorSubject<Team[]>([]);

  constructor(private http: HttpClient) { }

  addTrackedTeam(team: ServerTeam): void {
    const trackedTeams = [...this.trackedTeams$.value, {...team, numberOfDays: this._numberOfDays}];
    this.nextTrackedTeams(trackedTeams);
  }

  removeTrackedTeam(team: Team): void {
    const trackedTeams = [...this.trackedTeams$.value];
    let index = trackedTeams.findIndex(t => t.id == team.id);
    trackedTeams.splice(index, 1);
    this.nextTrackedTeams(trackedTeams);
  }

  getTrackedTeams(): Observable<Team[]> {
    return this.trackedTeams$;
  }

  getAllTeams(): Observable<Team[]> {
    return this.http.get<{data: ServerTeam[]}>(`${this.API_URL}/teams?page=0`,
      {headers: this.headers}).pipe(
      map(res => res.data.map(t => ({...t, numberOfDays: this._numberOfDays})))
    );
  }

  getLastResults(team: Team): Observable<Game[]> {
    return this.http.get<{meta: any, data: Game[]}>(`${this.API_URL}/games?page=0${this.getDaysQueryString(this._numberOfDays)}`,
      {headers: this.headers, params: {per_page: this._numberOfDays, "team_ids[]": ""+team.id}}).pipe(
        map(res => res.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    );
  }

  getStatsFromGames(games: Game[], team: Team): Stats {
        const stats: Stats = {wins: 0, losses: 0, averagePointsScored: 0, averagePointsConceded: 0, lastGames: []};
        games.forEach(game => {
            const gameStats = this.getSingleGameStats(team, game);
            stats.wins += gameStats.wins;
            stats.losses += gameStats.losses;
            stats.averagePointsConceded += gameStats.averagePointsConceded;
            stats.averagePointsScored += gameStats.averagePointsScored;
          stats.lastGames.push(gameStats.wins == 1 ? 'W' : 'L');
        });
        stats.averagePointsScored = Math.round(stats.averagePointsScored / games.length);
        stats.averagePointsConceded = Math.round(stats.averagePointsConceded / games.length);
        return stats;
  }

  getAllConferences(): Conference[] {
    return ['East', 'West'];
  }

  getAllDivisions(): Division[] {
    return [
      { conference: 'East', division: 'Atlantic' },
      { conference: 'East', division: 'Central' },
      { conference: 'East', division: 'Southeast' },
      { conference: 'West', division: 'Northwest' },
      { conference: 'West', division: 'Pacific' },
      { conference: 'West', division: 'Southwest' },
    ];
  }

  private nextTrackedTeams(trackedTeams: Team[]) {
    this.trackedTeams$.next(trackedTeams.map(t => ({...t, numberOfDays: this.numberOfDays})));
  }

  private getDaysQueryString(nbOfDays: number): string {
    let qs = "";
    for (let i = 1;i < nbOfDays; i++) {
      let date = format(subDays(new Date(), i), "yyyy-MM-dd")
      qs = qs.concat("&dates[]=" + date);
    }
    return qs;
  }

  private getSingleGameStats(team: Team, game: Game): Stats {
    const stats: Stats = {wins: 0, losses: 0, averagePointsScored: 0, averagePointsConceded: 0, lastGames: []};
    if (game.home_team.id === team.id) {
      stats.averagePointsScored = game.home_team_score;
      stats.averagePointsConceded = game.visitor_team_score;
      if (game.home_team_score > game.visitor_team_score) {
        stats.wins +=1;
      } else {
        stats.losses += 1;
      }
    }
    if (game.visitor_team.id === team.id) {
      stats.averagePointsScored = game.visitor_team_score;
      stats.averagePointsConceded = game.home_team_score;
      if (game.visitor_team_score > game.home_team_score) {
        stats.wins = 1;
      } else {
        stats.losses = 1;
      }
    }
    return stats;
  }
}
