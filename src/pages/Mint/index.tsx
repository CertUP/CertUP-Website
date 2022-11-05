/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styles from './styles.module.scss';
import { useProject, useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import { useEffect, useState } from 'react';
import Project, { ProjectToCertList } from '../../interfaces/Project';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProgressBar } from '../../components';
import { generateMultiple } from '../../utils/backendHelper';
import { SuccessToast, ToastProps } from '../../utils/toastHelper';
import useExecute from '../../hooks/ExecuteHook';
import CUSpinner from '../../components/CUSpinner';
import { participantToExtensions } from '../../utils/helpers';
import ReviewViewer from '../../components/ReviewViewer';

//@ts-ignore
import textEncoding from 'text-encoding';
import CopyButton from '../../components/CopyButton';
const TextDecoder = textEncoding.TextDecoder;

const claimUrl = `${window.location.protocol}//${window.location.host}/claim/`;

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

const generate = async (projectInput: Project): Promise<UploadResponse[]> => {
  const inputs = ProjectToCertList(projectInput);
  const hashes = await generateMultiple({
    id: projectInput.renderProps.template,
    layoutId: projectInput.renderProps.templateLayout,
    input: inputs,
    upload: true,
  });
  return hashes;
};

export interface UploadResponse {
  hash: string;
  key: string;
}

