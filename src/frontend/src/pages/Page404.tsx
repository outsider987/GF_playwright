import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import HomeWrapper from '~/layouts/HomeWrapper';

const Page404 = () => {
  const contentContainer =
    location.pathname === '/tags'
      ? 'content_tags_container'
      : 'content_container';
  return (
    <HomeWrapper>
      <div>404</div>
    </HomeWrapper>
  );
};
export default Page404;
