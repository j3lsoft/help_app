import { POST_EDIT_STATE_NEUTRAL } from '../models/post-creation.model';
import {
  buildEffectiveFilterCss,
  buildEffectiveTransformCss,
} from './post-effective-filter.util';

describe('post-effective-filter.util', () => {
  it('should return empty filter when preset and edits are neutral', () => {
    expect(buildEffectiveFilterCss('', POST_EDIT_STATE_NEUTRAL)).toBe('');
  });

  it('should compose preset with brightness and contrast', () => {
    const css = buildEffectiveFilterCss('grayscale(1)', {
      ...POST_EDIT_STATE_NEUTRAL,
      brightness: 30,
      contrast: -20,
    });
    expect(css).toContain('grayscale(1)');
    expect(css).toContain('brightness(1.3)');
    expect(css).toContain('contrast(0.8)');
  });

  it('should include blur saturation and warmth', () => {
    const css = buildEffectiveFilterCss('', {
      ...POST_EDIT_STATE_NEUTRAL,
      blur: 2,
      saturation: 40,
      warmth: 50,
    });
    expect(css).toContain('blur(2px)');
    expect(css).toContain('saturate(1.4)');
    expect(css).toContain('sepia(0.18)');
  });

  it('should build rotate transform from edit steps', () => {
    expect(buildEffectiveTransformCss(POST_EDIT_STATE_NEUTRAL)).toBe('');
    expect(
      buildEffectiveTransformCss({ ...POST_EDIT_STATE_NEUTRAL, rotate: 1 })
    ).toBe('rotate(90deg)');
  });
});
