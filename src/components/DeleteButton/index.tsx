import { ReactElement, ReactNode } from 'react';
// import cn from 'classnames';
import styles from './styles.module.scss';
import trashImg from '../../assets/trash-2.svg';

interface Props {
  disabled?: boolean;
}

export default function DeleteButton({ disabled = false }: Props): ReactElement {
  return (
    <div>
      <img src={trashImg} alt="trash" />
      <span>Delete</span>
    </div>
  );
}
