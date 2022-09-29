import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import { toast } from 'react-toastify';
import { useWallet, useProject } from '../../contexts';
import useQuery from '../../hooks/QueryHook';
import { useScrollbarWidth } from '../../hooks/ScroolbarWidthHook';
import CUSpinner from '../CUSpinner';
import ImageRow from '../ImageRow';
import MetadataRow from '../MetadataRow';
import dlExcel from '../../assets/dlExcel.svg';
import Project, {
  CertInfo,
  Participant,
  ProjectToCertList,
  RenderProps,
} from '../../interfaces/Project';

import { participantsToWorksheet, projectToPreload } from '../../utils/helpers';

import styles from './styles.module.scss';
import { UploadResponse } from '../../pages/Mint';
import IssuerInfo from '../IssuerInfo';
import { Link } from 'react-router-dom';
import { NftDossier, BatchNftDossier } from '../../interfaces/721';
import { MintOverview, ProjectToken } from '../../interfaces/manager';
import CopyButton from '../CopyButton';

interface ViewerProps {
  pid: string;
  step?: string;
  hashes?: UploadResponse[];
  pData?: Project;
  meta?: boolean;
}

const claimUrl = `${window.location.protocol}//${window.location.host}/access/`;

export default function ReviewViewer({ pid, step, hashes, pData, meta = false }: ViewerProps) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts, IssuerProfile } =
    useWallet();
  const scrollBarWidth = useScrollbarWidth();
  const {
    findProject,
    findMintedProject,
    LoadingPendingProjects,
    refreshPendingProjects,
    PendingProjects,
    MintedProjects,
    LoadingMintedProjects,
  } = useProject();
  const { queryProjectData } = useQuery();

  // data from completed project queries
  const [mintOverview, setMintOverview] = useState<MintOverview>();
  const [mintedInfo, setMintedInfo] = useState<ProjectToken[]>([]);

  // data from uncompleted project
  const [projectInfo, setProjectInfo] = useState<Project>();

  const [selectedDossier, setSelectedDossier] = useState<NftDossier>();
  const [selectedParticipant, setSelectedParticipant] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (LoadingPendingProjects || LoadingMintedProjects) return;
    refreshProjectInfo();
  }, [pid, PendingProjects, MintedProjects, hashes, pData]);

  useEffect(() => {
    if (meta) document.title = `CertUP Project Review - ${projectInfo?.project_name}`;
  }, [projectInfo]);

  //   useEffect(() => {
  //     if (!LoginToken) return;
  //     refreshPendingProjects();
  //   }, [LoginToken, Address]);

  // Build dossier from data when selected participant changes
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
    participantsToWorksheet(projectParticipants, projectInfo?.project_name || 'CertUP Project');
  };

  const refreshProjectInfo = async () => {
    if (!pid) {
      return;
    }
    setLoading(true);
    let projectData: Project | undefined;
    if (pData) projectData = pData;
    else projectData = findProject(pid);
    if (!projectData) throw new Error('Couldnt find project data.');

    setProjectInfo(projectData);
    if (step === 'preload') {
      const mintedInfo = projectToPreload(projectData, hashes);
      setMintedInfo(mintedInfo);
    } else {
      const overview = findMintedProject(pid);
      setMintOverview(overview?.project);

      const mintedInfo = await queryProjectData(pid);
      setMintedInfo(mintedInfo);
    }

    setSelectedParticipant(0);
    setLoading(false);
  };
  return (
    <>
      {loading && (
        <Container>
          <Row className="justify-content-center mb-4">
            <Col xs="auto" className="text-center">
              <CUSpinner size="lg" />
              <h3>Loading Project Details</h3>
            </Col>
          </Row>
        </Container>
      )}
      <Container>
        <Row className="mb-4">
          <Col xs="8" className="d-flex flex-column justify-content-center text-center">
            <h2>
              <span style={{ fontWeight: '700' }}>Project: </span>
              {projectInfo?.project_name}
            </h2>
            {mintOverview ? (
              <>
                <h4 className="mb-4">
                  {loading ? (
                    <CUSpinner size="xs" />
                  ) : (
                    <>
                      {mintOverview?.minted_certs} /{' '}
                      {parseInt(mintOverview?.pending_certs || '0', 10) +
                        parseInt(mintOverview?.minted_certs || '0', 10)}{' '}
                    </>
                  )}{' '}
                  certs have been claimed.
                </h4>
                <h5 style={{ display: 'inline', marginRight: '.5rem' }}>
                  Recipients can redeem their certs at:
                </h5>

                <br />
                <p className={`${styles.accessText} ${styles.certLink} mx-2`}>
                  {claimUrl}
                  <CopyButton text={claimUrl} className="mx-2" />
                </p>
              </>
            ) : (
              <h4>
                {projectInfo?.participants.length}{' '}
                {projectInfo?.participants.length === 1 ? 'Certificate' : 'Certificates'}
              </h4>
            )}
          </Col>
          <Col xs="4">
            <Row>
              <IssuerInfo
                issuerId={IssuerProfile?.id as string}
                title="Your Issuer Profile"
                horizontal={true}
              />
            </Row>
            <Row className="text-center">
              <Link to="/profile" className={styles.navLink}>
                Edit Profile
              </Link>
            </Row>
          </Col>
        </Row>
        {/* <Row style={{maxHeight: '50vh'}}> */}
        <Table
          striped
          bordered
          hover
          // responsive
          className={styles.fixed_header}
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <thead>
            <tr>
              <th style={{ width: step !== 'preload' ? '6.8%' : '10%' }}>Cert #</th>
              <th style={{ width: step !== 'preload' ? '12.8%' : '25%' }}>First Name</th>
              <th style={{ width: step !== 'preload' ? '12.8%' : '25%' }}>Last Name</th>
              <th style={{ width: step !== 'preload' ? '10%' : '20%' }}>DOB</th>
              <th style={{ width: step !== 'preload' ? '49.5%' : '20%' }}>Claim Code</th>

              {step !== 'preload' ? <th style={{ minWidth: '7%' }}>Claimed</th> : null}
              <th style={{ width: scrollBarWidth }}></th>
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
                  <td style={{ width: step !== 'preload' ? '7%' : '10%' }}>
                    {token.preload_data.pub_metadata?.extension?.certificate?.cert_number ||
                      token.preload_data.priv_metadata.extension.certificate.cert_number}
                  </td>
                  <td style={{ width: step !== 'preload' ? '13%' : '25%' }}>
                    {token.preload_data.priv_metadata.extension.certified_individual?.first_name}
                  </td>
                  <td style={{ width: step !== 'preload' ? '13%' : '25%' }}>
                    {token.preload_data.priv_metadata.extension.certified_individual?.last_name}
                  </td>
                  <td style={{ width: step !== 'preload' ? '10%' : '20%' }}>
                    {token.preload_data.priv_metadata.extension.certified_individual?.date_of_birth
                      ? new Date(
                          token.preload_data.priv_metadata.extension.certified_individual?.date_of_birth,
                        ).toLocaleDateString()
                      : null}
                  </td>
                  <td style={{ width: step !== 'preload' ? '50%' : '20%', wordWrap: 'break-word' }}>
                    {token.claim_code}
                  </td>

                  {step !== 'preload' ? (
                    loading ? (
                      <td style={{ width: '7%' }} className="text-center">
                        <CUSpinner size="xs" />
                      </td>
                    ) : token.minted ? (
                      <td style={{ color: 'green', width: '7%' }}>True</td>
                    ) : (
                      <td style={{ width: '7%' }}>False</td>
                    )
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </Table>
        {/* </Row> */}
        {selectedDossier && (
          <>
            {step !== 'preload' && (
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
            )}
            {(step !== 'preload' || !!hashes?.length) && (
              <ImageRow cert={selectedDossier} noTitle={true} />
            )}
            <MetadataRow cert={selectedDossier} />
          </>
        )}
      </Container>
      ;
    </>
  );
}
