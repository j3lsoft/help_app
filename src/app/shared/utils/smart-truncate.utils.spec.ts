import { findSmartCutPoint, smartTruncate } from './smart-truncate.utils';

describe('smartTruncate', () => {
  it('should not truncate short texts', () => {
    const result = smartTruncate('Hello world');
    expect(result).toEqual({ preview: 'Hello world', isTruncated: false });
  });

  it('should not truncate texts barely over the limit', () => {
    const text = 'a'.repeat(290);
    expect(smartTruncate(text, 280).isTruncated).toBeFalse();
  });

  it('should cut at the sentence end near the limit', () => {
    const first = 'First complete sentence. ';
    const second = 'x'.repeat(260);
    const text = first + second + ' Last sentence. ' + 'y'.repeat(200);
    const result = smartTruncate(text, 280);
    expect(result.isTruncated).toBeTrue();
    expect(result.preview.endsWith('sentence')).toBeTrue();
    expect(result.preview.length).toBeLessThanOrEqual(340);
  });

  it('should prefer paragraph breaks', () => {
    const text = `${'a'.repeat(250)}\n\n${'b'.repeat(300)}`;
    const result = smartTruncate(text, 280);
    expect(result.isTruncated).toBeTrue();
    expect(result.preview).toBe('a'.repeat(250));
  });

  it('should not cut mid-word', () => {
    const text = `${'word '.repeat(60)}${'z'.repeat(200)}`;
    const result = smartTruncate(text, 280);
    expect(result.isTruncated).toBeTrue();
    expect(result.preview.endsWith(' ')).toBeFalse();
    expect(/\s$/.test(result.preview)).toBeFalse();
  });

  it('should hard-cut texts without spaces', () => {
    const text = 'x'.repeat(500);
    const result = smartTruncate(text, 280);
    expect(result.isTruncated).toBeTrue();
    expect(result.preview.length).toBe(280);
  });

  it('should handle null as empty', () => {
    expect(smartTruncate(null)).toEqual({ preview: '', isTruncated: false });
  });
});

describe('findSmartCutPoint', () => {
  it('should return -1 without natural candidates', () => {
    expect(findSmartCutPoint('x'.repeat(500), 280)).toBe(-1);
  });
});
