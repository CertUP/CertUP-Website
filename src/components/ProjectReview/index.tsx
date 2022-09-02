/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useMemo, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import { Spacer } from '../../components';
import DatePicker from 'react-datepicker';
import ImagePicker, { PickImage } from '../ImagePicker';
//import 'react-image-picker/dist/index.css';

import dlExcel from '../../assets/dlExcel.svg';

import * as XLSX from 'xlsx';
import PreloadImage from '../PreloadImage';

import styles from './styles.module.scss';
import 'react-datepicker/dist/react-datepicker.css';
import trashImg from '../../assets/trash-2.svg';
import CUButton from '../CUButton';
import { useRef } from 'react';
import axios from 'axios';
import { useProject, useWallet } from '../../contexts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components';
import StepNumber from '../StepNumber';
import MiniCircle from '../MiniCircle';
import ImageDropzone from '../ImageDropzone';
import { generateImage, GenerateInput, generateWithWait } from '../../utils/backendHelper';
import { fileToDataURI } from '../../utils/fileHelper';
import { Spinner } from 'react-bootstrap';

import bg1 from '../../assets/bg1-thumb.jpg';
import bg2 from '../../assets/bg2-thumb.jpg';
import bg3 from '../../assets/bg3-thumb.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoffee,
  faTimesCircle,
  faCoins,
  faArrowRight,
  faCloudArrowUp,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import useQuery from '../../hooks/QueryHook';
import { BatchNftDossier, NftDossier, ProjectToken } from '../../interfaces';
import MetadataRow from '../MetadataRow';
import ImageRow from '../ImageRow';
import { Participant } from '../../interfaces/Project';

interface FormProps {
  pid?: string;
  step?: string;
  backHandler: () => void;
}

interface MintOverview {
  minted_certs: string;
  pending_certs: string;
}

