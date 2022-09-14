/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import { Spacer } from '../../components';
//import 'react-image-picker/dist/index.css';

import dlExcel from '../../assets/dlExcel.svg';

import * as XLSX from 'xlsx';

import styles from './styles.module.scss';
import { useProject, useWallet } from '../../contexts';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProgressBar } from '../../components';

import useQuery from '../../hooks/QueryHook';
import { BatchNftDossier, NftDossier, ProjectToken } from '../../interfaces';
import MetadataRow from '../../components/MetadataRow';
import ImageRow from '../../components/ImageRow';
import Project, { Participant } from '../../interfaces/Project';
import CUSpinner from '../../components/CUSpinner';
import { participantToExtensions } from '../../utils/helpers';
import { useScrollbarWidth } from '../../hooks/ScroolbarWidthHook';
import Layout from '../../components/Layout';
import ConnectBanner from '../../components/ConnectBanner';
import ReviewViewer from '../../components/ReviewViewer';

export default function ProjectReview() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts } = useWallet();

  const location = useLocation();
  const { projectid } = useParams();
  const navigate = useNavigate();

  const pid = location.state?.projectId || projectid;

  useEffect(() => {
    console.log('Passed State', location.state);
    if (!pid) {
      navigate('/issuers');
      return;
    }
  }, []);

  const backHandler = () => {
    navigate(-1);
  };

  function BackButton() {
    return (
      <div
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        onClick={backHandler ? () => backHandler() : undefined}
        onKeyDown={
          backHandler
            ? (e) => {
                if (e.key === 'Enter') backHandler();
              }
            : undefined
        }
        className="d-flex align-items-center"
      >
        <span className={styles.backArrow}>🠔</span>
        <span className={styles.backFont}>Go Back</span>
      </div>
    );
  }

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>Project Review</span>
            </Row>
          </Container>
          <Spacer height={50} />

          <ConnectBanner issuer={true} />

          <Spacer height={150} />
        </Layout>
      </>
    );

  return (
    <>
      <Layout>
        <Spacer height={100} />
        <Container>
          <Row>
            <span className={styles.aboutTitle}>Project Review</span>
          </Row>
        </Container>
        <ProgressBar step={3} />
        <Spacer height={50} />
        <Container>
          {!!backHandler && <BackButton />}
          <div style={{ height: '3vh' }} />
        </Container>
        <ReviewViewer pid={pid} meta={true} />
      </Layout>
    </>
  );
}
