export interface PostFilterOption {
  filterName: string;
  filter: string;
}

export interface PostEditOption {
  id: string;
  editOptionIcon: string;
  optionName: string;
}

export type PostImageSource = 'gallery' | 'camera' | 'web';

export interface SelectedPostImage {
  /** WebView-loadable URL: webPath, dataUrl or blob: URL. */
  src: string;
  format: string;
  origin: PostImageSource;
}

export type PostFilterTab = 'Filter' | 'Edit';
