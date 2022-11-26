import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Define a type for the slice state
interface CounterState {
  value: string | null;
}

// Define the initial state using that type
const initialState: CounterState = {
  value: null,
};

export const cluster = createSlice({
  name: 'cluster',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setCluster: state => {
      state.value += 1;
    },
    initCluster: state => {
      state.value += 1;
    },
  },
});

export const { setCluster, initCluster } = cluster.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCluster = (state: RootState) => state.cluster.value;

export default cluster.reducer;
