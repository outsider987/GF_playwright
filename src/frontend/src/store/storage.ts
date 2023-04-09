import { store } from '~/store';
import { setToken } from '~/store/auth';
import { initialGlobalState } from './initialState';

export const setTokenStorage = (tokens: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem('tokens', JSON.stringify(tokens));
  store.dispatch(setToken({ ...tokens, userInformation: null }));
  // store.dispatch(setTokenConfig({}));
};

export const getTokenStorage = () => {
  const tokens = localStorage.getItem('tokens');
  if (tokens == undefined) return { accessToken: '', refreshToken: '' };
  if (tokens) return JSON.parse(tokens);
  return '';
};

export const cleanTokenStorage = () => {
  localStorage.removeItem('tokens');
  store.dispatch(setToken({ accessToken: '', refreshToken: '', userInformation: null }));
};

export const useGlobalStorage = () => {
  const key = 'global_state';
  const setGlobalStorage = (dataObject: typeof initialGlobalState) => {
    sessionStorage.setItem(key, JSON.stringify(dataObject));
  };

  const getGlobalStorage = () => {
    const value = sessionStorage.getItem(key);
    if (value == undefined) return null;
    if (value) return JSON.parse(value) as typeof initialGlobalState;
    return null;
  };

  const removeGlobalStorage = () => {
    sessionStorage.removeItem(key);
  };
  return { setGlobalStorage, getGlobalStorage, removeGlobalStorage };
};
