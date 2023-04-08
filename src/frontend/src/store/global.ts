import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  alertDialog: {
    show: false,
    msg: '',
    title: 'error',
  },
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAlertDialog: (state, action: PayloadAction<typeof initialState.alertDialog>) => {
      const { alertDialog } = state;
      const { msg, show, title } = action.payload;

      state.alertDialog = { ...alertDialog, show, msg, title };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAlertDialog } = globalSlice.actions;

export default globalSlice.reducer;
