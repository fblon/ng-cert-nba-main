import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDialogComponent } from '../shared/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-confirm-deletion-dialog',
  templateUrl: './confirm-deletion-dialog.component.html',
  styleUrls: ['./confirm-deletion-dialog.component.css']
})
export class ConfirmDeletionDialogComponent {
  @ViewChild(ModalDialogComponent) protected dialog!: ModalDialogComponent;
  @Output() remove = new EventEmitter<boolean>();

  show() {
    this.dialog.show();
  }

  protected confirmRemove(choice: boolean) {
    this.remove.emit(choice);
    this.dialog.close();
  }
}
