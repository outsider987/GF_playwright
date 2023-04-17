import { ipcRenderer } from 'electron';
import { initialGlobalState } from '~/store/context/hooks/global/initialState';
import { initialRoutineState } from '~/store/context/hooks/routine/initialState';

export const useGlobalIPC = () => {
  const INVOKE_SAVE_GLOBAL_STATE = async (globalState) => {
    const res = await ipcRenderer.invoke('saveGlobalState', { globalState }).catch((e) => console.log(e));
    return res;
  };

  const INVOKE_GET_GLOBAL_STATE = async (globalState) => {
    const res = await ipcRenderer.invoke('getGlobalState', { globalState }).catch((e) => console.log(e));
    return res;
  };

  return { INVOKE_SAVE_GLOBAL_STATE, INVOKE_GET_GLOBAL_STATE };
};
