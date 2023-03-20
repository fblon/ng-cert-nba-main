import { Pipe, PipeTransform } from '@angular/core';
import { Conference } from '../data.models';

@Pipe({
  name: 'conference'
})
export class ConferencePipe implements PipeTransform {

  transform(value: Conference): string {
    return `${value}ern conference`;
  }

}
