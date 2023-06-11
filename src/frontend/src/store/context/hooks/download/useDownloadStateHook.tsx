import React, { createContext, useContext, useEffect, useState } from 'react';

import { initialDownLoadState } from './initialState';

const state = {
  downLoadState: initialDownLoadState,
  setDownLoadState: (value: typeof initialDownLoadState) => { },
};

export const DownLoadContext = createContext<typeof state>(state);

const DownLoadProvider = ({ children }) => {
  const [downLoadState, setDownLoadState] = useState<typeof initialDownLoadState>(initialDownLoadState);

  return <DownLoadContext.Provider value={{ downLoadState, setDownLoadState }}>{children}</DownLoadContext.Provider>;
};

export const useDowonloadContext = () => useContext(DownLoadContext);
export default DownLoadProvider;
