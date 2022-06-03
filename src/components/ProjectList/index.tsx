import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ConnectBanner from '../ConnectBanner';
import { Spacer } from '../../components';
import axios from 'axios';
import { useWallet } from '../../contexts/WalletContext';
import Spinner from 'react-bootstrap/Spinner';

import styles from './styles.module.scss';
import ProjectTile from '../ProjectTile';
import { Project } from '../../interfaces';

interface Props {
  setProject: (project: Project) => void;
}

export default function ProjectList({ setProject }: Props) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken } = useWallet();

  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects();
  }, [Address]);

  const getProjects = async () => {
    console.log('running', LoginToken, Address);
    const token = `Permit ${JSON.stringify(LoginToken)}`;
    const url = new URL(`/projects/owner/${Address}`, process.env.REACT_APP_BACKEND);
    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: token,
      },
    });
    console.log(response);
    setProjects(response.data.data);
    setLoading(false);
  };

  return (
    <>
      <Container>
        <Row className="justify-content-center">
          <span className={styles.aboutTitle}>For Issuers</span>

          <Col xs={'auto'}>
            <Button onClick={() => setProject(new Project())}>New Certificate</Button>
          </Col>
        </Row>
      </Container>

      <Spacer height={50} />

      <Container>
        <h3 className={styles.certsLabel}>Your Certificates</h3>
        {loading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : projects.length ? (
          <Row>
            {projects.map((p, i) => (
              <ProjectTile projectIn={p} setProject={setProject} key={`project-list-${i}`} />
            ))}
          </Row>
        ) : (
          <span className={styles.certStatus}>You dont have any certificate projets yet.</span>
        )}
      </Container>
    </>
  );
}
