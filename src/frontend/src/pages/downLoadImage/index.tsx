import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import { ipcRenderer } from 'electron';
import ConfirmCancelModal from '~/components/modals/ConfirmCancel';
import { useRoutineAPI } from '~/ipcRenderAPI/routine';
import { useRoutineContext } from '~/store/context/hooks/routine/useRoutineStateHook';
import { useGlobalContext } from '~/store/context/hooks/global/useGlobalStateHook';
import Button from '~/components/Button';

const downLoadImage = () => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { routineState, setRoutineState } = useRoutineContext();
  const { globalState, setGlobalState } = useGlobalContext();
  const { SEND_ROUTINE_START, INVOKE_GET_ROUTINE_STATE, SEND_ROUTINE_STOP } = useRoutineAPI();

  const handleStart = async (event) => {
    setIsModalOpen(false);
    setGlobalState({ ...globalState, isRunning: true });
    SEND_ROUTINE_START(routineState, { ...globalState, mode: 'downloadImagePackage' });
  };
  return (
    <div>
      <Button onClick={handleStart} className="flex w-[20vw]">
        Start
      </Button>
      <ConfirmCancelModal
        titile={'確認要啟動?'}
        backdrop={() => setIsModalOpen(false)}
        toggle={isModalOpen}
        onConfirm={handleStart}
      ></ConfirmCancelModal>
    </div>
  );
};
export default downLoadImage;
