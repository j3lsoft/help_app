import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true,
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '0';
    }

    let num: number;

    if (typeof value === 'string') {
      // Remove commas if present in mock data or existing strings
      const clean = value.toLowerCase().replace(/,/g, '');
      if (clean.endsWith('k')) {
        return value; // Already formatted
      }
      num = parseInt(clean, 10);
    } else {
      num = value;
    }

    if (isNaN(num)) {
      return '0';
    }

    if (num >= 1000) {
      const kValue = num / 1000;
      return `${
        kValue % 1 === 0 ? kValue : kValue.toFixed(1).replace(/\.0$/, '')
      }k`;
    }

    return num.toString();
  }
}
