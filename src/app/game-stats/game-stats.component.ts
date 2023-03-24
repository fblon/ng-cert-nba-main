import { Component } from '@angular/core';
import {Conference, Division, Team} from '../data.models';
import {BehaviorSubject, combineLatestWith, map, Observable, tap} from 'rxjs';
import {NbaService} from '../nba.service';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css']
})
export class GameStatsComponent {
  
  allConferences: Conference[]; 
  divisions$: Observable<Division[]>;
  teams$: Observable<Team[]>;
  numbersOfDays = [6, 12 ,20];

  private allDivisions: Division[];
  private allTeams: Team[] = [];
  private selectedConference$ = new BehaviorSubject<string | undefined>(undefined);
  private selectedDivision$ = new BehaviorSubject<Division | undefined>(undefined);

  constructor(protected nbaService: NbaService) {
    this.allConferences = this.nbaService.getAllConferences();
    this.allDivisions = this.nbaService.getAllDivisions();

    this.divisions$ = this.selectedConference$.pipe(
      map(conf => this.allDivisions.filter(d => !conf || d.conference === conf)));

    this.teams$ = this.nbaService.getAllTeams().pipe(
      tap(data => this.allTeams = data),
      combineLatestWith(this.selectedDivision$, this.selectedConference$),
      map(([teams, division, conference]) => {
        const filteredTeamsByDivision = teams.filter(t => !division || t.division === division.division);
        return filteredTeamsByDivision.filter(t => !conference || t.conference === conference);
      })
    );
  }

  trackTeam(teamId: string): void {
    let team = this.allTeams.find(team => team.id == Number(teamId));
    if (team)
      this.nbaService.addTrackedTeam(team);
  }

  changeConference(conference: string | undefined) {
    this.selectedConference$.next(conference);

    if (this.selectedDivision$.value?.conference !== conference) {
      this.selectedDivision$.next(undefined);
    }
  }

  changeDivision(division: string | undefined) {
    this.selectedDivision$.next(this.allDivisions.find(d => d.division === division));
  }

  changeDays(value: string) {
    this.nbaService.numberOfDays = +value;
  }

  teamTrackBy(_index: number, team: Team) : string {
    return `${team.id}#${team.numberOfDays}`;
  }
}
