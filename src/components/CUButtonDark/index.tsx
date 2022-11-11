import { ReactElement, ReactNode } from 'react';
// import cn from 'classnames';
import styles from './styles.module.scss';

interface Props {
  children: ReactNode;
  disabled?: boolean;
}

// export default function CUButtonDark({ children, disabled = false }: Props): ReactElement {
//   const { Items } = useItem();
//   console.log(Items);

//   return (
//     <button disabled={disabled} className={styles.certupBtn}>
//       {children}
//     </button>
//   );
// }
