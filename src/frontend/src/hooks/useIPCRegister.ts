import { ipcRenderer } from "electron";
import { store } from "~/store";
import { setAlertDialog, setLoadingDialog } from "~/store/global";


const useIPCRegister = () => {

    ipcRenderer.on('update-available', (event, line) => {
        store.dispatch(setLoadingDialog({ show: true }));
    });

    ipcRenderer.on('update-available-close', (event, line) => {
        store.dispatch(setLoadingDialog({ show: false }));
    });

    ipcRenderer.on('rountineEnd', (event, msg) => {
        store.dispatch(setAlertDialog({ show: true, msg: msg, title: 'Status' }));
    });



}

export default useIPCRegister;