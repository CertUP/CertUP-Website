import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, ReactNode, useState } from 'react';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { toast } from 'react-toastify';
import { sleep } from '../../utils/helpers';

import styles from './styles.module.scss';

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {
  text: string;
  text2?: string;
}

export const CopyButton: React.FC<ButtonProps> = (props) => {
  const { text, text2, className, ...rest } = props;

  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    setClicked(true);
    navigator.clipboard.writeText(text);
    toast.success(`${text2 ? `${text2} c` : 'C'}opied to clipboard.`, {
      autoClose: 1500,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
    });
    await sleep(500);
    setClicked(false);
  };
  return (
    <OverlayTrigger
      placement={'top'}
      overlay={<Tooltip id={`tooltip-copyBtn`}>Click to Copy</Tooltip>}
    >
      <button
        onClick={() => {
          handleClick();
        }}
        className={`${styles.blankButton} ${clicked ? styles.clicked : null} ${className}`}
      >
        <FontAwesomeIcon icon={faPaste} />
      </button>
    </OverlayTrigger>
  );
};

export default CopyButton;
