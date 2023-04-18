import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialGlobalState } from '~/store/context/hooks/global/initialState';
import { useGlobalStorage } from '~/store/storage';

const state = {
  downLoadState: initialGlobalState,
  setDownLoadState: (value: typeof initialGlobalState) => {},
};

export const DownLoadContext = createContext<typeof state>(state);

const DownLoadProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState<typeof initialGlobalState>(initialGlobalState);

  return <DownLoadContext.Provider value={{ downLoadState: globalState, setDownLoadState: setGlobalState }}>{children}</DownLoadContext.Provider>;
};

export const useGlobalContext = () => useContext(DownLoadContext);
export default DownLoadProvider;
