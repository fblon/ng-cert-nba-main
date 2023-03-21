import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NbaService} from '../nba.service';
import {Game, Team} from '../data.models';
import {combineLatestWith, filter, map, Observable, Subject, switchMap} from 'rxjs';

@Component({
  selector: 'app-game-results',
  templateUrl: './game-results.component.html',
  styleUrls: ['./game-results.component.css']
})
export class GameResultsComponent {

  team$: Observable<Team>;
  games$: Observable<Game[]>;

  constructor(private activatedRoute: ActivatedRoute, protected nbaService: NbaService) {
    this.team$ = this.activatedRoute.paramMap.pipe(
      combineLatestWith(this.nbaService.getTrackedTeams()),
      map(([paramMap, teams]) => teams.find(team => team.abbreviation === paramMap.get("teamAbbr"))),
      filter(team => team != null),
      map(team => team as Team));

    this.games$ = this.team$.pipe(switchMap(team => this.nbaService.getLastResults(team)));

  }

}
