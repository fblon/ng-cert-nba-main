import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {NbaService} from '../nba.service';
import {Game, Stats, Team} from '../data.models';
import { ModalDialogComponent } from '../shared/modal-dialog/modal-dialog.component';

type deleteChoice = 'Yes' | 'No';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css']
})
export class TeamStatsComponent implements OnInit {

  @Input() team!: Team;
  @ViewChild(ModalDialogComponent) dialog!: ModalDialogComponent;

  games$!: Observable<Game[]>;
  stats!: Stats;

  deleteChoices: deleteChoice[] = [ 'No', 'Yes' ];

  constructor(protected nbaService: NbaService) { }

  ngOnInit(): void {
    this.games$ = this.nbaService.getLastResults(this.team, 12).pipe(
      tap(games =>  this.stats = this.nbaService.getStatsFromGames(games, this.team))
    )
  }

  remove() {
    this.dialog.show();
  }

  confirmRemove(choice: string) {
    if (choice as deleteChoice === 'Yes') {
      this.nbaService.removeTrackedTeam(this.team);
    }
  }

}
