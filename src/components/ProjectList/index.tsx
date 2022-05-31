import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ConnectBanner from '../ConnectBanner';
import { Spacer } from '../../components';

import styles from './styles.module.scss';

export default function ProjectList() {
  return (
    <>
      <Container>
        <Row className="justify-content-center">
          <span className={styles.aboutTitle}>For Issuers</span>

          <Col xs={'auto'}>
            <Button>New Certificate</Button>
          </Col>
        </Row>
      </Container>

      <Spacer height={50} />

      <Container>
        <h3 className={styles.certsLabel}>Your Certificates</h3>
        <span className={styles.certStatus}>You dont have any certificate projets yet.</span>
      </Container>
    </>
  );
}
