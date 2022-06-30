import React, { ReactElement, ReactNode } from 'react';
import { useItem } from '../../contexts';
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

export const MiniCircle: React.FC<ButtonProps> = (props) => {
  const { highlighted, ...rest } = props;

  // return (
  //     <button {...rest}>{children}</button>
  // )
  if (highlighted)
    return (
      <button
        {...rest}
        className={`${styles.certupGradient} ${styles.stepButton} ${styles.unclickable} ${styles.highlight}`}
      >
        {null}
      </button>
    );
  else
    return (
      <button
        {...rest}
        className={`${styles.certupGradient} ${styles.stepButton} ${styles.unclickable}`}
      >
        {null}
      </button>
    );
};

export default MiniCircle;
