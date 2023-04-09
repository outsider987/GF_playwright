import React, { CanvasHTMLAttributes, MutableRefObject, useEffect, useRef } from 'react';

export const randomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const randomColor = () => {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

let sCode = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const createCode = (captchaRef: HTMLCanvasElement) => {
  const ctx = captchaRef.getContext('2d');
  let code = '';
  ctx.clearRect(0, 0, 120, 50);
  for (let i = 0; i < 4; i++) {
    const char = sCode.split('')[randomNum(0, 57)];
    code += char;
    ctx.font = 'bold 23px 微软雅黑';
    ctx.fillStyle = '#82297B';
    ctx.textBaseline = 'middle';
    ctx.shadowOffsetX = randomNum(-3, 3);
    ctx.shadowOffsetY = randomNum(-3, 3);
    ctx.shadowBlur = randomNum(-3, 3);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    let x = (80 / 5) * (i + 1);
    let y = 39 / 2;
    let deg = randomNum(-25, 25);
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillText(char as string, 0, 0);
    ctx.rotate((-deg * Math.PI) / 180);
    ctx.translate(-x, -y);
  }
  return code;
};

interface Props extends React.DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> {
  valueRef?: MutableRefObject<string>;
}

const Recaptcha = (props: Props) => {
  const captchaRef = useRef<HTMLCanvasElement>();
  useEffect(() => {
    createCode(captchaRef.current);
  }, []);

  return (
    <canvas
      className=" cursor-pointer"
      onClick={() => (props.valueRef.current = createCode(captchaRef.current))}
      width="100"
      height="32"
      ref={captchaRef}
    />
  );
};

export default Recaptcha;
