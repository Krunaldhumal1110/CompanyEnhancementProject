import { configureStore } from '@reduxjs/toolkit';
import machineReducer from '../slices/machineSlice';

const store = configureStore({
  reducer: {
    machines: machineReducer,
  },
});

export default store;
