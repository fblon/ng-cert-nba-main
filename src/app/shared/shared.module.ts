import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConferencePipe } from './conference.pipe';
import { DivisionPipe } from './division.pipe';



@NgModule({
  declarations: [
    ConferencePipe,
    DivisionPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConferencePipe,
    DivisionPipe
  ]
})
export class SharedModule { }
