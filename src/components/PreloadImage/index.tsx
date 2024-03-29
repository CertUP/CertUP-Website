import { useEffect, useState } from 'react';

import Image, { ImageProps } from 'react-bootstrap/Image';
import {
  arrayBufferToDataURI,
  decryptFile,
  /*decryptFile,*/ ipfsDownload,
} from '../../utils/fileHelper';
import CUSpinner from '../CUSpinner';

import styles from './styles.module.scss';

export interface PreloadImageProps extends ImageProps {
  url: string;
  decryptionKey?: string;
}

export default function PreloadImage({ url, decryptionKey, ...rest }: PreloadImageProps) {
  const [src, setSrc] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!url) return;
    getImage();
  }, [url, decryptionKey]);

  const getImage = async () => {
    setLoading(true);
    setSrc(undefined);
    setStatus('Downloading...');
    try {
      let result = await ipfsDownload(url);
      if (decryptionKey) {
        setStatus('Decrypting...');
        result = decryptFile(result, decryptionKey);
      }
      setStatus('Processing...');
      result = arrayBufferToDataURI(result, 'image/png');
      setSrc(result);
    } catch (error) {
      setStatus('Failed to Download');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      {!loading && src ? (
        <a href={src} target="_blank" rel="noreferrer" data-private>
          <Image src={src} {...rest} />
        </a>
      ) : (
        <Image src={src} {...rest} data-private />
      )}

      <div className={styles.centered}>
        {loading && (
          <>
            <CUSpinner size="lg" />
            <span>{status}</span>
          </>
        )}
        {!loading && !src && <span>Failed to Load Image</span>}
      </div>
    </div>
  );
}
