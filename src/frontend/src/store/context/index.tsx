import React, { createContext, useContext, useState, ReactNode } from 'react';

import { initialGlobalState } from './hooks/global/initialState';
import GlobalProvider from './hooks/global/useGlobalStateHook';
import RoutineProvider from './hooks/routine/useRoutineStateHook';
import DownLoadProvider from './hooks/download/useDownloadStateHook';

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <GlobalProvider>
      <DownLoadProvider>
        <RoutineProvider>{children}</RoutineProvider>
      </DownLoadProvider>
    </GlobalProvider>
  );
};

export default ContextProvider;
