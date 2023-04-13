import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialGlobalState } from '~/store/context/hooks/global/initialState';
import { useGlobalStorage } from '~/store/storage';

const state = {
  globalState: initialGlobalState,
  setGlobalState: (value: typeof initialGlobalState) => {},
};

export const GlobalContext = createContext<typeof state>(state);

const GlobalProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState<typeof initialGlobalState>(initialGlobalState);

  return <GlobalContext.Provider value={{ globalState, setGlobalState }}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
export default GlobalProvider;
