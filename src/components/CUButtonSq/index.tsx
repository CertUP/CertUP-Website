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
  large?: boolean;
  fill?: boolean;
}

export const CUButtonSq: React.FC<ButtonProps> = (props) => {
  const { children, large, fill, ...rest } = props;

  // return (
  //     <button {...rest}>{children}</button>
  // )
  if (large)
    return (
      <button {...rest} className={styles.sqButton}>
        {children}
      </button>
    );
  else
    return (
      <button
        {...rest}
        className={`${styles.certupBtn} ${styles.sqButton}`}
        //style={fill ? { width: '100%' } : undefined}
      >
        {children}
      </button>
    );
};

export default CUButtonSq;
