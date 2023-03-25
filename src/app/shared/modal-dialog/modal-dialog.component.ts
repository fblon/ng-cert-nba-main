import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent {
  @Input() buttons: string[] = ['OK'];
  @Output() clickEvent = new EventEmitter<string>()

  @ViewChild('dialog') protected dialog!: ElementRef<HTMLDialogElement>;

  show() {
    this.dialog.nativeElement.showModal();
  }

  protected clickOn(button: string) {
    this.clickEvent.emit(button);
    this.dialog.nativeElement.close();
  } 
}
