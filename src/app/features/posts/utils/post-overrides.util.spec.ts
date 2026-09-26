import { Post } from '../models/post-view.model';
import {
  EMPTY_POST_OVERRIDES,
  PostOverrides,
  applyPostOverrides,
} from './post-overrides.util';

const BASE: Post = {
  id: 'p1',
  userProfilePic: '',
  userName: 'Alice',
  username: 'alice',
  aboutPost: 'hello',
  postLikes: '10',
  postComments: '0',
  postShares: '0',
  postSaves: '4',
  postSaved: false,
  postImage: 'a.png',
  postImages: ['a.png'],
  postLike: false,
};

function overrides(partial: Partial<PostOverrides>): PostOverrides {
  return { ...EMPTY_POST_OVERRIDES, ...partial };
}

describe('applyPostOverrides', () => {
  it('returns the post untouched when there are no overrides', () => {
    expect(applyPostOverrides(BASE, EMPTY_POST_OVERRIDES)).toEqual(BASE);
  });

  it('returns null for a tombstoned post', () => {
    const result = applyPostOverrides(
      BASE,
      overrides({ removedIds: new Set(['p1']) }),
    );
    expect(result).toBeNull();
  });

  it('applies an edited caption without touching the rest', () => {
    const result = applyPostOverrides(
      BASE,
      overrides({ contentPatches: new Map([['p1', 'edited']]) }),
    );
    expect(result?.aboutPost).toBe('edited');
    expect(result?.postLikes).toBe('10');
  });

  it('applies like/save flags and shifts plain integer counts', () => {
    const result = applyPostOverrides(
      BASE,
      overrides({
        engagement: new Map([
          ['p1', { postLike: true, likeDelta: 1, postSaved: true, saveDelta: 1 }],
        ]),
      }),
    );
    expect(result?.postLike).toBeTrue();
    expect(result?.postSaved).toBeTrue();
    expect(result?.postLikes).toBe('11');
    expect(result?.postSaves).toBe('5');
  });

  it('leaves abbreviated counts intact instead of corrupting them', () => {
    const result = applyPostOverrides(
      { ...BASE, postLikes: '10k' },
      overrides({ engagement: new Map([['p1', { postLike: true, likeDelta: 1 }]]) }),
    );
    expect(result?.postLikes).toBe('10k');
  });

  it('floors a decremented count at zero', () => {
    const result = applyPostOverrides(
      { ...BASE, postLikes: '0' },
      overrides({ engagement: new Map([['p1', { postLike: false, likeDelta: -1 }]]) }),
    );
    expect(result?.postLikes).toBe('0');
  });
});
