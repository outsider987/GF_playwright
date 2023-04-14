import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '~/components/Button';
import CheckBox from '~/components/Input/CheckBox';
import { useRoutineContext } from '~/store/context/hooks/routine/useRoutineStateHook';

import Filed from '~/components/Filed/Filed';
import { useGlobalContext } from '~/store/context/hooks/global/useGlobalStateHook';
import { useRoutineAPI } from '~/ipcRenderAPI/routine';
import clsx from 'clsx';
import ConfirmCancelModal from '~/components/modals/ConfirmCancel';
import { initialRoutineState } from '~/store/context/hooks/routine/initialState';

const Routine = () => {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [countChecked, setCountChecked] = React.useState(true);
  const { routineState, setRoutineState } = useRoutineContext();
  const { globalState, setGlobalState } = useGlobalContext();
  const { SEND_ROUTINE_START, INVOKE_GET_ROUTINE_STATE, SEND_ROUTINE_STOP } = useRoutineAPI();

  const handleStart = async (event) => {
    setIsModalOpen(false);
    setGlobalState({ ...globalState, isRunning: true });
    SEND_ROUTINE_START(routineState, { ...globalState, isRunning: true });
  };
  const handleChange = (e) => {
    const { checked, name } = e.target;

    setRoutineState({ ...routineState, [name]: { ...routineState[name], enable: checked } });
  };

  const subHandleChange = (parentName, type, isTextnumber, e) => {
    let { value, name, checked } = e.target;

    if (isTextnumber) {
      value = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    }
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
  const handleStop = () => {
    SEND_ROUTINE_STOP();
  };

  const filedCssClass = (isLine, type) => {
    const className = clsx(
      'flex space-y-4 pl-4',
      isLine ? 'w-full' : '',
      type === 'checkbox' ? 'justify-end flex-row-reverse items-center' : 'flex-col',
    );
    return className;
  };
  const state = Object.values(initialRoutineState);

  useEffect(() => {
    INVOKE_GET_ROUTINE_STATE(routineState).then((res) => {
      setRoutineState({ ...routineState, ...res });
    });
  }, []);

  return (
    <div className=" flex-1 space-y-5 align-bottom text-2xl">
      {Object.values(routineState).map((item, index1) => {
        return (
          <>
            <div key={item.code} className="flex flex-row items-center justify-center space-x-3">
              <CheckBox checked={item.enable} onChange={handleChange} name={item.code}></CheckBox>
              <span className="flex">{state[index1].name}</span>
            </div>
            <div className={`grid grid-cols-3 gap-4 ${item.enable ? '' : 'hidden'}`}>
              {item.children &&
                Object.values(item.children).map((child, index) => {
                  return (
                    <div key={child.name} className={filedCssClass(child.isLine, child.type)}>
                      <span className="flex w-auto">{child.name}</span>
                      <Filed
                        name={Object.values(state[index1].children)[index].name}
                        type={child.type as any}
                        value={child.value}
                        onChange={(e) => subHandleChange(item.code, child.type, child.isTextNumer, e)}
                      ></Filed>
                    </div>
                  );
                })}
            </div>
          </>
        );
      })}

      <div className="fle-row flex justify-around space-x-4">
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
        {/* <Button className="flex w-[20vw]" onClick={handleStop}>
          stop
        </Button> */}
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
export default Routine;
