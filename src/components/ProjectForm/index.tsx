import React, { useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { Spacer } from '../../components';
import DatePicker from 'react-datepicker';

import styles from './styles.module.scss';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteButton from '../DeleteButton';
import { Participant, Project } from '../../interfaces';
import trashImg from '../../assets/trash-2.svg';
import CUButton from '../CUButton';
import { useRef } from 'react';
import axios from 'axios';
import { useWallet } from '../../contexts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components';

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

interface formProps {
  pid?: string;
  projectInfo?: Project;
  step?: string;
  backHandler: () => void;
}

export default function ProjectForm({ pid, projectInfo, step, backHandler }: formProps) {
  console.log('PINFO', projectInfo);
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts } = useWallet();
  const [projectName, setProjectName] = useState<string>(projectInfo?.project_name || '');
  //const [projectId, setProjectId] = useState<string>(pid);
  const [pubDesc, setPubDesc] = useState<string>(projectInfo?.pub_description || '');
  const [privDesc, setPrivDesc] = useState<string>(projectInfo?.priv_description || '');
  const [issuer, setIssuer] = useState<string>(projectInfo?.issuer || '');
  const [validated, setValidated] = useState(false);
  const [issueDate, setIssueDate] = useState(projectInfo?.issue_date);
  const [participants, setParticipants] = useState<Participant[]>(
    projectInfo?.participants || [new Participant(), new Participant()],
  );

  const navigate = useNavigate();

  const getProject = (): Project => {
    return new Project(
      Address,
      projectName,
      pubDesc,
      privDesc,
      undefined,
      issueDate,
      issuer,
      participants,
    );
  };

  useEffect(() => {
    if (!projectInfo) return;

    switch (step) {
      case 'generate':
        navigate('/generate', { state: { project: getProject() } });
        break;
      default:
        null;
        break;
    }
  }, [step, projectInfo]);

  function BackButton() {
    return (
      <span
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        onClick={() => backHandler()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') backHandler();
        }}
      >
        ← Go Back
      </span>
    );
  }

  const scrtPayment = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    handleSave();
    console.log('remain', RemainingCerts);
    const project = new Project(
      Address,
      projectName,
      pubDesc,
      privDesc,
      undefined,
      issueDate,
      issuer,
      participants,
    );
    if (RemainingCerts >= participants.length)
      navigate('/generate', { state: { project: project } });
    else
      navigate('/addCredit', {
        state: { num_certificates: participants.length, projectId: projectId.current },
      });
  };

  const projectId = useRef<string | undefined>(projectInfo?._id || pid);
  console.log('projectID', projectId.current);

  const handleSave = async (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e) e.preventDefault();

    if (!projectName) {
      toast.error("Please enter a 'Project Name'");
      return;
    }
    const tid = toast.loading('Saving...');

    try {
      const project: Project = {
        //_id: projectId.current,
        project_name: projectName,
        owner: Address,
        pub_description: pubDesc,
        priv_description: privDesc,
        template: 1,
        issue_date: issueDate,
        issuer: issuer,
        participants: participants,
      };

      const token = `Permit ${JSON.stringify(LoginToken)}`;
      console.log(token);
      console.log(project);
      if (!projectId.current) {
        const response = await axios.post(projectsUrl, project, {
          headers: {
            Authorization: token,
          },
        });
        console.log(response);

        projectId.current = response.data.data._id;
        console.log(response.data.data._id, projectId.current);
      } else {
        //update extsting project
        const url = new URL(`/projects/${projectId.current}`, process.env.REACT_APP_BACKEND);
        console.log(url.toString());

        const response = await axios.put(url.toString(), project, {
          headers: {
            Authorization: token,
          },
        });
        console.log(response);
      }
      toast.update(tid, {
        render: `Saved Project`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (err: any) {
      console.error(err);
      toast.update(tid, {
        render: `Failed to save: ${err.response?.data?.message || err.toString()}`,
        type: 'error',
        isLoading: false,
        autoClose: 10000,
      });
    }
  };

  const handleSubmit = async () => {
    return null;
  };

  const addParticipant = async () => {
    setParticipants([...participants, new Participant()]);
  };

  const deleteParticipant = async (index: number) => {
    const newAry = [...participants];
    newAry.splice(index, 1);
    setParticipants(newAry);
  };

  const changeParticipant = async (index: number, field: string, value?: string, date?: Date) => {
    const newAry = [...participants];
    const participant = newAry[index];
    switch (field) {
      case 'name':
        participant.name = value || '';
        break;
      case 'surname':
        console.log('surname', value);
        participant.surname = value || '';
        break;
      case 'dob':
        participant.dob = date;
        break;
      case 'cert_num':
        participant.cert_num = value || '';
        break;
    }
    setParticipants(newAry);
  };

  return (
    <>
      <Container>
        <Row>
          <span className={styles.aboutTitle}>Create a Project</span>
        </Row>
      </Container>
      <ProgressBar step={1} />
      <Spacer height={50} />
      <Container>
        <BackButton />
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="4" controlId="validationCustom01">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                type="text"
                placeholder="My Project"
              />
            </Form.Group>
          </Row>
          <Row>
            <span>Participants</span>
            <hr />
          </Row>
          {participants.map((item, index) => {
            return (
              <Row key={`participant-${index}`}>
                <Form.Group as={Col} md="2" controlId="validationCustom02">
                  {!index ? <Form.Label>Name</Form.Label> : null}
                  <Form.Control
                    required
                    value={participants[index].name}
                    onChange={(e) => changeParticipant(index, 'name', e.target.value)}
                    type="text"
                    placeholder="First name"
                  />
                </Form.Group>

                <Form.Group as={Col} md="2" controlId="validationCustom02">
                  {!index ? <Form.Label>Surname</Form.Label> : null}
                  <Form.Control
                    required
                    value={participants[index].surname}
                    onChange={(e) => changeParticipant(index, 'surname', e.target.value)}
                    type="text"
                    placeholder="Last name"
                  />
                </Form.Group>

                <Form.Group as={Col} md="3" controlId="validationCustom02">
                  {!index ? <Form.Label>Birth Date</Form.Label> : null}
                  <DatePicker
                    selected={participants[index].dob}
                    onChange={(date: Date) => changeParticipant(index, 'dob', undefined, date)}
                  />
                </Form.Group>

                <Form.Group as={Col} md="2" controlId="validationCustom02">
                  {!index ? <Form.Label>Certificate Number</Form.Label> : null}
                  <Form.Control
                    required
                    value={participants[index].cert_num}
                    onChange={(e) => changeParticipant(index, 'cert_num', e.target.value)}
                    type="text"
                    placeholder="123456"
                  />
                </Form.Group>

                <Col md="auto">
                  <div
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onClick={() => deleteParticipant(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') deleteParticipant(index);
                    }}
                  >
                    <img src={trashImg} alt="trash" />
                    <span>Delete</span>
                  </div>
                </Col>
              </Row>
            );
          })}

          <Button onClick={() => addParticipant()}>Add</Button>
          <Row>
            <span>Certificate Information (same on all certificates)</span>
            <hr />
          </Row>
          <Row>
            <Form.Group as={Col} md="12" controlId="validationCustom02">
              <Form.Label>Public Certificate Description</Form.Label>
              <Form.Control
                required
                as="textarea"
                value={pubDesc}
                onChange={(e) => setPubDesc(e.target.value)}
                type="text"
                placeholder="This description will be visible to the public."
              />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} md="12" controlId="validationCustom02">
              <Form.Label>Private Certificate Description</Form.Label>
              <Form.Control
                required
                as="textarea"
                value={privDesc}
                onChange={(e) => setPrivDesc(e.target.value)}
                type="text"
                placeholder="This description will only be visible to the recipient and any third-parties authorized by the recipient."
              />
            </Form.Group>
          </Row>
          <Row>Template</Row>
          <Row>Issuer Logo</Row>
          <Row>Issuer Name</Row>
          <Row>
            <Form.Group as={Col} md="2" controlId="validationCustom02">
              <Form.Label>Issue Date</Form.Label>
              <DatePicker selected={issueDate} onChange={(date: Date) => setIssueDate(date)} />
            </Form.Group>
          </Row>
          <Row>PREVIEW</Row>
          <BackButton />
          <Row style={{ marginBottom: '10px' }}>
            <Col md="3">
              <CUButton disabled={false} large={false} fill={true} onClick={handleSave}>
                Save
              </CUButton>
            </Col>
          </Row>
          <Row style={{ marginBottom: '10px' }}>
            <Col md="3">
              <CUButton disabled={false} large={false} fill={true} onClick={scrtPayment}>
                Pay with $SCRT
              </CUButton>
            </Col>
          </Row>
          <Row>
            <Col md="3">
              <CUButton disabled={true} large={false} fill={true}>
                Proceed to Payment
              </CUButton>
              <br />
              <span>You will be redirected to Coinbase Cryptocurrency Gateway</span>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}
