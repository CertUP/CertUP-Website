import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Image, { ImageProps } from 'react-bootstrap/Image';
import { arrayBufferToDataURI, /*decryptFile,*/ ipfsDownload } from '../../utils/fileHelper';

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
    console.log('Key', decryptionKey);
    setLoading(true);
    setStatus('Downloading...');
    let result = await ipfsDownload(url);
    // if (decryptionKey) {
    //   setStatus('Decrypting...');
    //   result = decryptFile(result, decryptionKey);
    // }
    setStatus('Processing...');
    result = arrayBufferToDataURI(result, 'image/png');
    setSrc(result);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <Image src={src} {...rest} />

      <div className={styles.centered}>
        {loading ? (
          <>
            <Spinner animation="border" variant="info" />
            <span>{status}</span>
          </>
        ) : null}
        {!loading && !src ? <span>Failed to Load Image</span> : null}
      </div>
    </div>
  );
}
