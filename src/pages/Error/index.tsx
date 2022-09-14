// import styles from "./styles.module.scss";

import { useEffect } from 'react';

export default function Error() {
  useEffect(() => {
    document.title = `CertUP`;
  }, []);

  return <div>error404</div>;
}
