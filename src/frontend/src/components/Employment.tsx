import React, { useEffect, useState } from 'react';

export interface Props {
  skill: string;
  endYear: string;
  startYeat: string;
  responsible: Responsible[];
  company_name: string;
  title: string;
}
interface Responsible {
  content: string;
  link: string;
}

const Employment: React.FC<Props> = (props) => {
  return (
    <div className="space-y-3 text-white">
      <div className="flex w-full justify-between lg:max-w-[20vw]">
        <div className="text-gray-400">
          {props.startYeat}-{props.endYear}
        </div>
        <div className="block w-1 bg-white/60"></div>
        <div>{props.company_name}</div>
      </div>
      <div> {props.title}</div>
      <ul className="list-inside list-disc space-y-1  ">
        <li>
          Skill:
          <span className="break-words leading-6 text-blue-400">{props.skill}</span>
        </li>
        <li>
          Responsible:
          <ul className=" mt-1 list-inside list-disc space-y-1 leading-6 transition  delay-150 duration-300 ease-in-out lg:hover:scale-110">
            {props.responsible.map((item) => (
              <li className="font-light text-gray-400">
                {item.content}{' '}
                <a target="blank" className=" font-semibold text-blue-800" href={item.link}>
                  {item.link !== `` && '(Link)'}
                </a>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};
export default Employment;
