import React, { createContext, useContext, useEffect, useState } from 'react';

import { initialdownloadState } from './initialState';

const state = {
  downloadState: initialdownloadState,
  setdownloadState: (value: typeof initialdownloadState) => {},
};

export const DownLoadContext = createContext<typeof state>(state);

const DownLoadProvider = ({ children }) => {
  const [downloadState, setdownloadState] = useState<typeof initialdownloadState>(initialdownloadState);

  return <DownLoadContext.Provider value={{ downloadState, setdownloadState }}>{children}</DownLoadContext.Provider>;
};

export const useDowonloadContext = () => useContext(DownLoadContext);
export default DownLoadProvider;
