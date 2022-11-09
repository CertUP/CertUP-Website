import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image';
import { useWallet } from '../../../contexts';
import { getTemplatePreview } from '../../../utils/backendHelper';
// import cn from 'classnames';
import styles from './styles.module.scss';

interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {
  selected?: boolean;
  templateId: string;
}

const TemplateSelectButton: React.FC<ButtonProps> = (props) => {
  const { children, selected, templateId, ...rest } = props;
  const { LoginToken } = useWallet();
  const [imageData, setImageData] = useState<any>();

  useEffect(() => {
    updateImage();
  }, [templateId, LoginToken]);

  const updateImage = async () => {
    if (!LoginToken) return;
    const preview = await getTemplatePreview(LoginToken, templateId);
    setImageData(preview);
  };

  return (
    <button
      {...rest}
      className={`${styles.templateBtn} ${selected ? styles.selectedBtn : styles.unselectedBtn}`}
      disabled={selected}
    >
      {!!imageData && (
        <div className={styles.imgContainer}>
          <Image src={imageData} className={styles.previewImg} />
        </div>
      )}
      <div className={styles.labelContainer}>{children}</div>
    </button>
  );
};

export default TemplateSelectButton;
