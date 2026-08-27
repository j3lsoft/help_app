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

export interface PostEditState {
  brightness: number; // -100..100, 0 = neutral
  contrast: number; // -100..100, 0 = neutral
  blur: number; // 0..10, 0 = neutral
  rotate: number; // 0..3 steps 90° clockwise
}

export const POST_EDIT_STATE_NEUTRAL: Readonly<PostEditState> = {
  brightness: 0,
  contrast: 0,
  blur: 0,
  rotate: 0,
};

export type PostEditKey = keyof PostEditState;
