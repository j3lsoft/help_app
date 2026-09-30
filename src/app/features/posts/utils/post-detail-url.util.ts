/**
 * Deep link to a Post detail, optionally pinning the media carousel to the
 * image the user tapped in the list. An absent/zero index stays out of the URL.
 */
export function buildPostDetailUrl(
  postId: string,
  imageIndex?: number,
): string {
  if (!postId) {
    return 'post-detail/';
  }
  return imageIndex && imageIndex > 0
    ? `post-detail/${postId}?image=${imageIndex}`
    : `post-detail/${postId}`;
}
