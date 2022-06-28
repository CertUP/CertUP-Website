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
import { Project } from '../../interfaces';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Issuers() {
  const [showProject, setShowProject] = useState(false);
  const [projectInfo, setProjectInfo] = useState<Project | undefined>();
  const [projectStep, setProjectStep] = useState();
  const { Client, ClientIsSigner, Wallet, Address, LoginToken } = useWallet();

  const location = useLocation();

  useEffect(() => {
    processReturn();
  }, []);

  const processReturn = async () => {
    if (location.state?.projectId) {
      if (location.state?.step) setProjectStep(location.state?.step);

      const project = await getProject(location.state?.projectId);
      console.log('project', project);
      setProject(project);
    }
  };

  const getProject = async (projectId: string): Promise<Project> => {
    console.log('running', LoginToken, Address);
    const token = `Permit ${JSON.stringify(LoginToken)}`;
    const url = new URL(`/projects/${projectId}`, process.env.REACT_APP_BACKEND);
    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: token,
      },
    });
    console.log(response);
    return response.data.data;
  };

  const setProject = (project: Project) => {
    //convert issue date string from DB into Date
    if (project.issue_date) project.issue_date = new Date(project.issue_date);

    // convert participant dob strings from DB to Date
    for (let i = 0; i < project.participants.length; i++) {
      if (project.participants[i].dob)
        project.participants[i].dob = new Date(project.participants[i].dob || '');
    }

    setProjectInfo(project);
    setShowProject(true);
  };

  const showList = () => {
    setProjectInfo(undefined);
    setShowProject(false);
  };

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>For Issuers</span>
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
        {showProject ? (
          <ProjectForm projectInfo={projectInfo} backHandler={showList} step={projectStep} />
        ) : (
          <ProjectList setProject={setProject} />
        )}
      </Layout>
    </>
  );
}
