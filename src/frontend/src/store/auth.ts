import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
export const initialState = {
  user: {
    accessToken: '',
    refreshToken: '',
    userInformation: {
      email: '',
      exp: 0,
      iat: 0,
      user_id: 0,
      username: '',
    },
  },
  // tokenConfig: {
  //   tokenExpiredTime: 10,
  //   tokeType: 'access',
  // },
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<typeof initialState.user>) => {
      const { user } = state;
      const { accessToken, refreshToken } = action.payload;

      if (accessToken === '') {
        state.user = { ...action.payload, userInformation: initialState.user.userInformation };
        return;
      } else {
        const jwtUser = jwtDecode(accessToken) as any;
        state.user = { ...user, accessToken, refreshToken, userInformation: jwtUser };
      }
    },
    // setTokenConfig: (state, action: PayloadAction<typeof initialState.tokenConfig>) => {
    //   // const { tokenExpiredTime } = state.tokenConfig;
    //   // state.tokenConfig = {
    //   //   ...state.tokenConfig,
    //   //   tokenExpiredTime: action.payload.tokenExpiredTime,
    //   //   tokeType: action.payload.tokeType,
    //   // };
    // },
  },
});

// Action creators are generated for each case reducer function
export const { setToken } = globalSlice.actions;

export default globalSlice.reducer;
