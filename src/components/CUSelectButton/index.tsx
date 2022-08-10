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
  selected?: boolean;
}

export const CUSelectButton: React.FC<ButtonProps> = (props) => {
  const { children, selected, ...rest } = props;

  // return (
  //     <button {...rest}>{children}</button>
  // )
  if (selected) {
    return (
      <button {...rest} className={styles.selectedBtn}>
        {children}
      </button>
    );
  } else
    return (
      <button {...rest} className={`${styles.unselectedBtn}`}>
        {children}
      </button>
    );
};

export default CUSelectButton;
