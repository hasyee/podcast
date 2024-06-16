import { Channel, Episode } from '../types';
import { memo, state } from '../utils/io';

export const useCounter = state(0).withActions({
  increment: () => state => state + 1,
  reset: () => 0
});

export const useMinus = memo(
  ([count]) => {
    //console.log('run selector');
    return -count;
  },
  [useCounter]
);

export const useSearchResult = state<{ channels: Channel[]; episodes: Episode[] }>({ channels: [], episodes: [] });
