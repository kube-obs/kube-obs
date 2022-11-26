import { atom } from 'recoil';
import { syncEffect } from 'recoil-sync';
import { string } from '@recoiljs/refine';

export const clusterState = atom({
  key: 'clusterState', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
  effects: [syncEffect({ refine: string() })],
});
