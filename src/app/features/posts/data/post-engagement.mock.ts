import { PostEngagement } from '../models/post-engagement.model';

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) % 1_000_003;
  }
  return result;
}

/**
 * Deterministic placeholder counters until the API exposes engagement totals.
 * Keeps a stable number per Post instead of a random one on every render.
 */
export function createEngagementSeed(postId: string): PostEngagement {
  const base = hash(postId);
  return {
    likes: 24 + (base % 800),
    saves: 3 + (base % 180),
  };
}
