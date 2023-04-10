import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import Button from '~/components/Button';
import { ipcRenderer } from 'electron';
import CheckBox from '~/components/Input/CheckBox';

const Routine = () => {
  const { pathname } = useLocation();
  const handleStart = async (event) => {
    const res = await ipcRenderer.invoke('routineStart');
    console.log(res);
  };

  return (
    <div className=" flex-1  align-bottom">
      <div className="flex-1 flex-row">
        <span>移除重複圖片</span>
        <CheckBox checked={true}></CheckBox>
      </div>

      <Button onClick={handleStart} className="flex w-[20vw]">
        start
      </Button>
    </div>
  );
};
export default Routine;
