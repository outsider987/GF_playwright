import React, { useEffect, useState } from 'react';
import { Router, useLocation } from 'react-router-dom';
import SvgICon from '~/components/SvgIcon';
import { HomeRoute } from '~/router';
import NavBarItem from '../NavBarItem';
import clsx from 'clsx';

const NavBar = () => {
  const container = clsx('min-h-screen', 'w-full', 'bg-navbar', 'block', 'max-w-navbar_desktop_w');

  return (
    <div className={container}>
      <div className="absolute right-[-1px] w-[1px] bg-black/20" />
      {/* desktop */}
      <div className="px-[1.66vw] py-[37px]">
        <div className="mb-[5vh]">
          <SvgICon name="logo" />
        </div>

        <div className="flex flex-col items-center space-y-6">
          {HomeRoute.children.map((item) => (
            <NavBarItem
              key={item.path}
              isShow={item.isShow}
              iconName={item.iconName}
              path={item.path}
              text={item.text}
              isFocus={useLocation().pathname === `${item.path}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default NavBar;
