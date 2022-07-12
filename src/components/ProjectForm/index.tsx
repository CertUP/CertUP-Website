/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import { Spacer } from '../../components';
import DatePicker from 'react-datepicker';
import ImagePicker, { PickImage } from '../ImagePicker';
//import 'react-image-picker/dist/index.css';

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
import StepNumber from '../StepNumber';
import MiniCircle from '../MiniCircle';
import LogoDropzone from '../LogoDropzone';
import {
  dataURLtoFile,
  bufferToDataURI,
  fileToBase64,
  generateImage,
  GenerateInput,
  generateWithWait,
} from '../../utils/backendHelper';
import { Spinner } from 'react-bootstrap';
import { sleep } from '../../utils/helpers';

import bg1 from '../../assets/bg1-thumb.jpg';
import bg2 from '../../assets/bg2-thumb.jpg';
import bg3 from '../../assets/bg3-thumb.jpg';

const bgList = [bg1, bg2, bg3];

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

interface formProps {
  pid?: string;
  projectInfo?: Project;
  step?: string;
  backHandler: () => void;
}

export default function ProjectForm({ pid, projectInfo, step, backHandler }: formProps) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts } = useWallet();
  const [projectName, setProjectName] = useState<string>(projectInfo?.project_name || '');
  const [validated, setValidated] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>(
    projectInfo?.participants || [new Participant(), new Participant()],
  );

  const [previewImage, setPreviewImage] = useState<string>();
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  const [certTitle, setCertTitle] = useState<string>(projectInfo?.cert_title || '');
  const [certName, setCertName] = useState<string>(projectInfo?.cert_name || '');

  const [companyName, setCompanyName] = useState<string>(projectInfo?.company_name || '');
  const [companyLogo, setCompanyLogo] = useState<File>();

  const [signer, setSigner] = useState<string>(projectInfo?.signer || '');
  const [signerTitle, setSignerTitle] = useState<string>(projectInfo?.signer_title || '');

  const [line1Text, setLine1Text] = useState<string>(projectInfo?.line1Text || '');
  const [line3Text, setLine3Text] = useState<string>(projectInfo?.line3Text || '');

  const [issueDate, setIssueDate] = useState(projectInfo?.issue_date);
  const [expireDate, setExpireDate] = useState(projectInfo?.expire_date);

  const [pubDesc, setPubDesc] = useState<string>(projectInfo?.pub_description || '');
  const [privDesc, setPrivDesc] = useState<string>(projectInfo?.priv_description || '');

  const [templateBg, setTemplateBg] = useState<number>(1);

  const rendering = useRef(false);

  const navigate = useNavigate();

  type ButtonProps = JSX.IntrinsicElements['button'];

  const ExampleCustomInput = forwardRef<HTMLButtonElement, ButtonProps>(
    // eslint-disable-next-line react/prop-types
    ({ value, onClick }, ref) => {
      return (
        <button
          type="button"
          style={{
            width: '100%',
            background: '#F2F2F2',
            borderRadius: '38px',
            //textAlign: 'left',
            border: '1px solid #ced4da',
            padding: '6px 12px',
            lineHeight: '1.5',
            height: '36px',
          }}
          onClick={onClick}
          ref={ref}
        >
          {value}
        </button>
      );
    },
  );

  const getProject = (): Project => {
    return new Project(
      Address,
      projectName,
      pubDesc,
      privDesc,
      undefined,
      issueDate,
      signer,
      participants,
    );
  };

  useEffect(() => {
    if (projectInfo?.company_logo) {
      const file = dataURLtoFile(projectInfo.company_logo);
      console.log('FILE', file);
      setCompanyLogo(file);
    }
  }, []);

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

  useEffect(() => {
    const run = async () => {
      console.log('rendering preview');

      setLoadingPreview(true);

      const participant = participants[0];
      const logoData = bufferToDataURI(
        (await companyLogo?.arrayBuffer()) as ArrayBuffer,
        companyLogo?.type as string,
      );

      const input: GenerateInput = {
        logoData: logoData,
        fullName: `${participant.name} ${participant.surname}`,
        dob: participant.dob,
        certNum: participant.cert_num,
        companyName: companyName || 'CFI',
        issueDate: issueDate as Date,
        expireDate: expireDate,
        certTitle: certTitle,
        signer: signer || 'John Smith',
        signerTitle: signerTitle || 'Director',
        line1: line1Text || 'This certifies that',
        line3: line3Text || 'has completed Advanced Financial Training',
        templateBg: templateBg + 1 || 1,
      };

      const preview = await generateWithWait('2', input);
      if (!preview) {
        console.log('skipping render');
        return;
      }
      setPreviewImage(preview);
      setLoadingPreview(false);
      rendering.current = false;
    };
    run();
  }, [
    templateBg,
    participants[0],
    certTitle,
    line1Text,
    line3Text,
    companyName,
    companyLogo,
    signer,
    signerTitle,
    issueDate,
    expireDate,
  ]);

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
      signer,
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

  const handleSave = async (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e) e.preventDefault();

    if (!projectName) {
      toast.error("Please enter a 'Project Name'");
      return;
    }
    const tid = toast.loading('Saving...');

    const logoData = companyLogo
      ? bufferToDataURI(
          (await companyLogo?.arrayBuffer()) as ArrayBuffer,
          companyLogo?.type as string,
        )
      : '';

    try {
      const project: Project = {
        //_id: projectId.current,
        project_name: projectName,
        owner: Address,
        cert_title: certTitle,
        cert_name: certName,
        company_name: companyName,
        company_logo: logoData,
        pub_description: pubDesc,
        priv_description: privDesc,
        template: 1,
        template_bg: templateBg,
        issue_date: issueDate,
        expire_date: expireDate,
        signer: signer,
        signer_title: signerTitle,
        participants: participants,
        line1Text: line1Text,
        line3Text: line3Text,
      };

      const token = `Permit ${JSON.stringify(LoginToken)}`;
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

  const addParticipant = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
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

  const onPick = (image: PickImage) => {
    console.log('Picked:', image);
    setTemplateBg(image.value);
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
        <div style={{ height: '3vh' }} />
      </Container>
      <Container>
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className={styles.certupInputForm}
        >
          <Row className="mb-4">
            <Col md={'auto'}>
              <StepNumber>1</StepNumber>
            </Col>
          </Row>

          {/* \/ Project Name Section \/ */}

          <Row className="mb-4">
            <Col md={'auto'} className="text-center">
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col style={{ paddingTop: '0vh' }}>
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label className={styles.largeLabel}>Project Name</Form.Label>
                <Form.Control
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  type="text"
                  placeholder="My Project"
                  //className={styles.certupInput}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* \/ Participants Section \/ */}

          <Row className="mb-4">
            <Col md={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col>
              <Row>
                <span className={`${styles.sectionTitle} mb-1`}>Participants</span>
                <hr className={styles.formHr} />
              </Row>
              {/* Labels Row */}
              <Row>
                <Col md={3} className={styles.participantLabels}>
                  Name
                </Col>
                <Col md={3} className={styles.participantLabels}>
                  Surname
                </Col>
                <Col md={2} className={styles.participantLabels}>
                  Birth Date
                </Col>
                <Col md={2} className={styles.participantLabels}>
                  Certificate Number
                </Col>
              </Row>
              {participants.map((item, index) => {
                return (
                  <Row key={`participant-${index}`} className="mb-2">
                    <Form.Group as={Col} md="3" controlId="validationCustom02">
                      <Form.Control
                        required
                        value={participants[index].name}
                        onChange={(e) => changeParticipant(index, 'name', e.target.value)}
                        type="text"
                        placeholder="First name"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="3" controlId="validationCustom02">
                      <Form.Control
                        required
                        value={participants[index].surname}
                        onChange={(e) => changeParticipant(index, 'surname', e.target.value)}
                        type="text"
                        placeholder="Last name"
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="2" controlId="validationCustom02">
                      <DatePicker
                        selected={participants[index].dob}
                        onChange={(date: Date) => changeParticipant(index, 'dob', undefined, date)}
                        customInput={<ExampleCustomInput />}
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="2" controlId="validationCustom02">
                      <Form.Control
                        required
                        value={participants[index].cert_num}
                        onChange={(e) => changeParticipant(index, 'cert_num', e.target.value)}
                        type="text"
                        placeholder="123456"
                      />
                    </Form.Group>

                    <Col md="auto" className="d-flex align-items-center">
                      <div
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => deleteParticipant(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') deleteParticipant(index);
                        }}
                      >
                        <div>
                          <img src={trashImg} alt="trash" />
                          <span className="d-none d-lg-inline-block">Delete</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                );
              })}
              <button className={styles.addBtn} onClick={addParticipant}>
                + Add
              </button>
            </Col>
          </Row>

          {/* \/ Cert Info Section \/ */}

          <Row className="mb-4">
            <Col md={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col>
              <Row>
                <span className={`${styles.sectionTitle} mb-1`}>
                  Certificate Information (same on all certificates)
                </span>
                <hr className={styles.formHr} />
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Certificate Name
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      type="text"
                      placeholder="2022 CFI Training Certificate"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Certificate Title
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={certTitle}
                      onChange={(e) => setCertTitle(e.target.value)}
                      type="text"
                      placeholder="Certificate of Completion"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={2} className={styles.participantLabels}>
                  Public Certificate Description
                </Col>
                <Col>
                  <Form.Group as={Col} md="12" controlId="validationCustom02">
                    <Form.Control
                      required
                      as="textarea"
                      value={pubDesc}
                      onChange={(e) => setPubDesc(e.target.value)}
                      type="text"
                      placeholder="This description will be visible to the public."
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={2} className={styles.participantLabels}>
                  Private Certificate Description
                </Col>
                <Col>
                  <Form.Group as={Col} md="12" controlId="validationCustom02">
                    <Form.Control
                      required
                      as="textarea"
                      value={privDesc}
                      onChange={(e) => setPrivDesc(e.target.value)}
                      type="text"
                      placeholder="This description will only be visible to the recipient and any third-parties authorized by the recipient."
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Template
                </Col>
                <Col>
                  <ImagePicker
                    images={bgList.map((image, i) => ({ src: image, value: i }))}
                    onPick={onPick}
                    selected={{ src: bgList[0], value: 0 }}
                  />
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Line 1 Text
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={line1Text}
                      onChange={(e) => setLine1Text(e.target.value)}
                      type="text"
                      placeholder="This certifies that"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Line 3 Text
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={line3Text}
                      onChange={(e) => setLine3Text(e.target.value)}
                      type="text"
                      placeholder="has completed Advanced Financial Training"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Company Name
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      type="text"
                      placeholder="Corporate Finance Institute"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Company Logo
                </Col>
                <Col md="auto">
                  <LogoDropzone set={setCompanyLogo} external={companyLogo} />
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Certificate Signer
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={signer}
                      onChange={(e) => setSigner(e.target.value)}
                      type="text"
                      placeholder="John Smith"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Signer Title
                </Col>
                <Col>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Control
                      required
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      type="text"
                      placeholder="Director"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Issue Date
                </Col>
                <Col>
                  <Form.Group as={Col} md="3" controlId="validationCustom02">
                    <DatePicker
                      selected={issueDate}
                      onChange={(date: Date) => setIssueDate(date)}
                      customInput={<ExampleCustomInput />}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Expire Date{' '}
                </Col>
                <Col>
                  <Form.Group as={Col} md="3" controlId="validationCustom02">
                    <DatePicker
                      selected={expireDate}
                      onChange={(date: Date) => setExpireDate(date)}
                      customInput={<ExampleCustomInput />}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* \/ Preview Section \/ */}

          <Row className="mb-2">
            <Col md={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
              <MiniCircle />
              <div style={{ width: '65px' }}></div>
            </Col>
            <Col>
              <Row>
                <span className={`${styles.sectionTitle} mb-1`}>Preview</span>
                <hr className={styles.formHr} />
              </Row>
            </Col>
          </Row>
          <Row className="mb-5">
            <Col>
              <div className={styles.previewContainer}>
                <Image src={previewImage} fluid={true} />
                {loadingPreview ? (
                  <div className={styles.previewLoading}>
                    <Spinner animation="border" variant="info" />
                  </div>
                ) : null}
              </div>
            </Col>
          </Row>

          <BackButton />
          <Spacer height={40} />

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
