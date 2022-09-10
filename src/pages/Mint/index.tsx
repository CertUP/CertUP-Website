/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import { useProject, useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import ProjectList from '../../components/ProjectList';
import { useEffect, useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import Project, {
  CertInfo,
  Participant,
  ProjectToCertList,
  RenderProps,
} from '../../interfaces/Project';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Tx } from 'secretjs';
import { toast } from 'react-toastify';
import StepNumber from '../../components/StepNumber';
import { ProgressBar } from '../../components';
import Table from 'react-bootstrap/Table';
import { GenerateInput, generateMultiple } from '../../utils/backendHelper';
import { SuccessToast, ToastProps } from '../../utils/toastHelper';
import * as XLSX from 'xlsx';
import useExecute from '../../hooks/ExecuteHook';
import { CertupExtension } from '../../interfaces/token';
import CUSpinner from '../../components/CUSpinner';
import { participantsToWorksheet, participantToExtensions } from '../../utils/helpers';
import ProjectReview from '../ProjectReview';
import ReviewViewer from '../../components/ReviewViewer';

//@ts-ignore
import textEncoding from 'text-encoding';
// const textEncoding = require('text-encoding');
const TextDecoder = textEncoding.TextDecoder;

interface ButtonProps {
  backHandler: () => void;
}
function BackButton({ backHandler }: ButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={() => backHandler()}
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

const generate = async (projectInput: Project): Promise<string[]> => {
  const inputs = ProjectToCertList(projectInput);

  const hashes = await generateMultiple({ id: '2', input: inputs, upload: true });
  // hashes.map((e: string) => console.log(`https://ipfs.trivium.network/ipfs/${e}`));
  //setHashes(hashes);
  return hashes;
};

export default function Mint() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, ProcessingTx } = useWallet();
  const { findProject, LoadingPendingProjects, PendingProjects, refreshPendingProjects } =
    useProject();
  const { preloadCerts } = useExecute();

  const [project, setProject] = useState<Project>();
  const [imageHashes, setImageHashes] = useState<string[]>([]);
  const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);
  const [loadingPreload, setLoadingPreload] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [txHash, setTxHash] = useState<string>();

  const navigate = useNavigate();
  const location = useLocation();

  // Ensure Project ID is available
  useEffect(() => {
    console.log('Passed State', location.state);
    if (!location.state?.projectId) {
      navigate('/issuers');
      return;
    }
  }, []);

  useEffect(() => {
    if (LoadingPendingProjects || !PendingProjects.length) return;
    refreshProjectInfo();
  }, [LoadingPendingProjects]);

  const refreshProjectInfo = () => {
    // TODO check for empty project fields
    const foundProject = findProject(location.state?.projectId);
    if (!foundProject) {
      toast.error("Didn't find a project to mint, please try again.");
    }
    setProject(foundProject);
  };

  const handleCancel = () => {
    navigate('/issuers', {
      replace: true,
      state: { projectId: location.state?.projectId, show: true },
    });
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!project) throw new Error('Project Data Not Found');
    if (!project._id) throw new Error('Project ID Not Found'); // todo handle this better (save and get ID)
    if (!project.certInfo.issue_date) throw new Error('Project must have an issue date.');

    setLoadingGenerate(true);

    const toastRef = toast.loading('Generating Certificate Images...');
    let hashes: string[];
    if (imageHashes.length) hashes = imageHashes;
    else {
      hashes = await generate(project);
      setImageHashes(hashes);
      console.log('dklvbnmjkldfbndfjkn', hashes);
    }
    setLoadingGenerate(false);
    toast.update(toastRef, SuccessToast);
  };

  const handlePreload = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    try {
      if (!project) throw new Error('Project Data Not Found');
      if (!project._id) throw new Error('Project ID Not Found'); // todo handle this better (save and get ID)
      if (!imageHashes.length) throw new Error('Images Not Generated');

      setLoadingPreload(true);
      const toastRef = toast.loading('Processing Transaction...');
      //toast.update(toastRef, { render: 'Processing Transaction...' });
      let result;
      try {
        const newData = project?.participants.map((participant, i) => {
          // const pubMeta: CertupExtension = {
          //   certificate: { cert_number: participant.cert_num },
          //   description: project.certInfo.pub_description,
          //   protected_attributes: [],
          // };

          // const privMeta: CertupExtension = {
          //   description: project.certInfo.priv_description,
          //   certificate: {
          //     name: project.certInfo.cert_name,
          //     cert_type: project.renderProps.certTitle,
          //     issue_date: project.certInfo?.issue_date.toISOString() as string,
          //     cert_number: participant.cert_num,
          //   },
          //   certified_individual: {
          //     first_name: participant.name,
          //     last_name: participant.surname,
          //     date_of_birth: participant.dob?.toISOString(),
          //   },
          //   issuing_organizations: [
          //     {
          //       name: project.renderProps.companyName,
          //       //url: 'https://cfi.org',
          //     },
          //   ],
          //   issuing_individuals: [
          //     {
          //       name: project.renderProps.signer,
          //       company: project.renderProps.companyName,
          //       title: project.renderProps.signerTitle,
          //     },
          //   ],
          //   // inclusions: [
          //   //   {
          //   //     type: 'Course',
          //   //     name: 'Introduction to Finance',
          //   //     value: '89.4',
          //   //   },
          //   //   {
          //   //     type: 'Instructor',
          //   //     name: 'Jane Smith',
          //   //   },
          //   // ],
          //   attributes: [
          //     {
          //       trait_type: 'Certificate Number',
          //       value: participant.cert_num,
          //     },
          //     {
          //       trait_type: 'Certificate Name',
          //       value: project.certInfo.cert_name,
          //     },
          //     {
          //       trait_type: 'Issue Date',
          //       value: project.certInfo.issue_date.toDateString(),
          //     },
          //   ],
          //   media: [
          //     {
          //       file_type: 'image/png',
          //       extension: 'png',
          //       // authentication: {
          //       //   key: 'TO DO',
          //       // },
          //       url: `https://ipfs.io/ipfs/${hashes[i]}`,
          //     },
          //   ],
          //   protected_attributes: [],
          // };
          const { pubMeta, privMeta } = participantToExtensions(
            participant,
            imageHashes[i],
            project.certInfo,
            project.renderProps,
          );

          return {
            name: `${participant.name} ${participant.surname}`,
            date: project.certInfo.issue_date?.toLocaleDateString(),
            cert_type: project.renderProps.certTitle,
            pub_metadata: { extension: pubMeta },
            priv_metadata: { extension: privMeta },
          };
        });

        result = await preloadCerts({
          data: newData,
          toast: toastRef,
          project_id: project._id,
        });

        //toast.update(toastRef, SuccessToast);
      } catch (error: any) {
        console.error(error);
        setLoadingPreload(false);
        //toast.update(toastRef, new ToastProps(error.toString(), 'error'));
      }

      console.log('TX Result', result);
      if (!result) {
        setLoadingPreload(false);
        return;
      }

      setTxHash(result.transactionHash);

      const resultData = new TextDecoder('utf8').decode(result.data[0]);
      const resultData2 = resultData.replace(/[^\x00-\x7F]/g, '');
      const resultData3 = resultData2.substring(resultData2.indexOf('{'));
      const resultJSON = JSON.parse(resultData3);

      const keys = resultJSON.pre_load.keys;

      // const wasmLogs =
      //   //@ts-ignore
      //   result.jsonLog[0].events.find((element) => element.type === 'wasm').attributes || [];
      // console.log('WASM Logs', wasmLogs);

      const newParticipants = [...project.participants];

      for (let i = 0; i < newParticipants.length; i++) {
        const participant = newParticipants[i];

        //@ts-ignore
        // const claimCode = wasmLogs
        //   .find((element: any) =>
        //     element.key.includes(`${participant.name} ${participant.surname}`),
        //   )
        //   .value.trim();
        const claimCode = keys
          .find((key: any) => key.name.includes(`${participant.name} ${participant.surname}`))
          .value.trim();

        participant.claim_code = claimCode;
      }

      console.log(newParticipants);

      const newProject = new Project({
        ...project,
        participants: newParticipants,
      });
      setProject(newProject);
      setLoaded(true);
      setLoadingPreload(false);
    } catch (error: any) {
      toast.error(error.toString());
    }
    setLoadingPreload(false);
  };

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>Share</span>
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
            <span className={styles.aboutTitle}>Share</span>
          </Row>
        </Container>
        <ProgressBar step={3} />

        <Spacer height={50} />
        <Container>
          <BackButton backHandler={handleCancel} />
          <Row className="justify-content-space-between mx-4 mt-4" style={{ marginBottom: '25px' }}>
            <Col className={`${styles.stepColumnLeft} ${styles.stepColumn}`}>
              <Row className="align-items-center mb-2">
                <Col xs="auto" className="px-0">
                  <h4
                    className={!imageHashes.length ? styles.activeStep : undefined}
                    style={{ display: 'inline-block', marginBottom: 0 }}
                  >
                    Step 1
                  </h4>
                </Col>
                {loadingGenerate && (
                  <Col xs="auto">
                    <CUSpinner size="custom" customSize={35} />
                  </Col>
                )}
              </Row>
              <Row>
                <p>
                  Generate certificate images. This process may take several minutes for projects
                  with a large number of participants.
                </p>
              </Row>
              <Row className="justify-content-end">
                <Col xs={'auto'} className="mx-4">
                  <button
                    className={
                      loadingGenerate
                        ? `${styles.processingButton} ${styles.cancelBtn}`
                        : styles.cancelBtn
                    }
                    onClick={handleGenerate}
                    disabled={loadingGenerate || !!imageHashes.length || !project}
                  >
                    {loadingGenerate ? (
                      <>Processing</>
                    ) : imageHashes.length ? (
                      'Complete'
                    ) : (
                      'Generate'
                    )}
                  </button>
                  {loaded && (
                    <>
                      <br />
                      <br />
                    </>
                  )}
                </Col>
              </Row>
            </Col>
            <Col className={`${styles.stepColumn} justify-content-start`}>
              <Row className="align-items-center mb-3">
                <Col xs="auto" className="px-0">
                  <h4 style={{ display: 'inline-block', marginBottom: 0 }}>Step 2</h4>
                </Col>
              </Row>
              <Row>
                <p>
                  Review the final certificates and images below for accuracy. Go back and make any
                  changes if needed.{' '}
                </p>
              </Row>
            </Col>
            <Col className={`${styles.stepColumnRight} ${styles.stepColumn}`}>
              <Row className="align-items-center mb-2">
                <Col xs="auto" className="px-0">
                  <h4
                    className={imageHashes.length && !loaded ? styles.activeStep : undefined}
                    style={{ display: 'inline-block', marginBottom: 0 }}
                  >
                    Step 3
                  </h4>
                </Col>
                {loadingPreload && (
                  <Col xs="auto">
                    <CUSpinner size="custom" customSize={35} />
                  </Col>
                )}
              </Row>
              <Row>
                <p>
                  Complete the project and generate claim codes by uploading the certificate
                  information to the blockchain.
                </p>
              </Row>
              <Row className="justify-content-end">
                <Col xs={'auto'} className="mx-4">
                  {loaded ? (
                    <>
                      <button className={styles.cancelBtn} disabled={true}>
                        Complete
                      </button>
                      <br />
                      <a
                        href={`${process.env.REACT_APP_EXPLORER_URL}${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Transaction →
                      </a>
                    </>
                  ) : (
                    <button
                      className={
                        loadingPreload
                          ? `${styles.processingButton} ${styles.cancelBtn}`
                          : styles.cancelBtn
                      }
                      onClick={handlePreload}
                      disabled={ProcessingTx || loadingPreload || !imageHashes.length}
                    >
                      {loadingPreload ? 'Processing' : 'Finish'}
                    </button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <hr />

          {/* <Row>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Cert #</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>DOB</th>
                  <th>Claim Code</th>
                </tr>
              </thead>
              <tbody>
                {project?.participants.map((participant: Participant, index: number) => {
                  return (
                    <tr key={`claim-row-${index}-${participant.cert_num}`}>
                      <td>{participant.cert_num}</td>
                      <td>{participant.name}</td>
                      <td>{participant.surname}</td>
                      <td>{participant.dob?.toLocaleDateString()}</td>
                      <td>
                        {participant.claim_code ? participant.claim_code : 'Not Yet Generated'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Row>
          {generated ? (
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
          ) : null} */}
        </Container>
        <ReviewViewer
          pid={location.state?.projectId}
          step={loaded ? 'preloaded' : 'preload'}
          pData={project}
          hashes={imageHashes}
        />
      </Layout>
    </>
  );
}
