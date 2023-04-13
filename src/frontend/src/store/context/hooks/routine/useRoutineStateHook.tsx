import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialRoutineState } from './initialState';

const state = {
  routineState: initialRoutineState,
  setRoutineState: (value: typeof initialRoutineState) => {},
};

export const RoutineContext = createContext<typeof state>(state);

const RoutineProvider = ({ children }) => {
  const [routineState, setRoutineState] = useState<typeof initialRoutineState>(initialRoutineState);

  return <RoutineContext.Provider value={{ routineState, setRoutineState }}>{children}</RoutineContext.Provider>;
};
export const useRoutineContext = () => useContext(RoutineContext);
export default RoutineProvider;
