import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import Button from '~/components/Button';
import { ipcRenderer } from 'electron';
import CheckBox from '~/components/Input/CheckBox';
import { useRoutineContext } from '~/store/context/hooks/routine/useRoutineStateHook';
import { initialRoutineState } from '~/store/context/hooks/routine/initialState';
import Filed from '~/components/Filed/Filed';
import { useGlobalContext } from '~/store/context/hooks/global/useGlobalStateHook';
import { useRoutineAPI } from '~/ipcRenderAPI/routine';
import clsx from 'clsx';
import Modal from '~/components/modals/Modal';
import ConfirmCancelModal from '~/components/modals/ConfirmCancel';

const Routine = () => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [countChecked, setCountChecked] = React.useState(true);
  const { routineState, setRoutineState } = useRoutineContext();
  const { SEND_ROUTINE_START, INVOKE_GET_ROUTINE_STATE } = useRoutineAPI();
  const { globalState, setGlobalState } = useGlobalContext();
  const handleStart = async (event) => {
    debugger;
    SEND_ROUTINE_START(routineState, globalState);
  };
  const handleChange = (e) => {
    const { checked, name } = e.target;

    setRoutineState({ ...routineState, [name]: { ...routineState[name], enable: checked } });
  };

  const subHandleChange = (parentName, type, e) => {
    const { value, name, checked } = e.target;

    setRoutineState({
      ...routineState,
      [parentName]: {
        ...routineState[parentName],
        children: {
          ...routineState[parentName].children,
          [name]: { ...routineState[parentName].children[name], value: type === 'checkbox' ? checked : value },
        },
      },
    });
  };
  const handleCountChange = (e) => {
    setGlobalState({ ...globalState, count: e.target.value });
  };

  const filedCssClass = (isLine, type) => {
    const className = clsx(
      'flex space-y-4 pl-4',
      isLine ? 'w-full' : '',
      type === 'checkbox' ? 'justify-end flex-row-reverse items-center' : 'flex-col',
    );
    return className;
  };

  useEffect(() => {
    INVOKE_GET_ROUTINE_STATE().then((res) => {
      console.log(res);
    });
  }, []);

  return (
    <div className=" flex-1 space-y-5 align-bottom text-2xl">
      {Object.values(routineState).map((item, index) => {
        return (
          <>
            <div key={item.code} className="flex flex-row items-center justify-center space-x-3">
              <CheckBox checked={item.enable} onChange={handleChange} name={item.code}></CheckBox>
              <span className="flex">{item.name}</span>
            </div>
            <div className={`grid grid-cols-3 gap-4 ${item.enable ? '' : 'hidden'}`}>
              {item.children &&
                Object.values(item.children).map((child, index) => {
                  return (
                    <div key={child.name} className={filedCssClass(child.isLine, child.type)}>
                      <span className="flex w-auto">{child.name}</span>
                      <Filed
                        name={child.name}
                        type={child.type as any}
                        value={child.value}
                        onChange={(e) => subHandleChange(item.code, child.type, e)}
                      ></Filed>
                    </div>
                  );
                })}
            </div>
          </>
        );
      })}

      <Button
        disabled={
          !Object.values(routineState)
            .map((item) => item.enable)
            .includes(true)
        }
        onClick={() => setIsModalOpen(true)}
        className="flex w-[20vw]"
      >
        start
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
export default Routine;
