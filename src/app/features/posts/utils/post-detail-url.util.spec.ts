import { buildPostDetailUrl } from './post-detail-url.util';

describe('buildPostDetailUrl', () => {
  it('builds a bare detail url without an image index', () => {
    expect(buildPostDetailUrl('p1')).toBe('post-detail/p1');
  });

  it('keeps the index out of the url for the first image', () => {
    expect(buildPostDetailUrl('p1', 0)).toBe('post-detail/p1');
  });

  it('pins the tapped image in the query string', () => {
    expect(buildPostDetailUrl('p1', 2)).toBe('post-detail/p1?image=2');
  });
});
