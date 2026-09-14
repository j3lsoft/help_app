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

export const MAX_MEDIA_ITEMS = 5;

export interface MediaItem {
  /** Client-side unique ID (crypto.randomUUID). */
  id: string;
  image: SelectedPostImage;
  filter: string;
  edits: PostEditState;
  /** Confirmed upload from a previous attempt; skip re-upload on retry. */
  pendingMediaId: string | null;
}

export interface PostEditState {
  brightness: number; // -100..100, 0 = neutral
  contrast: number; // -100..100, 0 = neutral
  blur: number; // 0..10, 0 = neutral
  rotate: number; // 0..3 steps 90° clockwise
  saturation: number; // -100..100, 0 = neutral
  warmth: number; // -100..100, 0 = neutral
  vignette: number; // 0..100, 0 = none
  sharpen: number; // 0..100, 0 = none
}

export const POST_EDIT_STATE_NEUTRAL: Readonly<PostEditState> = {
  brightness: 0,
  contrast: 0,
  blur: 0,
  rotate: 0,
  saturation: 0,
  warmth: 0,
  vignette: 0,
  sharpen: 0,
};

export type PostEditKey = keyof PostEditState;
