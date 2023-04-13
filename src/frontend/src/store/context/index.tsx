import React, { createContext, useContext, useState, ReactNode } from 'react';

import { initialGlobalState } from './hooks/global/initialState';
import GlobalProvider from './hooks/global/useGlobalStateHook';
import RoutineProvider from './hooks/routine/useRoutineStateHook';

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <GlobalProvider>
      <RoutineProvider>{children}</RoutineProvider>
    </GlobalProvider>
  );
};

export default ContextProvider;
