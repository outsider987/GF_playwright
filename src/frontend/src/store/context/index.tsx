import React, { createContext, useContext, useState, ReactNode } from 'react';

import { initialGlobalState } from '../initialState';
import useGlobalStateHook from './hooks/useGlobalStateHook';

const state = {
  isShowPanel: false,
  setShowPanel: (value) => {},
  mode: '' ,
  setMode: (value) => {},
  globalState: initialGlobalState,
  setGlobalState: (value: typeof initialGlobalState) => {},
};

const GlobalContext = createContext<typeof state>(state);

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [isShowPanel, setShowPanel] = useState(false);
  const [mode, setMode] = useState(null);
  const { globalState, setGlobalState } = useGlobalStateHook();

  return (
    <GlobalContext.Provider value={{ isShowPanel, setShowPanel, mode, setMode, globalState, setGlobalState }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default ContextProvider;
