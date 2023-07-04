import { ipcRenderer } from 'electron';
import { initialGlobalState } from '~/store/context/hooks/global/initialState';
import { initialRoutineState } from '~/store/context/hooks/routine/initialState';

export const useRoutineAPI = () => {
  const SEND_ROUTINE_START = async (
    routineState: typeof initialRoutineState,
    globalState: typeof initialGlobalState,
  ) => {
    await ipcRenderer.send('routineStart', { globalState, routineState });
  };

  const SEND_ROUTINE_STOP = async () => {
    await ipcRenderer.send('routineStop');
  };

  const INVOKE_GET_ROUTINE_STATE = async (routineState) => {
    const res = await ipcRenderer.invoke('getRoutineState', { routineState }).catch((e) => console.log(e));
    return res;
  };

  const INVOKE_SAVE_ROUTINE_STATE = async (routineState, name) => {
    const res = await ipcRenderer.invoke('saveRoutineState', { ...routineState, name }).catch((e) => console.log(e));
    return res;
  };

  return { SEND_ROUTINE_START, INVOKE_GET_ROUTINE_STATE, SEND_ROUTINE_STOP, INVOKE_SAVE_ROUTINE_STATE };
};
