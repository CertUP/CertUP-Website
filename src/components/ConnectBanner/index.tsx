import { ReactElement, ReactNode } from 'react';
import { useItem } from '../../contexts';
import KeplrButton from '../KeplrButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
// import cn from 'classnames';
import styles from './styles.module.scss';

interface Props {
  text?: string;
}

export default function ConnectBanner({ text }: Props) {
  return (
    <Container fluid={true} className={styles.bannerContainer}>
      <Container>
        <Row>
          <span className={styles.bannerTitle}>Connect to Keplr</span>
        </Row>
        <Row>
          <span className={styles.bannerSubtitle}>
            {text || 'Connect a wallet to use this function.'}
          </span>
        </Row>
        <Col xs={'auto'}>
          <Row>
            <Col xs={'auto'} className="text-end">
              <KeplrButton />
              <div className="mt-1">
                <a
                  href="https://keplr.app"
                  className={`${styles.bannerLink}`}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  Get Keplr Wallet →
                </a>
              </div>
            </Col>
          </Row>
        </Col>
      </Container>
    </Container>
  );
}
