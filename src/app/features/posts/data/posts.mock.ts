import { PostEditOption, PostFilterOption } from '../models/post-creation.model';

export const POST_FILTER_OPTIONS: PostFilterOption[] = [
  { filterName: 'Normal', filter: '' },
  { filterName: 'Gingham', filter: 'grayscale(100%)' },
  { filterName: 'Lark', filter: 'saturate(3)' },
  { filterName: 'Clarendon', filter: 'sepia(100%)' },
  { filterName: 'Skyline', filter: 'hue-rotate(100deg)' },
  { filterName: 'Moon', filter: 'invert(90%)' },
  { filterName: 'Juno', filter: 'hue-rotate(200deg)' },
];

export const POST_EDIT_OPTIONS: PostEditOption[] = [
  { id: '1', editOptionIcon: 'assets/images/icons/adjust.png', optionName: 'Adjust' },
  { id: '2', editOptionIcon: 'assets/images/icons/brightness.png', optionName: 'Brightness' },
  { id: '3', editOptionIcon: 'assets/images/icons/contrast.png', optionName: 'Contrast' },
  { id: '4', editOptionIcon: 'assets/images/icons/curves.png', optionName: 'Curves' },
  { id: '5', editOptionIcon: 'assets/images/icons/crop.png', optionName: 'Crop' },
  { id: '6', editOptionIcon: 'assets/images/icons/rotate.png', optionName: 'Rotate' },
  { id: '7', editOptionIcon: 'assets/images/icons/blur.png', optionName: 'Blur' },
  { id: '8', editOptionIcon: 'assets/images/icons/perspective.png', optionName: 'Perspective' },
];
