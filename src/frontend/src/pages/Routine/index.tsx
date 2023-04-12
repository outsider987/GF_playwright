import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import Button from '~/components/Button';
import { ipcRenderer } from 'electron';
import CheckBox from '~/components/Input/CheckBox';
import { useRoutineContext } from '~/store/context/hooks/routine/useRoutineStateHook';
import { initialFlowItems } from '~/store/context/hooks/routine/initialState';
import Filed from '~/components/Filed/Filed';

const Routine = () => {
  const { pathname } = useLocation();
  const { routineState, setRoutineState } = useRoutineContext();
  const handleStart = async (event) => {
    const res = await ipcRenderer.invoke('routineStart');
    console.log(res);
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

  return (
    <div className=" flex-1   space-y-5 align-bottom text-2xl">
      {Object.values(routineState).map((item, index) => {
        return (
          <>
            <div key={item.code} className="flex flex-row items-center justify-center space-x-3">
              <CheckBox checked={item.enable} onChange={handleChange} name={item.code}></CheckBox>
              <span className="flex">{item.name}</span>
            </div>
            <div className="flex flex-row">
              {item.children &&
                Object.values(item.children).map((child, index) => {
                  return (
                    <div key={child.name} className="flex flex-col ">
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

      <Button onClick={handleStart} className="flex w-[20vw]">
        start
      </Button>
    </div>
  );
};
export default Routine;