export default function ProjectReview({ pid, step, backHandler }: FormProps) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts } = useWallet();
  const { findProject, findMintedProject } = useProject();
  const { queryProjectData } = useQuery();
  const [projectInfo, setProjectInfo] = useState(pid ? findProject(pid) : undefined);
  const [mintedInfo, setMintedInfo] = useState<ProjectToken[]>([]);
  const [mintOverview, setMintOverview] = useState<MintOverview>();
  const [selectedParticipant, setSelectedParticipant] = useState<number>(0);
  const [selectedDossier, setSelectedDossier] = useState<NftDossier>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProjectInfo();
  }, [pid]);

  useEffect(() => {
    if (!mintedInfo.length) return;
    const tempDossier: BatchNftDossier = {
      token_id: mintedInfo[selectedParticipant].claim_code,
      public_metadata: mintedInfo[selectedParticipant].preload_data.pub_metadata,
      private_metadata: mintedInfo[selectedParticipant].preload_data.priv_metadata,
      display_private_metadata_error: null,
      owner: null,
      private_metadata_is_public: false,
      token_approvals: [],
      token_code_approvals: [],
    };
    setSelectedDossier(tempDossier);
  }, [selectedParticipant, mintedInfo]);

  const refreshProjectInfo = async () => {
    if (!pid) return;
    setLoading(true);

    setProjectInfo(findProject(pid));

    const overview = findMintedProject(pid);
    setMintOverview(overview?.project);

    const mintedInfo = await queryProjectData(pid);
    console.log(mintedInfo);
    setMintedInfo(mintedInfo);
    setSelectedParticipant(0);

    setLoading(false);
  };

  const participantsToWorksheet = (participants: Participant[]) => {
    const modified = participants.map((p: Participant) => {
      return {
        name: p.name,
        surname: p.surname,
        dob: p.dob,
        cert_num: p.cert_num,
        claim_code: p.claim_code || 'Not yet Generated',
        claimed: p.claimed || 'False',
      };
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(modified);
    console.log(worksheet);
    worksheet['!cols'] = [];
    //worksheet['!cols'][0] = { hidden: true };
    worksheet['!cols'][0] = { wch: 20 };
    worksheet['!cols'][1] = { wch: 20 };
    worksheet['!cols'][2] = { wch: 15 };
    worksheet['!cols'][3] = { wch: 15 };
    worksheet['!cols'][4] = { wch: 75 };
    worksheet['!cols'][5] = { wch: 15 };
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [['Name', 'Surname', 'Date of Birth', 'Cert Number', 'Claim Code', 'Claimed']],
      { origin: 'A1' },
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Project');
    XLSX.writeFile(workbook, `CertUP Project Review - ${projectInfo?.project_name}.xlsx`);
  };

  const handleDl = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.preventDefault();
    if (!mintedInfo) {
      toast.error('Project not loaded.');
      return;
    }

    const projectParticipants: Participant[] = mintedInfo.map((item) => {
      return {
        claim_code: item.claim_code,
        minted: item.minted,
        name: item.preload_data.priv_metadata.extension.certified_individual?.first_name as string,
        surname: item.preload_data.priv_metadata.extension.certified_individual
          ?.last_name as string,
        dob: item.preload_data.priv_metadata.extension.certified_individual?.date_of_birth
          ? new Date(item.preload_data.priv_metadata.extension.certified_individual?.date_of_birth)
          : undefined,
        cert_num: item.preload_data.priv_metadata.extension.certificate.cert_number,
      };
    });
    participantsToWorksheet(projectParticipants);
  };

  const navigate = useNavigate();

  function BackButton() {
    return (
      <div
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        onClick={() => backHandler()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') backHandler();
        }}
        className="d-flex align-items-center"
      >
        <span className={styles.backArrow}>🠔</span>
        <span className={styles.backFont}>Go Back</span>
      </div>
    );
  }

  console.log(mintedInfo);

  return (
    <>
      <Container>
        <Row>
          <span className={styles.aboutTitle}>Project Review</span>
        </Row>
      </Container>
      <ProgressBar step={3} />
      <Spacer height={50} />
      <Container>
        <BackButton />
        <div style={{ height: '3vh' }} />
      </Container>
      {loading && (
        <Container>
          <Row className="justify-content-center mb-4">
            <Col xs="auto" className="text-center">
              <Spinner animation="border" variant="info" />
              <h3>Loading Project Details</h3>
            </Col>
          </Row>
        </Container>
      )}
      <Container>
        <Row className="text-center mb-4">
          <h2>
            <span style={{ fontWeight: '700' }}>Project: </span>
            {projectInfo?.project_name}
          </h2>
          <h4>
            {loading ? (
              <Spinner animation="border" variant="info" size="sm" />
            ) : (
              <>
                {mintOverview?.minted_certs} /{' '}
                {parseInt(mintOverview?.pending_certs || '0') +
                  parseInt(mintOverview?.minted_certs || '0')}{' '}
              </>
            )}{' '}
            certs have been claimed.
          </h4>
        </Row>
        {/* <Row style={{maxHeight: '50vh'}}> */}
        <Table striped bordered hover className={styles.fixed_header}>
          <thead>
            <tr>
              <th style={{ width: '6.8%' }}>Cert #</th>
              <th style={{ width: '12.8%' }}>First Name</th>
              <th style={{ width: '12.8%' }}>Last Name</th>
              <th style={{ width: '10%' }}>DOB</th>
              <th style={{ width: '50.2%' }}>Claim Code</th>
              <th style={{ width: '7%' }}>Claimed</th>
            </tr>
          </thead>
          <tbody className={styles.reviewTable}>
            {mintedInfo.map((token: ProjectToken, index: number) => {
              const selected = index === selectedParticipant ? true : false;
              return (
                <tr
                  key={`claim-row-${index}-${token.claim_code}`}
                  className={selected ? styles.selectedRow : styles.unselectedRow}
                  onClick={() => setSelectedParticipant(index)}
                >
                  <td style={{ width: '7%' }}>
                    {token.preload_data.pub_metadata?.extension?.certificate?.cert_number ||
                      token.preload_data.priv_metadata.extension.certificate.cert_number}
                  </td>
                  <td style={{ width: '13%' }}>
                    {token.preload_data.priv_metadata.extension.certified_individual?.first_name}
                  </td>
                  <td style={{ width: '13%' }}>
                    {token.preload_data.priv_metadata.extension.certified_individual?.last_name}
                  </td>
                  <td style={{ width: '10%' }}>
                    {token.preload_data.priv_metadata.extension.certified_individual?.date_of_birth
                      ? new Date(
                          token.preload_data.priv_metadata.extension.certified_individual?.date_of_birth,
                        ).toLocaleDateString()
                      : null}
                  </td>
                  <td style={{ width: '50%' }}>{token.claim_code}</td>

                  {loading ? (
                    <td style={{ width: '7%' }} className="text-center">
                      <Spinner animation="border" variant="info" size="sm" />
                    </td>
                  ) : token.minted ? (
                    <td style={{ color: 'green', width: '7%' }}>True</td>
                  ) : (
                    <td style={{ width: '7%' }}>False</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
        {/* </Row> */}
        {selectedDossier && (
          <>
            <Row className="justify-content-end">
              <Col xs={2}>
                <Image
                  src={dlExcel}
                  fluid={true}
                  style={{ cursor: 'pointer' }}
                  onClick={handleDl}
                />
              </Col>
            </Row>
            <ImageRow cert={selectedDossier} noTitle={true} />
            <MetadataRow cert={selectedDossier} />
          </>
        )}
      </Container>
    </>
  );
}
