import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';
import NavBar from '../../layouts/NavBar';

const SizeImage = () => {
  const { pathname } = useLocation();

  return <div>SizeImage</div>;
};
export default SizeImage;
