import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../CUButton';
import KeplrButton from '../KeplrButton';

import styles from './styles.module.scss';
import { Link } from 'react-router-dom';
import logo from '../../assets/certup-logo.svg';

export default function CertUpNavbar() {
  return (
    <Navbar className={styles.navbarContainer}>
      <Container>
        <Link to="/">
          <Navbar.Brand>
            <img
              src={logo}
              width="158"
              height="62"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            />
          </Navbar.Brand>
        </Link>

        {!parseInt(process.env.REACT_APP_HOME_ONLY as string, 10) ? (
          <>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Link to="/about">
                <Navbar.Text className={styles.navItem}>About</Navbar.Text>
              </Link>
              <Navbar.Text className={styles.navItem}>For Issuers</Navbar.Text>
              <Navbar.Text className={styles.navItem}>Access Certificate</Navbar.Text>
              <Link to="/clients">
                <Navbar.Text className={styles.navItem}>Clients</Navbar.Text>
              </Link>
            </Navbar.Collapse>

            <Navbar.Text>
              <KeplrButton />
            </Navbar.Text>
          </>
        ) : null}
      </Container>
    </Navbar>
  );
}
