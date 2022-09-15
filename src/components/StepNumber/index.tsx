import React, { ReactElement, ReactNode } from 'react';
// import cn from 'classnames';
import styles from './styles.module.scss';

// interface Props {
//   children: ReactNode;
//   disabled?: boolean;
//   large?: boolean;
//   fill?: boolean;
//   onClick?: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
// }

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {
  clickable?: boolean;
  highlighted?: boolean;
}

export const StepNumber: React.FC<ButtonProps> = (props) => {
  const { children, clickable, highlighted, ...rest } = props;

  // return (
  //     <button {...rest}>{children}</button>
  // )
  if (clickable)
    return (
      <button
        {...rest}
        className={`${styles.certupGradient} ${styles.stepButton} ${styles.clickable}`}
      >
        {children}
      </button>
    );
  else if (highlighted)
    return (
      <button
        {...rest}
        className={`${styles.certupGradient} ${styles.stepButton} ${styles.unclickable} ${styles.highlight}`}
      >
        {children}
      </button>
    );
  else
    return (
      <button
        {...rest}
        className={`${styles.certupGradient} ${styles.stepButton} ${styles.unclickable}`}
      >
        {children}
      </button>
    );
};

export default StepNumber;
