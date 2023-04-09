import * as React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  backgroundColor?: string;
}
const Input: React.FC<Props> = (props: Props) => {
  return (
    <div className={`flex flex-col ` + props.className}>
      {props.label != undefined && <span className="flex">{props.label}</span>}
      <input
        {...props}
        data-testid="add-word-input"
        style={{ backgroundColor: props.backgroundColor }}
        className={`w-auto rounded-md border-2
            border-solid border-opacity-50 bg-black
          px-2 pt-5 pb-4 text-sm
           leading-4  
           tracking-wide text-white outline-none placeholder:opacity-30
           focus:border-orange-400
            focus:opacity-100
          ${props.inputClassName}`}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        autoFocus={props.autoFocus}
        onChange={props.onChange}
      />
    </div>
  );
};
Input.defaultProps = { autoFocus: false };

export default Input;
