import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import Button from '~/components/Button';
import { ipcRenderer } from 'electron';
import CheckBox from '~/components/Input/CheckBox';

const Routine = () => {
  const { pathname } = useLocation();
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // handle radio change event here
  };

  return (
    <div className=" flex-1  align-bottom">
      <div>
        <CheckBox checked={true}></CheckBox>
      </div>

      <Button className="flex w-[20vw]"></Button>
    </div>
  );
};
export default Routine;
