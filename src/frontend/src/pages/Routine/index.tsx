import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import Button from '~/components/Button';
import Radio from '~/components/Radio';

const Routine = () => {
  const { pathname } = useLocation();

  return (
    <div className=" flex-1  align-bottom">
      <div>
        <Radio label={undefined} name={undefined} value={undefined} checked={undefined} onChange={undefined}></Radio>
      </div>
      <Button>Start</Button>
    </div>
  );
};
export default Routine;
