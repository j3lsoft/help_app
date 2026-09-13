import { PostComment } from '../models/post-comment.model';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * Local-only seed used until the comments endpoints exist. `now` is injectable
 * so specs can pin relative times.
 */
export function createCommentSeed(now: number = Date.now()): PostComment[] {
  return [
    {
      id: 'comment-1',
      authorId: 'user-28',
      authorName: 'jiyashah_',
      authorAvatar: 'assets/images/users/user28.png',
      text: 'This looks amazing 😍',
      createdAt: new Date(now - 12 * MINUTE).toISOString(),
    },
    {
      id: 'comment-2',
      authorId: 'user-18',
      authorName: 'ishankhatri',
      authorAvatar: 'assets/images/users/user18.png',
      text: 'Nice one...',
      createdAt: new Date(now - 46 * MINUTE).toISOString(),
    },
    {
      id: 'comment-3',
      authorId: 'user-32',
      authorName: 'monaliali.',
      authorAvatar: 'assets/images/users/user32.png',
      text: 'Adorable 🔥 where was this taken?',
      createdAt: new Date(now - 3 * HOUR).toISOString(),
    },
    {
      id: 'comment-4',
      authorId: 'user-27',
      authorName: 'anujshah.__',
      authorAvatar: 'assets/images/users/user27.png',
      text: '👌',
      createdAt: new Date(now - 26 * HOUR).toISOString(),
    },
  ];
}
