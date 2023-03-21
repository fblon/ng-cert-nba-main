import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConferencePipe } from './conference.pipe';
import { DivisionPipe } from './division.pipe';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';

@NgModule({
  declarations: [
    ConferencePipe,
    DivisionPipe,
    ModalDialogComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConferencePipe,
    DivisionPipe,
    ModalDialogComponent
  ]
})
export class SharedModule { }
