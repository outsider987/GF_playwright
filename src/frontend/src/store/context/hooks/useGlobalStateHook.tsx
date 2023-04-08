import { useEffect, useState } from 'react';
import { initialGlobalState } from '~/utils/initializeState';
import { useGlobalStorage } from '~/utils/storage';

const useGlobalStateHook = () => {
  const [globalState, setGlobalState] = useState<typeof initialGlobalState>(initialGlobalState);
  const { setGlobalStorage, getGlobalStorage } = useGlobalStorage();

  const handleGolobalState = (value: typeof initialGlobalState) => {
    setGlobalState(value);
    setGlobalStorage({
      ...value,
    });
  };
  useEffect(() => {
    setGlobalState(getGlobalStorage());
  }, []);
  return { globalState, setGlobalState: handleGolobalState };
};

export default useGlobalStateHook;
