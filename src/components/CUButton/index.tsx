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
  large?: boolean;
  fill?: boolean;
  btnStyle?: 'large' | 'square' | 'dark' | 'default' | 'small';
}

// enum ButtonStyle { wtf
//   'large' = 'large',
//   'square' = 'square',
//   'dark' = 'dark',
// }

// export function CUButton2({
//   children,
//   disabled = false,
//   large = true,
//   fill = false,
// }: ButtonProps): ReactElement {
//   const { Items } = useItem();
//   console.log(Items);
//   if (large)
//     return (
//       <button disabled={disabled} className={styles.certupBtn}>
//         {children}
//       </button>
//     );
//   else
//     return (
//       <button
//         disabled={disabled}
//         className={`${styles.certupBtn} ${styles.certupBtnSmall}`}
//         style={fill ? { width: '100%' } : undefined}
//       >
//         {children}
//       </button>
//     );
// }

export const CUButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { children, fill, btnStyle, style, className, ...rest } = props;
  switch (btnStyle) {
    case 'large':
      return (
        <button
          {...rest}
          className={`${styles.certupBtn} ${styles.certupButtonColor}`}
          style={fill ? { width: '100%' } : undefined}
        >
          {children}
        </button>
      );
      break;
    case 'square':
      return (
        <button
          {...rest}
          className={`${styles.certupBtn} ${styles.certupBtnSq} ${styles.certupButtonColor} ${className}`}
          style={fill ? { width: '100%' } : { width: 'auto' }}
        >
          {children}
        </button>
      );
      break;
    case 'dark':
      return (
        <button
          {...rest}
          className={`${styles.certupBtn} ${styles.certupBtnDark} ${styles.certupButtonColor}`}
          style={fill ? { ...style, width: '100%' } : style}
        >
          {children}
        </button>
      );
      break;
    case 'default':
      return (
        <button
          {...rest}
          className={`${styles.certupButtonColor} ${styles.defaultBtn}`}
          style={fill ? { ...style, width: '100%' } : style}
        >
          {children}
        </button>
      );
      break;
    default:
      return (
        <button
          {...rest}
          className={`${styles.certupBtn} ${
            btnStyle === 'small' ? styles.xsmall : styles.certupBtnSmall
          } ${styles.certupButtonColor}`}
          style={fill ? { width: '100%' } : undefined}
        >
          {children}
        </button>
      );
      break;
  }

  // if (large)
  //   return (
  //     <button {...rest} className={styles.certupBtn}>
  //       {children}
  //     </button>
  //   );
  // else
  //   return (
  //     <button
  //       {...rest}
  //       className={`${styles.certupBtn} ${styles.certupBtnSmall} ${styles.certupButtonColor}`}
  //       style={fill ? { width: '100%' } : undefined}
  //     >
  //       {children}
  //     </button>
  //   );
};

export default CUButton;
