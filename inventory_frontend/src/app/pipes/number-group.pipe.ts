import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberGroup'
})
export class NumberGroupPipe implements PipeTransform {

  transform(value: number, delimiter: string = ','): string {
    const stringValue = value.toString();
    const parts = stringValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
    return parts.join('.');
  }

}
