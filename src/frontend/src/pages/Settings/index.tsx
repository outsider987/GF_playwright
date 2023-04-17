import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import { ipcRenderer } from 'electron';
import ConfirmCancelModal from '~/components/modals/ConfirmCancel';
import { useRoutineAPI } from '~/ipcRenderAPI/routine';
import { useRoutineContext } from '~/store/context/hooks/routine/useRoutineStateHook';
import { useGlobalContext } from '~/store/context/hooks/global/useGlobalStateHook';
import clsx from 'clsx';
import Button from '~/components/Button';
import Filed from '~/components/Filed/Filed';
import { useGlobalIPC } from '~/ipcRenderAPI/global';

const Settings = () => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { routineState, setRoutineState } = useRoutineContext();
  const { globalState, setGlobalState } = useGlobalContext();

  const { INVOKE_SAVE_GLOBAL_STATE } = useGlobalIPC();

  const handleSave = async (event) => {
    setIsModalOpen(false);
    INVOKE_SAVE_GLOBAL_STATE({ ...globalState });
  };
  const filedCssClass = (isLine, type) => {
    const className = clsx(
      'flex space-y-4 pl-4',
      isLine ? 'w-full' : '',
      type === 'checkbox' ? 'justify-end flex-row-reverse items-center' : 'flex-col',
    );
    return className;
  };

  const handleSaveMode = (e) => {
    setGlobalState({ ...globalState, saveMode: e.target.checked });
  };

  return (
    <div>
      <div className={filedCssClass(false, 'checkbox')}>
        <span className="flex w-auto">{'是否啟動儲存'}</span>
        <Filed name={'saveMode'} type={'checkbox'} value={globalState.saveMode} onChange={handleSaveMode}></Filed>
      </div>
      <Button onClick={() => setIsModalOpen(true)} className="flex w-[20vw]">
        save
      </Button>
      <ConfirmCancelModal
        titile={'確認要儲存?'}
        backdrop={() => setIsModalOpen(false)}
        toggle={isModalOpen}
        onConfirm={handleSave}
      ></ConfirmCancelModal>
    </div>
  );
};
export default Settings;
