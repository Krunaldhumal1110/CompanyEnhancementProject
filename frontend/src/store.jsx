import { configureStore } from '@reduxjs/toolkit';
import machineReducer from './machineSlice';

const store = configureStore({
  reducer: {
    machines: machineReducer,
  },
});

export default store;
