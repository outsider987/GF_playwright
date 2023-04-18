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
import Input from '~/components/Input/Input';

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
    <div className="flex flex-col space-y-4">
      {/* <div className="flex space-x-3 ">
        <span>目標</span>
        <Input></Input>
        <span>子目標</span>
        <Input></Input>
      </div> */}

      <div className=" flex justify-start pl-4">
        <Button onClick={handleStart} className="flex w-[20vw]">
          Start
        </Button>
      </div>

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
