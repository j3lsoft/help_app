import { PostFilterOption } from '../models/post-creation.model';

export const POST_FILTER_OPTIONS: PostFilterOption[] = [
  { filterName: 'Normal', filter: '' },
  { filterName: 'Gingham', filter: 'grayscale(100%)' },
  { filterName: 'Lark', filter: 'saturate(3)' },
  { filterName: 'Clarendon', filter: 'sepia(100%)' },
  { filterName: 'Skyline', filter: 'hue-rotate(100deg)' },
  { filterName: 'Moon', filter: 'invert(90%)' },
  { filterName: 'Juno', filter: 'hue-rotate(200deg)' },
];
