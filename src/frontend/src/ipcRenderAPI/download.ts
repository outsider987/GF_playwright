import { ipcRenderer } from 'electron';
import { initialDownLoadState } from '~/store/context/hooks/download/initialState';
import { initialGlobalState } from '~/store/context/hooks/global/initialState';
import { initialRoutineState } from '~/store/context/hooks/routine/initialState';

export const useDowonloadAPI = () => {
    const SEND_DOWNLOAD_START = async (
        downloadState: typeof initialDownLoadState,
        globalState: typeof initialGlobalState,
    ) => {
        await ipcRenderer.send('downLoadStart', { globalState, downloadState });
    };


    const SEND_ROUTINE_STOP = async () => {
        await ipcRenderer.send('routineStop');
    };

    const INVOKE_GET_ROUTINE_STATE = async (routineState) => {
        const res = await ipcRenderer.invoke('getRoutineState', { routineState }).catch((e) => console.log(e));
        return res;
    };

    return { SEND_DOWNLOAD_START, };
};
