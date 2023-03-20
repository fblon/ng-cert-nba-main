import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConferencePipe } from './conference.pipe';



@NgModule({
  declarations: [
    ConferencePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConferencePipe
  ]
})
export class SharedModule { }
