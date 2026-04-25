import { PostItem } from '../models/post-item.model';

export type TabValue = 'All' | 'Videos' | 'Tags';

/**
 * Utility function to filter posts by tab value
 * Provides single source of truth for post filtering logic across profile pages
 */
export const filterPostsByTab = (
  tab: TabValue,
  mockAllPosts: PostItem[],
  mockVideoPosts: PostItem[],
  mockTaggedPosts: PostItem[]
): PostItem[] => {
  switch (tab) {
    case 'Videos':
      return mockVideoPosts;
    case 'Tags':
      return mockTaggedPosts;
    default:
      return mockAllPosts;
  }
};
