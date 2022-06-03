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
import { useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import { Project } from '../../interfaces';

export default function Issuers() {
  const [showProject, setShowProject] = useState(false);
  const [projectInfo, setProjectInfo] = useState<Project | undefined>();
  const { Client, ClientIsSigner, Wallet, Address, LoginToken } = useWallet();

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
          <ProjectForm projectInfo={projectInfo} backHandler={showList} />
        ) : (
          <ProjectList setProject={setProject} />
        )}
      </Layout>
    </>
  );
}
