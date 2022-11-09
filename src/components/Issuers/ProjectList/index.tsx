/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ConnectBanner from '../../ConnectBanner';
import { Spacer } from '../..';
import axios from 'axios';
import { useWallet } from '../../../contexts/WalletContext';

import styles from './styles.module.scss';
import ProjectTile from '../ProjectTile';
import Project from '../../../interfaces/Project';
import CUButton from '../../CUButton';
import { useProject } from '../../../contexts/ProjectContext';
import { Link } from 'react-router-dom';
import { RestrictedAccess } from '../../RestrictedAccess';
import CUSpinner from '../../CUSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useIssuer } from '../../../contexts/IssuerContext';

interface Props {
  setProjectIdForm: (projectId?: string) => void;
  setProjectIdReview: (projectId?: string) => void;
}

export default function ProjectList({ setProjectIdForm, setProjectIdReview }: Props) {
  //const { Client, ClientIsSigner, Wallet, Address, LoginToken } = useWallet();
  const { PendingProjects, LoadingPendingProjects, refreshPendingProjects } = useProject();
  const { VerifiedIssuer, LoadingRemainingCerts, refreshIssuer } = useIssuer();

  //refresh credits on mount if they are nto verified (to see if they became verified)
  useEffect(() => {
    if (!VerifiedIssuer) refreshIssuer();
  }, []);

  if (!LoadingRemainingCerts && !VerifiedIssuer)
    return (
      <>
        <Container>
          <Row className="justify-content-center">
            <span className={styles.aboutTitle}>For Issuers</span>

            <Col xs={'auto'}>
              <CUButton onClick={() => setProjectIdForm()} disabled={true}>
                New Certificate
              </CUButton>
            </Col>
          </Row>
        </Container>

        <Spacer height={50} />

        <RestrictedAccess />
      </>
    );

  return (
    <>
      <Container>
        <Row className="justify-content-center">
          <span className={styles.aboutTitle}>Issue Certificate</span>

          <Col xs={'auto'}>
            <CUButton onClick={() => setProjectIdForm()} disabled={LoadingRemainingCerts}>
              New Certificate
            </CUButton>
          </Col>
        </Row>
      </Container>

      <Spacer height={50} />

      <Container>
        <h3 className={styles.certsLabel}>Your Certificates</h3>
        {LoadingPendingProjects || LoadingRemainingCerts ? (
          <Row className="mx-4 px-4 my-4">
            <CUSpinner size="lg" />
          </Row>
        ) : PendingProjects.length ? (
          <Row className="">
            {PendingProjects.map((p, i) => (
              <ProjectTile
                projectIn={p}
                setProjectIdForm={setProjectIdForm}
                setProjectIdReview={setProjectIdReview}
                key={`project-list-${i}`}
              />
            ))}
          </Row>
        ) : (
          <>
            <span className={styles.certStatus}>You dont have any certificate projets yet.</span>
            <h5
              style={{ cursor: 'pointer', marginLeft: '1rem', color: '#888888' }}
              onClick={refreshPendingProjects}
            >
              <FontAwesomeIcon icon={faRefresh} /> Refresh Projects{' '}
            </h5>
          </>
        )}
      </Container>
    </>
  );
}
