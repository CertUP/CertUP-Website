import { ReactElement, ReactNode } from 'react';
import { useItem } from '../../contexts';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CUButton from '../CUButton';
// import cn from 'classnames';
import styles from './styles.module.scss';
import CertUpNavbar from '../Navbar';
import Footer from '../Footer';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props): ReactElement {
  return (
    <>
      <CertUpNavbar />
      {children}
      <Footer />
    </>
  );
}
