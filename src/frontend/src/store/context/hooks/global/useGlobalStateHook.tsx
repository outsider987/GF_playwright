import { useEffect, useState } from 'react';
import { initialGlobalState } from '~/store/initialState';
import { useGlobalStorage } from '~/store/storage';

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
