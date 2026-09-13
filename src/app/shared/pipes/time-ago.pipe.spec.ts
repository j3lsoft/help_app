import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();
  const now = new Date('2026-09-12T12:00:00Z').getTime();

  it('should return an empty string for missing or invalid values', () => {
    expect(pipe.transform(null, now)).toBe('');
    expect(pipe.transform(undefined, now)).toBe('');
    expect(pipe.transform('', now)).toBe('');
    expect(pipe.transform('not-a-date', now)).toBe('');
  });

  it('should report recent instants as Now', () => {
    expect(pipe.transform(new Date(now - 10_000), now)).toBe('Now');
  });

  it('should report minutes, hours and days', () => {
    expect(pipe.transform(new Date(now - 5 * 60_000), now)).toBe('5m');
    expect(pipe.transform(new Date(now - 2 * 3_600_000), now)).toBe('2h');
    expect(pipe.transform(new Date(now - 3 * 86_400_000), now)).toBe('3d');
  });

  it('should fall back to an absolute date after a week', () => {
    expect(pipe.transform(new Date(2026, 7, 25), now)).toBe('Aug 25');
  });

  it('should include the year when it differs from now', () => {
    expect(pipe.transform(new Date(2025, 7, 25), now)).toBe('Aug 25, 2025');
  });
});
