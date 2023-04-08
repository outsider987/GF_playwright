import React, { useState } from 'react';
import Button from '../components/Button';
import SortBox from '../components/SortBox';

interface Props {
  boxDatas: number[];
  onStart: () => void;
  isDesktop: boolean;
  title?: string;
}

const LayoutSort: React.FC<Props> = (props) => {
  if (props.isDesktop) {
    return (
      <div className="flex h-[90vh]  flex-row">
        <span className=" mr-2 flex flex-col space-y-3 text-lg font-bold text-white">
          <span>{props.title}</span>
          <span>count:{props.boxDatas.length}</span>
          <div className="mr-2 mb-2 flex w-full items-end">
            <Button onClick={props.onStart}> start</Button>
          </div>
        </span>

        <div className="flex max-h-[94vh] w-full flex-row items-end">
          {props.boxDatas.map((item, index) => (
            <SortBox key={index} height={item} width={2} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <div className=" flex flex-row justify-around text-lg font-bold text-white">
        <span>{props.title}</span>
        <span>count:{props.boxDatas.length}</span>
        <div className=" mr-2 mb-2 flex items-end">
          <Button onClick={props.onStart}> start</Button>
        </div>
      </div>

      <div className="flex max-h-[94vh] w-full flex-row items-end">
        {props.boxDatas.map((item, index) => (
          <SortBox key={index} height={item * 0.9} width={2} />
        ))}
      </div>
    </div>
  );
};
export default LayoutSort;
