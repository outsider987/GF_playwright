import React from 'react';
import clsx from 'clsx';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children?: React.ReactNode;
    rounded?: boolean;
    white?: boolean;
}

const Button: React.FC<Props> = (props) => {
    const { rounded: isRounded = false, white: isWhite = false, className } = props;
    const whiteClass = clsx('bg-white', 'text-[#121212]', 'hover:bg-[#121212]', 'hover:text-white');
    const darkClass = clsx('bg-[#121212]', 'text-white', 'hover:bg-white', 'hover:text-[#121212]');

    const buttonClass = clsx(
        'flex',
        'items-center',
        'justify-center',
        'border',
        'border-solid',
        'border-black',
        'py-[0.8125rem]',
        'px-[0.625rem]',
        'font-bold',
        'leading-[100%]',
        isRounded ? 'rounded-full' : 'rounded',
        isWhite ? whiteClass : darkClass,
    );

    return (
        <button {...props} data-testid="btn" className={buttonClass + props.className}>
            {props.children}
        </button>
    );
};
Button.defaultProps = { rounded: false, white: true };
export default Button;
