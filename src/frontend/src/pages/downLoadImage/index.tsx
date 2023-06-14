import React, { useEffect } from 'react';
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
import CheckBox from '~/components/Input/CheckBox';
import { useDowonloadContext } from '~/store/context/hooks/download/useDownloadStateHook';
import { initialdownloadState } from '~/store/context/hooks/download/initialState';
import { useDowonloadAPI } from '~/ipcRenderAPI/download';

const downLoadImage = () => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { downloadState, setdownloadState } = useDowonloadContext();
  const { globalState, setGlobalState } = useGlobalContext();
  const { SEND_DOWNLOAD_START, INVOKE_GET_DOWNLOAD_STATE } = useDowonloadAPI();

  const handleStart = async (event) => {
    setIsModalOpen(false);
    setGlobalState({ ...globalState, isRunning: true });
    SEND_DOWNLOAD_START(downloadState, { ...globalState, mode: 'downloadImagePackage' });
  };

  const handleChange = (e) => {
    const { checked, name } = e.target;

    setdownloadState({ ...downloadState, [name]: { ...downloadState[name], enable: checked } });
  };
  useEffect(() => {}, [downloadState]);
  const state = Object.values(initialdownloadState);

  // useEffect(() => {
  //   INVOKE_GET_DOWNLOAD_STATE(downloadState);
  // }, []);

  return (
    <div className="flex flex-col space-y-4">
      {Object.values(downloadState).map((item, index1) => {
        return (
          <div key={index1}>
            <div className="flex flex-row items-center justify-center space-x-3">
              <CheckBox checked={item.enable} onChange={handleChange} name={item.code}></CheckBox>
              <span className="flex">{state[index1].text}</span>
            </div>

            <div className={`grid grid-cols-3 gap-4 ${item.enable ? '' : 'hidden'}`}>
              {/* {item.children &&
                Object.values(item.children).map((child, index) => {
                  return (
                    <div key={child.name} className={filedCssClass(child.isLine, child.type)}>
                      <span className="flex w-auto">{child.text}</span>
                      <Filed
                        name={Object.values(state[index1].children)[index].name}
                        type={child.type as any}
                        value={child.value}
                        onChange={(e) => subHandleChange(item.code, child.type, child.isTextNumer, e)}
                      ></Filed>
                    </div>
                  );
                })} */}
            </div>
          </div>
        );
      })}

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