export default function Mint() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, ProcessingTx } = useWallet();
  const {
    findProject,
    LoadingPendingProjects,
    PendingProjects,
    refreshMintedProjects,
    LoadingMintedProjects,
    MintedProjects,
    findMintedProject,
  } = useProject();
  const { preloadCerts } = useExecute();

  const [project, setProject] = useState<Project>();
  const [imageHashes, setImageHashes] = useState<UploadResponse[]>([]);
  const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);
  const [loadingPreload, setLoadingPreload] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [txHash, setTxHash] = useState<string>();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `CertUP - Finalize Project ${project?.project_name}`;
  }, [project]);

  // Ensure Project ID is available
  useEffect(() => {
    console.log('Passed State', location.state);
    if (!location.state?.projectId) {
      navigate('/issuers');
      return;
    }
  }, []);

  useEffect(() => {
    if (LoadingPendingProjects || !PendingProjects.length || LoadingMintedProjects) return;
    refreshProjectInfo();
  }, [LoadingPendingProjects, LoadingMintedProjects]);

  const refreshProjectInfo = () => {
    // TODO check for empty project fields
    const foundProject = findProject(location.state?.projectId);
    if (!foundProject) {
      toast.error("Didn't find a project to mint, please try again.");
      return;
    }
    setProject(foundProject);

    const alreadyMintedProject = findMintedProject(location.state?.projectId);
    if (alreadyMintedProject) {
      toast.error('This project has already been loaded to the blockchain.');
      setLoaded(true);
      return;
    }
  };

  const handleCancel = () => {
    navigate('/issuers', {
      replace: true,
      state: loaded ? undefined : { projectId: location.state?.projectId, show: true },
    });
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!project) throw new Error('Project Data Not Found');
    if (!project._id) throw new Error('Project ID Not Found'); // todo handle this better (save and get ID)
    if (!project.certInfo.issue_date) throw new Error('Project must have an issue date.');

    if (project.participants.length > 100) {
      toast.error(
        `Projects are currently limited to 100 participants. Your project contains ${project.participants.length} participants.`,
      );
      return;
    }

    setLoadingGenerate(true);
    const toastRef = toast.loading('Generating Certificate Images...');

    try {
      let hashes: UploadResponse[];
      if (imageHashes.length) hashes = imageHashes;
      else {
        hashes = await generate(project);
        setImageHashes(hashes);
      }
      toast.update(toastRef, SuccessToast);
    } catch (error: any) {
      console.error(error);
      toast.update(toastRef, {
        render: error.toString(),
        type: 'error',
        isLoading: false,
        autoClose: 70000,
      });
    }

    setLoadingGenerate(false);
  };

  const handlePreload = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    try {
      if (!project) throw new Error('Project Data Not Found');
      if (!project._id) throw new Error('Project ID Not Found'); // todo handle this better (save and get ID)
      if (!imageHashes.length) throw new Error('Images Not Generated');

      if (project.participants.length > 100) {
        toast.error(
          `Projects are currently limited to 100 participants. Your project contains ${project.participants.length} participants.`,
        );
        return;
      }

      setLoadingPreload(true);
      const toastRef = toast.loading('Processing Transaction...');
      let result;
      try {
        const newData = project?.participants.map((participant, i) => {
          const { pubMeta, privMeta } = participantToExtensions(
            participant,
            project.certInfo,
            project.renderProps,
            imageHashes[i],
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
        toast.update(toastRef, new ToastProps(error.toString(), 'error'));
      }

      console.log('TX Result', result);
      if (!result) {
        setLoadingPreload(false);
        return;
      }

      // refreshMintedProjects();
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
          {loaded ? (
            <Row
              className="justify-content-space-between mx-4 mt-4 text-center"
              style={{ marginBottom: '25px' }}
            >
              <h2>Project Complete</h2>
              {!!txHash && (
                <>
                  <a
                    href={`${process.env.REACT_APP_EXPLORER_URL}/transactions/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Transaction on Explorer →
                  </a>
                  <h5 style={{ marginTop: '1.5rem' }}>
                    You can download the certificate claim codes below.
                  </h5>
                  <h6>Recipients can redeem their certs at:</h6>
                  <p className={`${styles.accessText} ${styles.certLink} mx-2 mb-0`}>
                    {claimUrl}
                    <CopyButton text={claimUrl} className="mx-2" />
                  </p>
                </>
              )}
            </Row>
          ) : (
            <Row
              className="justify-content-space-between mx-4 mt-4"
              style={{ marginBottom: '25px' }}
            >
              <Col xs={12} md={4} className={`${styles.stepColumnLeft} ${styles.stepColumn}`}>
                <Row className="align-items-center mb-2">
                  <Col xs="auto" className="px-0">
                    <h4
                      className={!imageHashes.length && !loaded ? styles.activeStep : undefined}
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
                    <CUButton
                      btnStyle="square"
                      onClick={handleGenerate}
                      disabled={loadingGenerate || !!imageHashes.length || !project || loaded}
                      className={loadingGenerate ? `${styles.processingButton}` : undefined}
                    >
                      {loadingGenerate ? (
                        <>Processing</>
                      ) : imageHashes.length || loaded ? (
                        'Complete'
                      ) : (
                        'Generate'
                      )}
                    </CUButton>
                    {loaded && (
                      <>
                        <br />
                        <br />
                      </>
                    )}
                  </Col>
                </Row>
              </Col>
              <Col xs={12} md={4} className={`${styles.stepColumn} justify-content-start`}>
                <Row className="align-items-center mb-3">
                  <Col xs="auto" className="px-0">
                    <h4 style={{ display: 'inline-block', marginBottom: 0 }}>Step 2</h4>
                  </Col>
                </Row>
                <Row>
                  <p>
                    Review the final certificates and images below for accuracy. Go back and make
                    any changes if needed.
                  </p>
                </Row>
              </Col>
              <Col xs={12} md={4} className={`${styles.stepColumnRight} ${styles.stepColumn}`}>
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
                        <CUButton btnStyle="square" disabled={true}>
                          Complete
                        </CUButton>
                        <br />
                        {!!txHash && (
                          <a
                            href={`${process.env.REACT_APP_EXPLORER_URL}/transactions/${txHash}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Transaction →
                          </a>
                        )}
                      </>
                    ) : (
                      <CUButton
                        btnStyle="square"
                        className={loadingPreload ? `${styles.processingButton}` : undefined}
                        onClick={handlePreload}
                        disabled={ProcessingTx || loadingPreload || !imageHashes.length}
                      >
                        {loadingPreload ? 'Processing' : 'Finish'}
                      </CUButton>
                      // <button
                      //   className={
                      //     loadingPreload
                      //       ? `${styles.processingButton} ${styles.cancelBtn}`
                      //       : styles.cancelBtn
                      //   }
                      //   onClick={handlePreload}
                      //   disabled={ProcessingTx || loadingPreload || !imageHashes.length}
                      // >
                      //   {loadingPreload ? 'Processing' : 'Finish'}
                      // </button>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
          <hr />
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
