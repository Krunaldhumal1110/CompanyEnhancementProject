import { createSlice } from '@reduxjs/toolkit';

const machineSlice = createSlice({
  name: 'machines',
  initialState: { list: [] },
  reducers: {
    setMachines(state, action) {
      state.list = action.payload;
    },
    addMachine(state, action) {
      state.list.push(action.payload);
    },
    removeMachine(state, action) {
      state.list = state.list.filter(m => m.id !== action.payload);
    },
    updateMachine(state, action) {
      const idx = state.list.findIndex(m => m.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
  },
});

export const { setMachines, addMachine, removeMachine, updateMachine } = machineSlice.actions;
export default machineSlice.reducer;
