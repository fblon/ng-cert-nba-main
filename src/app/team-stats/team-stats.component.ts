import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {NbaService} from '../nba.service';
import {Game, Stats, Team} from '../data.models';
import { ConfirmDeletionDialogComponent } from './confirm-deletion-dialog.component';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css']
})
export class TeamStatsComponent implements OnInit {

  @Input() team!: Team;
  @ViewChild(ConfirmDeletionDialogComponent) dialog!: ConfirmDeletionDialogComponent;

  games$!: Observable<Game[]>;
  stats!: Stats;

  constructor(protected nbaService: NbaService) { }

  ngOnInit(): void {
    this.games$ = this.nbaService.getLastResults(this.team).pipe(
      tap(games =>  this.stats = this.nbaService.getStatsFromGames(games, this.team))
    )
  }

  remove() {
    this.dialog.show();
  }

  confirmRemove(choice: boolean) {
    if (choice) {
      this.nbaService.removeTrackedTeam(this.team);
    }
  }
}
