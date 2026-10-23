import {
  HASHTAG_LIMIT,
  completeHashtagQuery,
  countHashtags,
  currentHashtagQuery,
  extractHashtags,
  splitHashtagSegments,
} from './hashtag.utils';

describe('hashtag.utils', () => {
  it('should extract lowercased, deduped hashtags capped at the backend limit', () => {
    const content = 'trip #Travel #travel #café #niño_2 ok';
    expect(extractHashtags(content)).toEqual(['travel', 'café', 'niño_2']);
  });

  it('should cap extracted hashtags like the backend', () => {
    const content = Array.from({ length: 12 }, (_, i) => `#tag${i}`).join(' ');
    expect(extractHashtags(content).length).toBe(HASHTAG_LIMIT);
  });

  it('should count unique hashtags without the cap', () => {
    const content = `${Array.from({ length: 12 }, (_, i) => `#tag${i}`).join(' ')} #tag0`;
    expect(countHashtags(content)).toBe(12);
  });

  it('should split text into plain and hashtag segments', () => {
    expect(splitHashtagSegments('a #one b #two')).toEqual([
      { text: 'a ' },
      { text: '#one', hashtag: 'one' },
      { text: ' b ' },
      { text: '#two', hashtag: 'two' },
    ]);
  });

  it('should return a single plain segment when there are no hashtags', () => {
    expect(splitHashtagSegments('plain text')).toEqual([{ text: 'plain text' }]);
  });

  it('should read the trailing partial tag being typed', () => {
    expect(currentHashtagQuery('hello #trav')).toBe('trav');
    expect(currentHashtagQuery('hello #')).toBe('');
    expect(currentHashtagQuery('hello #tag done')).toBeNull();
  });

  it('should complete the trailing partial tag with a space', () => {
    expect(completeHashtagQuery('hello #trav', 'travel')).toBe(
      'hello #travel '
    );
  });
});
