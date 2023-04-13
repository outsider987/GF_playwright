import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import { Button } from '@mui/material';
import { ipcRenderer } from 'electron';

const SizeImage = () => {
  const { pathname } = useLocation();
  const handleStart = async (event) => {
    const res = await ipcRenderer.send('routineStart', { mode: 'downloadImagePackage' });
    console.log(res);
  };
  return (
    <div>
      SizeImage
      <Button onClick={handleStart} className="flex w-[20vw]">
        start
      </Button>
    </div>
  );
};
export default SizeImage;
