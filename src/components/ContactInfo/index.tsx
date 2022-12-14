import Row from 'react-bootstrap/Row';
import styles from './styles.module.scss';

export default function ContactInfo() {
  return (
    <>
      <Row>
        <p className={styles.contactParagraph}>
          If you have any questions or would like to request early access, please get in touch!
        </p>
      </Row>
      <Row className="mx-4 px-4">
        <ul>
          <li>
            <span className={styles.contactTitle}>Email: </span>
            <a href="mailto:info@certup.net" className={`${styles.contactText} px-2`} target="_blank" rel="noreferrer">
              info@certup.net
            </a>
          </li>
        </ul>
      </Row>
      <Row className="mx-4 px-4">
        <ul>
          <li>
            <span className={styles.contactTitle}>Discord: </span>
            <a
              href="https://discord.gg/jNZJYBDcZQ"
              target="_blank"
              rel="noreferrer"
              className={`${styles.contactText} px-2`}
            >
              https://discord.gg/jNZJYBDcZQ
            </a>{' '}
          </li>
        </ul>
      </Row>
    </>
  );
}
