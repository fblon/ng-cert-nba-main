import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'division'
})
export class DivisionPipe implements PipeTransform {

  transform(value: string): string {
    return `${value} division`;
  }

}
