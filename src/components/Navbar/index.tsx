import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from '../CUButton';
import KeplrButton from '../KeplrButton';

import styles from './styles.module.scss';
import { Link } from 'react-router-dom';
//import logo from '../../assets/certup-logo.svg';
import logo from '../../assets/certup-logo-small.png';
import Web3AuthButton from '../Web3AuthButton';
import { Offcanvas, NavDropdown } from 'react-bootstrap';

interface NavItem {
  text: string;
  link: string;
}

const navItems: NavItem[] = [
  {
    text: 'About',
    link: '/about',
  },
  {
    text: 'Pricing',
    link: '/pricing',
  },
  {
    text: 'Issue Certificates',
    link: '/issuers',
  },
  {
    text: 'Access Certificate',
    link: '/access',
  },
];

export default function CertUpNavbar() {
  return (
    <>
      <Navbar collapseOnSelect expand="lg" className={styles.navbarContainer}>
        <Container>
          <Navbar.Brand className="d-none d-lg-block">
            <Link to="/">
              <Image
                src={logo}
                fluid={false}
                // width="158"
                // height="62"
                style={{ height: '80px', width: 'auto' }}
                className="d-inline-block align-top"
                alt="CertUP Logo"
              />
            </Link>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand`} />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand`}
            aria-labelledby={`offcanvasNavbarLabel-expand`}
            placement="start"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>
                <Link to="/">
                  <Image
                    src={logo}
                    fluid={false}
                    // width="158"
                    // height="62"
                    style={{ height: '80px', width: 'auto' }}
                    className="d-inline-block align-top"
                    alt="CertUP Logo"
                  />
                </Link>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3 mx-3">
                {navItems.map((item, index) => {
                  return (
                    <Nav.Item className={styles.offcanvasItem} key={`navmenu-item-${index}`}>
                      <Link to={item.link} className={styles.navItem}>
                        <span>{item.text}</span>
                      </Link>
                    </Nav.Item>
                  );
                })}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>

          {/* <Navbar.Collapse id="responsive-navbar-nav" className="d-none d-lg-block"> */}
          {/* <Nav className="me-auto" style={{width: '100%'}}> */}
          <div className="d-none d-lg-flex justify-content-around text-center" style={{ width: '100%' }}>
            {navItems.map((item, index) => {
              return (
                <Link to={item.link} key={`navbar-item-${index}`}>
                  <Navbar.Text className={styles.navItem}>{item.text}</Navbar.Text>
                </Link>
              );
            })}
          </div>
          <Nav>
            <Navbar.Text>
              <div>
                <KeplrButton autoConnect={true} />
              </div>
              {/* <Web3AuthButton /> */}
            </Navbar.Text>
          </Nav>
        </Container>
      </Navbar>
      {process.env.REACT_APP_CHAIN_ID?.includes('pulsar' || 'secretdev') ? (
        <div className="text-center">
          <b>Chain ID: </b> {process.env.REACT_APP_CHAIN_ID} &nbsp;&nbsp;&nbsp;&nbsp;
          <b>gRPC: </b> {process.env.REACT_APP_GRPC_URL} &nbsp;&nbsp;&nbsp;&nbsp;
          <b>Backend: </b> {process.env.REACT_APP_BACKEND}
          <br />
          <b>20: </b> {process.env.REACT_APP_SNIP20_ADDR} &nbsp;&nbsp;&nbsp;&nbsp;
          <b>721: </b> {process.env.REACT_APP_NFT_ADDR} &nbsp;&nbsp;&nbsp;&nbsp;
          {!!process.env.REACT_APP_OLD_MANAGER_ADDR && <br />}
          <b>Manager: </b> {process.env.REACT_APP_MANAGER_ADDR} &nbsp;&nbsp;&nbsp;&nbsp;
          {!!process.env.REACT_APP_OLD_MANAGER_ADDR && (
            <>
              <b>Old Manager: </b> {process.env.REACT_APP_OLD_MANAGER_ADDR} &nbsp;&nbsp;&nbsp;&nbsp;
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
