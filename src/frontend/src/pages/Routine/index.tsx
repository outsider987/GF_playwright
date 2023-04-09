import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';
import Button from '~/components/Button';
import Radio from '~/components/Radio';

const Routine = () => {
  const { pathname } = useLocation();
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // handle radio change event here
  };
  return (
    <div className=" flex-1  align-bottom">
      <div>
        <Radio label="Option 1" name="options" value="option1" checked={true} onChange={handleRadioChange} />
        <Radio label="Option 2" name="options" value="option2" checked={false} onChange={handleRadioChange} />
        <Radio label="Option 3" name="options" value="option3" checked={false} onChange={handleRadioChange} />
      </div>
      <Button>Start</Button>
    </div>
  );
};
export default Routine;
