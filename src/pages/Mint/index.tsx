/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, CUButtonDark, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import { useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import ProjectList from '../../components/ProjectList';
import { useEffect, useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import { Participant, Project } from '../../interfaces';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Tx } from 'secretjs';
import { toast } from 'react-toastify';
import StepNumber from '../../components/StepNumber';
import { ProgressBar } from '../../components';
import Table from 'react-bootstrap/Table';

export default function Mint() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken } = useWallet();
  const [project, setProject] = useState<Project>();
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const location = useLocation();
  //const numCerts = location.state?.num_certificates || undefined;

  useEffect(() => {
    console.log('running effect');
    console.log(location.state);
    if (!location.state?.project) {
      navigate('/issuers');
      return;
    }

    // TODO check for empty project fields

    setProject(location.state?.project);
  }, []);

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const toastRef = toast.loading('Transaction Processing...');

    // const newData = [
    //   {
    //     name: 'John Smith',
    //     date: new Date().toString(),
    //     cert_type: 'test',
    //     attributes: [
    //       {
    //         trait_type: 'test trait',
    //         value: 'test value',
    //       },
    //     ],
    //     priv_attributes: [
    //       {
    //         trait_type: 'priv trait',
    //         value: 'priv value',
    //       },
    //     ],
    //   },
    // ];

    const newData = project?.participants.map((participant) => {
      return {
        name: `${participant.name} ${participant.surname}`,
        date: project.issue_date?.toLocaleDateString(),
        cert_type: 'test',
        attributes: [
          {
            trait_type: 'Description',
            value: project.pub_description,
          },
        ],
        priv_attributes: [
          {
            trait_type: 'Description',
            value: project.priv_description,
          },
        ],
      };
    });

    const mintMsg = {
      pre_load: {
        new_data: newData,
      },
    };

    const result = await Client?.tx.compute.executeContract(
      {
        sender: Address,
        contractAddress: process.env.REACT_APP_CONTRACT_ADDR as string,
        codeHash: process.env.REACT_APP_CONTRACT_HASH as string,
        msg: mintMsg,
      },
      {
        gasLimit: 50_000,
      },
    );
    console.log(result);
    if (!result) throw new Error('Something went wrong');
    if (result.code) throw new Error(result.rawLog);

    toast.update(toastRef, { render: 'Success!', type: 'success', isLoading: false });

    //@ts-ignore
    const wasmLogs =
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
        .find((element) => element.key.includes(`${participant.name} ${participant.surname}`))
        .value.trim();
      console.log(claimCode);

      participant.claim_code = claimCode;
    }

    const newProject = new Project(
      project?.owner,
      project?.project_name,
      project?.pub_description,
      project?.priv_description,
      project?.template,
      project?.issue_date,
      project?.issuer,
      newParticipants,
    );
    setProject(newProject);
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
              <button className={styles.cancelBtn} onClick={handleGenerate}>
                Generate
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
        </Container>
      </Layout>
    </>
  );
}
