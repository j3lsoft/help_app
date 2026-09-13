import { Pipe, PipeTransform } from '@angular/core';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Compact relative time for post metadata: `Now`, `5m`, `2h`, `3d`, then an
 * absolute `Aug 25` (adding the year when it differs from `now`'s year).
 * `now` is injectable so tests can pin the clock.
 */
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    now: number = Date.now()
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    const timestamp = date.getTime();
    if (Number.isNaN(timestamp)) {
      return '';
    }

    const diff = now - timestamp;
    if (diff < MINUTE) {
      return 'Now';
    }
    if (diff < HOUR) {
      return `${Math.floor(diff / MINUTE)}m`;
    }
    if (diff < DAY) {
      return `${Math.floor(diff / HOUR)}h`;
    }
    if (diff < WEEK) {
      return `${Math.floor(diff / DAY)}d`;
    }

    const base = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
    const sameYear = new Date(now).getFullYear() === date.getFullYear();
    return sameYear ? base : `${base}, ${date.getFullYear()}`;
  }
}
