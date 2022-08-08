import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import styles from './styles.module.scss';

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {
  test?: string;
}

export function ModalButton({ onClick, children }: ButtonProps) {
  return (
    <Button onClick={onClick} className={styles.modalButton}>
      {children}
    </Button>
  );
}
