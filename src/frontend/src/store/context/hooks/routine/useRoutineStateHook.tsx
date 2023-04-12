import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialFlowItems } from './initialState';

const state = {
  routineState: initialFlowItems,
  setRoutineState: (value: typeof initialFlowItems) => {},
};

export const RoutineContext = createContext<typeof state>(state);

const RoutineProvider = ({ children }) => {
  const [routineState, setRoutineState] = useState<typeof initialFlowItems>(initialFlowItems);

  const handleGolobalState = (value: typeof initialFlowItems) => {
    setRoutineState(value);
  };
  useEffect(() => {
    // setGlobalState(getGlobalStorage());
  }, []);
  return <RoutineContext.Provider value={{ routineState, setRoutineState }}>{children}</RoutineContext.Provider>;
};
export const useRoutineContext = () => useContext(RoutineContext);
export default RoutineProvider;
