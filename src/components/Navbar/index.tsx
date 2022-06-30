import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from '../CUButton';
import KeplrButton from '../KeplrButton';

import styles from './styles.module.scss';
import { Link } from 'react-router-dom';
//import logo from '../../assets/certup-logo.svg';
import logo from '../../assets/certup-logo-small.png';
import Web3AuthButton from '../Web3AuthButton';

export default function CertUpNavbar() {
  return (
    <>
      <Navbar className={styles.navbarContainer}>
        <Container>
          <Link to="/">
            <Navbar.Brand>
              <Image
                src={logo}
                fluid={true}
                // width="158"
                // height="62"
                style={{ height: '80px' }}
                className="d-inline-block align-top"
                alt="CertUP Logo"
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
                <Link to="/issuers">
                  <Navbar.Text className={styles.navItem}>For Issuers</Navbar.Text>
                </Link>
                <Link to="/access">
                  <Navbar.Text className={styles.navItem}>Access Certificate</Navbar.Text>
                </Link>
                <Link to="/clients">
                  <Navbar.Text className={styles.navItem}>Clients</Navbar.Text>
                </Link>
              </Navbar.Collapse>

              <Navbar.Text>
                <KeplrButton />
                {/* <Web3AuthButton /> */}
              </Navbar.Text>
            </>
          ) : null}
        </Container>
      </Navbar>
      {process.env.REACT_APP_CHAIN_ID?.includes('pulsar' || 'secretdev') ? (
        <div className="text-center">
          <b>Chain ID: </b> {process.env.REACT_APP_CHAIN_ID} &nbsp;&nbsp;&nbsp;&nbsp;
          <b>gRPC: </b> {process.env.REACT_APP_GRPC_URL} &nbsp;&nbsp;&nbsp;&nbsp;
          <b>Contract: </b> {process.env.REACT_APP_CONTRACT_ADDR} &nbsp;&nbsp;&nbsp;&nbsp;
          <b>Backend: </b> {process.env.REACT_APP_BACKEND}
        </div>
      ) : null}
    </>
  );
}
