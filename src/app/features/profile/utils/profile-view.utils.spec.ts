import { PostResponseDto } from '@features/posts/models/post.dto';
import {
  resolveProfileMediaUrls,
  toProfileMediaItems,
} from './profile-view.utils';

function makePost(
  id: string,
  media: { id: string; position: number; publicUrl: string }[],
): PostResponseDto {
  return {
    id,
    authorId: 'u1',
    content: null,
    media: media.map((m) => ({
      id: m.id,
      mediaFileId: `file-${m.id}`,
      position: m.position,
      publicUrl: m.publicUrl,
      mimeType: 'image/jpeg',
    })),
    status: 'published',
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z',
  };
}

describe('profile-view.utils media helpers', () => {
  const POSTS: PostResponseDto[] = [
    makePost('p1', [
      { id: 'm2', position: 1, publicUrl: 'p1-b.jpg' },
      { id: 'm1', position: 0, publicUrl: 'p1-a.jpg' },
    ]),
    makePost('p2', [{ id: 'm3', position: 0, publicUrl: 'p2-a.jpg' }]),
    makePost('p3', []),
  ];

  it('should flatten all media, keeping post and position order', () => {
    expect(resolveProfileMediaUrls(POSTS)).toEqual([
      'p1-a.jpg',
      'p1-b.jpg',
      'p2-a.jpg',
    ]);
  });

  it('should build media items with unique keys and originating post id', () => {
    const items = toProfileMediaItems(POSTS);

    expect(items).toEqual([
      { key: 'p1#0', image: 'p1-a.jpg', postId: 'p1' },
      { key: 'p1#1', image: 'p1-b.jpg', postId: 'p1' },
      { key: 'p2#0', image: 'p2-a.jpg', postId: 'p2' },
    ]);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });

  it('should skip posts without media', () => {
    expect(toProfileMediaItems([POSTS[2]])).toEqual([]);
    expect(resolveProfileMediaUrls([POSTS[2]])).toEqual([]);
  });
});
