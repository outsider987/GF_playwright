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
import Input from '~/components/Input/Input';
import CheckBox from '~/components/Input/CheckBox';

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

  const handleSaveMode = (e) => {
    setGlobalState({ ...globalState, saveMode: e.target.checked });
  };
  const onTargetChange = (e) => {
    const { name, value } = e.target;
    setGlobalState({ ...globalState, [name]: value });
  };

  return (
    <div>
      <div className="flex space-x-3 ">
        <span>目標</span>
        <Input value={globalState.target} name="target" onChange={onTargetChange}></Input>
        <span>子目標</span>
        <Input value={globalState.subTarget} name="subTarget" onChange={onTargetChange}></Input>
      </div>

      <div className={'flex justify-start space-y-4 pl-4'}>
        <CheckBox
          className="m-auto flex"
          name={'saveMode'}
          checked={globalState.saveMode}
          onChange={handleSaveMode}
        ></CheckBox>
        <div className="flex w-auto">{'是否啟動儲存'}</div>
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
