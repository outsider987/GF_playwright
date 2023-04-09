import React from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import MainWrapper from '~/layouts';
import NavBar from '~/layouts/NavBar';
import { RotateLeft, ArtTrack } from '@mui/icons-material';
import clsx from 'clsx';
import Header from '~/layouts/Header';
const Main = () => {
  const { pathname } = useLocation();
  let contentContainer = pathname === '/profile' ? 'content_tags_container' : 'content_container';
  contentContainer = pathname === '/canvas/image-editor' ? 'content_editor_container' : 'content_container';
  const container = clsx('flex', 'flex-col', 'text-[20vw]', 'text-white');
  const IconSize = '20vw';
  const navigation = useNavigate;

  return (
    <>
      <Header></Header>
      <MainWrapper>
        <NavBar></NavBar>
        <div className={container}>
          {useLocation().pathname !== '/' ? (
            <Outlet />
          ) : (
            <>
              <RotateLeft sx={{ fontSize: IconSize }}></RotateLeft>
              <ArtTrack sx={{ fontSize: IconSize }}></ArtTrack>
            </>
          )}
          {/* <Outlet /> */}
        </div>
      </MainWrapper>
    </>
  );
};
export default Main;
