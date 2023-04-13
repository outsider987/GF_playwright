import { ipcRenderer } from 'electron';
import { initialGlobalState } from '~/store/context/hooks/global/initialState';
import { initialRoutineState } from '~/store/context/hooks/routine/initialState';

export const useRoutineAPI = () => {
  const SEND_ROUTINE_START = async (
    routineState: typeof initialRoutineState,
    globalState: typeof initialGlobalState,
  ) => {
    await ipcRenderer.send('routineStart', { globalState, param: routineState });
  };

  const INVOKE_GET_ROUTINE_STATE = async () => {
    const res = await ipcRenderer.invoke('getRoutineState').catch((e) => console.log(e));
    return res;
  };

  return { SEND_ROUTINE_START, INVOKE_GET_ROUTINE_STATE };
};
