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
  const container = clsx('flex', 'flex-col', 'text-white');
  const IconSize = '20vw';

  return (
    <>
      <Header></Header>
      <MainWrapper>
        <NavBar></NavBar>
        <div className={container}>
          {useLocation().pathname !== '/' ? (
            <Outlet />
          ) : (
            <div className="flex flex-row space-x-3">
              <div className="text-col flex w-full flex-col justify-center ">
                <RotateLeft sx={{ fontSize: IconSize }}></RotateLeft>
              </div>
              <div className="text-col flex w-full flex-col justify-center ">
                <ArtTrack sx={{ fontSize: IconSize }}></ArtTrack>
                <span className=" text-xl">sizeImage</span>
              </div>
            </div>
          )}
        </div>
      </MainWrapper>
    </>
  );
};
export default Main;
