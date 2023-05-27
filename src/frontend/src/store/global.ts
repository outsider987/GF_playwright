import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  alertDialog: {
    show: false,
    msg: '',
    title: 'error',
  },
  loadingDialog: {
    show: false,
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
    setLoadingDialog: (state, action: PayloadAction<typeof initialState.loadingDialog>) => {
      const { loadingDialog } = state;
      const { show } = action.payload;

      state.loadingDialog = { ...loadingDialog, show };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAlertDialog, setLoadingDialog } = globalSlice.actions;

export default globalSlice.reducer;
