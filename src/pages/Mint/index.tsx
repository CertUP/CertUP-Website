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
import { PreloadData } from '../../interfaces';
import Project, { Participant, ProjectToCertList } from '../../interfaces/Project';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Spinner } from 'react-bootstrap';
import { Tx } from 'secretjs';
import { toast } from 'react-toastify';
import StepNumber from '../../components/StepNumber';
import { ProgressBar } from '../../components';
import Table from 'react-bootstrap/Table';
import { GenerateInput, generateMultiple } from '../../utils/backendHelper';
import { SuccessToast, ToastProps } from '../../utils/toastHelper';
import dlExcel from '../../assets/dlExcel.svg';
import * as XLSX from 'xlsx';
import useExecute from '../../hooks/ExecuteHook';

const participantsToWorksheet = (participants: Participant[]) => {
  const modified = participants.map((p: Participant) => {
    return {
      name: p.name,
      surname: p.surname,
      dob: p.dob,
      cert_num: p.cert_num,
      claim_code: p.claim_code || 'Not yet Generated',
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
  worksheet['!cols'][4] = { wch: 50 };
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [['Name', 'Surname', 'Date of Birth', 'Cert Number', 'Claim Code']],
    { origin: 'A1' },
  );

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Codes');
  XLSX.writeFile(workbook, `CertUP.xlsx`);
};

export default function Mint() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, ProcessingTx } = useWallet();
  const { findProject, LoadingProjects } = useProject();
  const { preloadCerts } = useExecute();

  const [projectId, setProjectId] = useState();
  const [project, setProject] = useState<Project>();
  //const [hashes, setHashes] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generated, setGenerated] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  //const numCerts = location.state?.num_certificates || undefined;

  useEffect(() => {
    console.log('Passed State', location.state);
    if (!location.state?.projectId) {
      navigate('/issuers');
      return;
    }
    if (!Wallet || !Address || LoadingProjects) return;

    // TODO check for empty project fields
    const foundProject = findProject(location.state?.projectId);
    setProject(foundProject);
    if (!foundProject) {
      toast.error("Didn't find a project to mint, please try again.");
      navigate('/issuers');
    }
  }, [Wallet, Address, LoadingProjects]);

  const generate = async (projectInput: Project): Promise<string[]> => {
    //if (!project) return [];
    const inputs = ProjectToCertList(projectInput);

    console.log('toGenerate', inputs);
    const hashes = await generateMultiple({ id: '2', input: inputs, upload: true });
    console.log('hashes');
    hashes.map((e: string) => console.log(`https://infura-ipfs.io/ipfs/${e}`));

    //setHashes(hashes);
    return hashes;
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  const handleDl = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.preventDefault();
    if (!project || !project.participants) {
      toast.error('Project not loaded.');
      return;
    }
    participantsToWorksheet(project.participants);
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!project) throw new Error('Project Data Not Found');
    setLoading(true);

    const toastRef = toast.loading('Generating Certificate Images...');
    const hashes = await generate(project);

    toast.update(toastRef, { render: 'Processing Transaction...' });
    let result;
    try {
      const newData = project?.participants.map((participant, i) => {
        return {
          name: `${participant.name} ${participant.surname}`,
          date: project.certInfo.issue_date?.toLocaleDateString(),
          cert_type: 'test',
          pub_metadata: {
            extention: {
              description: project.certInfo.pub_description,
              certificate: {
                name: project.project_name,
                issue_date: project.certInfo.issue_date?.toISOString(),
                cert_number: participant.cert_num?.toString(),
              },
              recipient: {
                first_name: participant.name,
                last_name: participant.surname,
                date_of_birth: participant.dob?.toISOString(),
              },
              issuing_organizations: [
                {
                  name: 'Corporate Finance Institute',
                  url: 'https://cfi.org',
                },
              ],
              issuing_individuals: [
                {
                  name: project.renderProps.signer,
                  company: 'Corporate Finance Institute',
                  title: 'Director',
                },
              ],
              inclusions: [
                {
                  type: 'Course',
                  name: 'Introduction to Finance',
                  value: '89.4',
                },
                {
                  type: 'Instructor',
                  name: 'Jane Smith',
                },
              ],
              attributes: [
                {
                  trait_type: 'Certificate Number',
                  value: participant.cert_num?.toString(),
                },
                {
                  trait_type: 'Certificate Name',
                  value: project.project_name,
                },
                {
                  trait_type: 'Issue Date',
                  value: project.certInfo.issue_date?.toDateString(),
                },
              ],
            },
          },
          priv_metadata: {
            extension: {
              description: project.certInfo.priv_description,
              certificate: {
                name: project.project_name,
                issue_date: project.certInfo.issue_date?.toISOString(),
                cert_number: participant.cert_num.toString(),
              },
              recipient: {
                first_name: participant.name,
                last_name: participant.surname,
                date_of_birth: participant.dob?.toISOString(),
              },
              issuing_organizations: [
                {
                  name: 'Corporate Finance Institute',
                  url: 'https://cfi.org',
                },
              ],
              issuing_individuals: [
                {
                  name: project.renderProps.signer,
                  company: 'Corporate Finance Institute',
                  title: 'Director',
                },
              ],
              inclusions: [
                {
                  type: 'Course',
                  name: 'Introduction to Finance',
                  value: '89.4',
                },
                {
                  type: 'Instructor',
                  name: 'Jane Smith',
                },
              ],
              attributes: [
                {
                  trait_type: 'Certificate Number',
                  value: participant.cert_num.toString(),
                },
                {
                  trait_type: 'Certificate Name',
                  value: project.project_name,
                },
                {
                  trait_type: 'Issue Date',
                  value: project.certInfo.issue_date?.toDateString(),
                },
              ],
              media: [
                {
                  file_type: 'image/png',
                  extension: 'png',
                  authentication: {
                    key: 'TO DO',
                  },
                  url: `https://ipfs.io/ipfs/${hashes[i]}`,
                },
              ],
            },
          },
        };
      });

      result = await preloadCerts(newData as PreloadData[], toastRef);

      //toast.update(toastRef, SuccessToast);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      //toast.update(toastRef, new ToastProps(error.toString(), 'error'));
    }

    const wasmLogs =
      //@ts-ignore
      result.jsonLog[0].events.find((element) => element.type === 'wasm').attributes || [];

    //const project2: Project = structuredClone(project) as Project;
    //@ts-ignore
    const newParticipants = [...project.participants];

    //@ts-ignore
    for (let i = 0; i < newParticipants.length; i++) {
      //@ts-ignore
      const participant = newParticipants[i];

      //@ts-ignore
      const claimCode = wasmLogs
        .find((element: any) => element.key.includes(`${participant.name} ${participant.surname}`))
        .value.trim();
      console.log(claimCode);

      participant.claim_code = claimCode;
    }

    const newProject = new Project({
      ...project,
      participants: newParticipants,
    });
    setProject(newProject);
    setGenerated(true);
    setLoading(false);
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

          <ConnectBanner />

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
          <Row className="justify-content-center" style={{ marginBottom: '25px' }}>
            <Col xs={'auto'}>
              <button
                className={styles.cancelBtn}
                onClick={handleGenerate}
                disabled={ProcessingTx || loading}
              >
                {ProcessingTx || loading ? (
                  <Spinner animation="border" size="sm" variant="light" />
                ) : (
                  'Generate'
                )}
              </button>
            </Col>
          </Row>
          <hr />
          <Row>
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
          ) : null}
        </Container>
      </Layout>
    </>
  );
}
