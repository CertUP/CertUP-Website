/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useMemo, useState } from 'react';

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
import Project, {
  CertInfo,
  defaultCertInfo,
  defaultRenderProps,
  Participant,
  participantToRender,
  RenderProps,
} from '../../interfaces/Project';
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
import CUSelectButton from '../CUSelectButton';
import CsvModal from '../CsvModal';

import ImportFile from '../../assets/importfile.svg';
import { SaveExitModal } from '../Issuers';

const bgList = [bg1, bg2, bg3];

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

type ButtonProps = JSX.IntrinsicElements['button'];
type InputProps = JSX.IntrinsicElements['input'];

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

const TypeableDatePicker = forwardRef<HTMLInputElement, InputProps>(
  // eslint-disable-next-line react/prop-types
  ({ value, onClick }, ref) => {
    return (
      <input
        type="text"
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
        //onChange={(e) => }
        ref={ref}
        value={value}
      />
    );
  },
);

interface FormProps {
  pid?: string;
  step?: string;
  backHandler: () => void;
}

interface FormErrors {
  projectName?: any;
  cert_name?: any;
  pub_description?: any;
  priv_description?: any;
  issue_date?: any;
  expire_date?: any;
  certTitle?: any;
  displayDob?: any;
  dobFormat?: any;
  displayEmployer?: any;
  employerText?: any;
  companyName?: any;
  signer?: any;
  signerTitle?: any;
  participants?: any;
}

export default function ProjectForm({ pid, step, backHandler }: FormProps) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts } = useWallet();
  const { findProject, updateProject, addProject } = useProject();
  const [projectInfo, setProjectInfo] = useState(pid ? findProject(pid) : undefined);

  const [participants, setParticipants] = useState<Participant[]>(
    projectInfo?.participants || [new Participant(), new Participant()],
  );
  const [renderProps, setRenderProps] = useState<RenderProps>(
    projectInfo?.renderProps || defaultRenderProps,
  );
  const [certInfo, setCertInfo] = useState<CertInfo>(projectInfo?.certInfo || defaultCertInfo);
  const [projectName, setProjectName] = useState<string>(projectInfo?.project_name || '');

  const [dirty, setDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState<FormErrors>({});

  const [previewImage, setPreviewImage] = useState<string>();
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  // const [companyLogoFile, setCompanyLogoFile] = useState<File | undefined>(
  //   projectInfo?.renderProps.company_logo_file,
  // );
  // const [companyLogoURI, setCompanyLogoURI] = useState<string | undefined>(
  //   projectInfo?.renderProps.company_logo_uri,
  // );

  // const [signatureFile, setSignatureFile] = useState<File | undefined>(
  //   projectInfo?.renderProps.signature_file,
  // );
  // const [signatureURI, setSignatureURI] = useState<string | undefined>(
  //   projectInfo?.renderProps.signerSignature,
  // );

  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);

  const projectId = useRef<string | undefined>(projectInfo?._id || pid);

  const rendering = useRef(false);

  const navigate = useNavigate();

  const findFormErrors = (): FormErrors => {
    const { cert_name, pub_description, priv_description, issue_date, expire_date } = certInfo;
    const {
      certTitle,
      displayDob,
      dobFormat,
      displayEmployer,
      employerText,
      companyName,
      signer,
      signerTitle,
    } = renderProps;
    let newErrors: FormErrors = {};
    if (!projectName || projectName === '')
      newErrors = { ...newErrors, projectName: 'Please enter a project name' };
    if (!cert_name) newErrors = { ...newErrors, cert_name: 'Please enter a certificate name' };

    if (!issue_date) newErrors = { ...newErrors, issue_date: 'Please enter an issue date' };

    if (!certTitle)
      newErrors = {
        ...newErrors,
        certTitle: 'Please enter a title to be displayed on the certificate image',
      };

    if (!companyName)
      newErrors = {
        ...newErrors,
        companyName: 'Please enter a company name to be displayed on the certificate image',
      };

    if (!signer)
      newErrors = {
        ...newErrors,
        signer: 'Please enter a signer name to be displayed on the certificate image',
      };

    if (!signerTitle)
      newErrors = { ...newErrors, signerTitle: 'Please enter a title for the certificate signer' };

    for (let i = 0; i < participants.length; i++) {
      let participantErrors = {};
      const participant = participants[i];

      if (!participant.name) participantErrors = { name: true };
      if (!participant.surname) participantErrors = { ...participantErrors, surname: true };
      if (!participant.dob) participantErrors = { ...participantErrors, dob: true };
      if (!participant.cert_num) participantErrors = { ...participantErrors, cert_num: true };

      if (!Object.keys(participantErrors).length) {
        if (newErrors.participants) delete newErrors.participants[i];
      } else
        newErrors = {
          ...newErrors,
          participants: { ...newErrors.participants, [i]: participantErrors },
        };
    }
    if (newErrors.participants && !Object.keys(newErrors.participants).length)
      delete newErrors.participants;

    console.log('Errors:', newErrors);
    return newErrors;
  };

  const updateCertInfo = (newCertInfo: object) => {
    setCertInfo({ ...certInfo, ...newCertInfo });
    setDirty(true);
  };

  const updateRenderProps = (newRenderProps: object) => {
    setRenderProps({ ...renderProps, ...newRenderProps });
    setDirty(true);
  };

  const getProject = (): Project => {
    const cinfo: CertInfo = {
      cert_name: certInfo.cert_name,
      pub_description: certInfo.pub_description,
      priv_description: certInfo.priv_description,
      issue_date: certInfo.issue_date,
      expire_date: certInfo.expire_date,
    };
    const rprops: RenderProps = {
      template: '2',
      templateBg: renderProps.templateBg,
      templateLayout: renderProps.templateLayout,
      certTitle: renderProps.certTitle,
      line1Text: renderProps.line1Text,
      line3Text: renderProps.line3Text,
      displayDob: false,
      //dobFormat: '',
      displayEmployer: false,
      employerText: '',
      companyName: renderProps.companyName,
      signer: renderProps.signer,
      signerTitle: renderProps.signerTitle,
      signerSignatureUri: renderProps.signerSignatureUri,
      companyLogoUri: renderProps.companyLogoUri,
    };

    return new Project({
      _id: projectId.current,
      owner: Address,
      project_name: projectName,
      lastPreview: previewImage,
      participants: participants,
      certInfo: cinfo,
      renderProps: rprops,
    });
  };

  const handleLogoChange = async (uri: string) => {
    setDirty(true);
    updateRenderProps({ companyLogoUri: uri });
  };

  const handleSigChange = async (uri: string) => {
    setDirty(true);
    updateRenderProps({ signerSignatureUri: uri });
  };

  // Re-Render Peview when data changes
  useEffect(() => {
    const run = async () => {
      setLoadingPreview(true);

      //const participant = participants[0];
      //const logoData = await fileToDataURI(companyLogoFile, companyLogoFile?.type || 'image/jpg');

      // bufferToDataURI(
      //   (await companyLogo?.arrayBuffer()) as ArrayBuffer,
      //   companyLogo?.type as string,
      // );

      const input: GenerateInput = {
        // logoData: renderProps.company_logo_uri as string,
        // fullName: `${participant.name} ${participant.surname}`,
        // dob: participant.dob?.toDateString(),
        // certNum: participant.cert_num,
        // companyName: renderProps.company_name || 'CFI',
        // issueDate: certInfo.issue_date ? certInfo.issue_date.toDateString() : undefined,
        // expireDate: certInfo.expire_date ? certInfo.expire_date.toDateString() : undefined,
        // certTitle: renderProps.cert_title,
        // signer: renderProps.signer || 'John Smith',
        // signerTitle: renderProps.signerTitle || 'Director',
        // line1: renderProps.line1Text || 'This certifies that',
        // line3: renderProps.line3Text || 'has completed Advanced Financial Training',
        // templateBg: renderProps.templateBg || 1,
        renderProps: renderProps,
        certInfo: certInfo,
        participant: participantToRender(participants[0]),
      };

      const preview = await generateWithWait({
        id: '2',
        layoutId: renderProps.templateLayout,
        input,
      });
      if (!preview) {
        return;
      }
      setPreviewImage(preview);
      setLoadingPreview(false);
      rendering.current = false;
    };
    run();
  }, [
    // templateBg,
    // templateLayout,
    participants[0],
    renderProps,
    certInfo.issue_date,
    certInfo.expire_date,
    // certTitle,
    // line1Text,
    // line3Text,
    // companyName,
    // companyLogoFile,
    //   signer,
    //   signerTitle,
    //   issueDate,
    //   expireDate,
  ]);

  const handleBack = () => {
    if (!dirty) backHandler();
    else setShowExitModal(true);
  };

  function BackButton() {
    return (
      <div
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        onClick={() => handleBack()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleBack();
        }}
        className="d-flex align-items-center"
      >
        <span className={styles.backArrow}>🠔</span>
        <span className={styles.backFont}>Go Back</span>
      </div>
    );
  }

  const scrtPayment = async (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      if (e) e.preventDefault();

      const newErrors = findFormErrors();
      // Conditional logic:
      if (Object.keys(newErrors).length > 0) {
        // We got errors!
        setErrors(newErrors);
        toast.error('Please complete all required fields.');
        return;
      }

      await handleSave();
      console.log('remain', RemainingCerts);

      if (RemainingCerts >= participants.length) {
        navigate('/generate', { state: { projectId: projectId.current } });
      } else
        navigate('/payment', {
          state: { num_certificates: participants.length, projectId: projectId.current },
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e) e.preventDefault();

    if (!projectName) {
      toast.error("Please enter a 'Project Name'");
      return;
    }
    const tid = toast.loading('Saving...');

    try {
      const project = getProject();

      if (!projectId.current) {
        console.log('Saving New Project:', project);
        const id = await addProject(project);

        console.log('New Project ID', id);
        projectId.current = id;
      } else {
        console.log('Saving Existing Project:', projectId.current, project);
        await updateProject(projectId.current, project);
      }

      toast.update(tid, {
        render: `Saved Project`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      setDirty(false);
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
    setDirty(true);
  };

  const deleteParticipant = async (index: number) => {
    const newAry = [...participants];
    newAry.splice(index, 1);
    setParticipants(newAry);
    setDirty(true);
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
    setDirty(true);
  };

  const onPick = (image: PickImage) => {
    console.log('Picked External:', image.value + 1);
    updateRenderProps({ templateBg: image.value + 1 });
  };

  return (
    <>
      <CsvModal show={showCsvModal} setShow={setShowCsvModal} setParticipants={setParticipants} />\
      <SaveExitModal
        show={showExitModal}
        handleClose={() => setShowExitModal(false)}
        handleSave={handleSave}
        handleContinue={backHandler}
      />
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
                <Form.Label className={`${styles.largeLabel} mb-0`}>Project Name</Form.Label>
                <p
                  className={`${styles.sectionTitle} mx-2`}
                  style={{ fontSize: '14px', lineHeight: '16px' }}
                >
                  Only visible to you
                </p>
                <Form.Control
                  required
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);

                    setDirty(true);
                  }}
                  type="text"
                  placeholder="My Project"
                  className="mt-1"
                  isInvalid={!!errors.projectName}
                />
                <Form.Control.Feedback type="invalid">{errors.projectName}</Form.Control.Feedback>
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
                let pErrors;
                if (errors.participants) pErrors = errors.participants[index];
                return (
                  <Row key={`participant-${index}`} className="mb-2">
                    <Form.Group as={Col} md="3" controlId="validationCustom02">
                      <Form.Control
                        required
                        value={participants[index].name}
                        onChange={(e) => changeParticipant(index, 'name', e.target.value)}
                        type="text"
                        placeholder="First name"
                        isInvalid={!!pErrors?.name}
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="3" controlId="validationCustom02">
                      <Form.Control
                        required
                        value={participants[index].surname}
                        onChange={(e) => changeParticipant(index, 'surname', e.target.value)}
                        type="text"
                        placeholder="Last name"
                        isInvalid={!!pErrors?.surname}
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="2" controlId="validationCustom02">
                      <DatePicker
                        selected={participants[index].dob}
                        onChange={(date: Date) => changeParticipant(index, 'dob', undefined, date)}
                        className={
                          pErrors?.dob
                            ? `${styles.inputStyle} ${styles.invalidDate}`
                            : styles.inputStyle
                        }
                        //customInput={<ExampleCustomInput />}
                      />
                    </Form.Group>

                    <Form.Group as={Col} md="2" controlId="validationCustom02">
                      <Form.Control
                        required
                        value={participants[index].cert_num}
                        onChange={(e) => changeParticipant(index, 'cert_num', e.target.value)}
                        type="text"
                        placeholder="123456"
                        isInvalid={!!pErrors?.cert_num}
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
              <Row className="mt-2">
                <Col xs={'auto'}>
                  <button className={styles.addBtn} onClick={addParticipant}>
                    + Add
                  </button>
                </Col>
                <Col xs={'auto'} className="d-flex align-items-center mx-2">
                  <Image
                    src={ImportFile}
                    alt="Import From File"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowCsvModal(true)}
                  />
                </Col>
              </Row>
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
                      value={certInfo.cert_name}
                      onChange={(e) => updateCertInfo({ cert_name: e.target.value })}
                      type="text"
                      placeholder="2022 CFI Training Certificate"
                      isInvalid={!!errors.cert_name}
                    />
                    <Form.Control.Feedback type="invalid">{errors.cert_name}</Form.Control.Feedback>
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
                      as="textarea"
                      value={certInfo.pub_description}
                      onChange={(e) => updateCertInfo({ pub_description: e.target.value })}
                      type="text"
                      placeholder="This optional description will be visible to the public."
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
                      as="textarea"
                      value={certInfo.priv_description}
                      onChange={(e) => updateCertInfo({ priv_description: e.target.value })}
                      type="text"
                      placeholder="This optional description will only be visible to the recipient and any third-parties authorized by the recipient."
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
                      selected={certInfo.issue_date}
                      onChange={(date: Date) => updateCertInfo({ issue_date: date })}
                      className={
                        errors.issue_date
                          ? `${styles.inputStyle} ${styles.invalidDate}`
                          : styles.inputStyle
                      }
                      //customInput={<TypeableDatePicker />}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Expire Date
                </Col>
                <Col>
                  <Row style={{ margin: 0 }}>
                    <Form.Group
                      as={Col}
                      md="3"
                      controlId="validationCustom02"
                      style={{ padding: 0 }}
                    >
                      <DatePicker
                        selected={certInfo.expire_date}
                        onChange={(date: Date) => updateCertInfo({ expire_date: date })}
                        className={styles.inputStyle}
                        //customInput={<ExampleCustomInput />}
                      />
                    </Form.Group>
                    {certInfo.expire_date ? (
                      <Col className="d-flex align-items-center mx-2">
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          size="lg"
                          onClick={() => updateCertInfo({ expire_date: undefined })}
                          style={{ cursor: 'pointer' }}
                        />
                      </Col>
                    ) : null}
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* \/ Cert Image Section \/ */}

          <Row className="mb-4">
            <Col md={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col>
              <Row>
                <span className={`${styles.sectionTitle} mb-1`}>Certificate Image</span>
                <hr className={styles.formHr} />
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Template
                </Col>
                <Col>
                  <ImagePicker
                    images={bgList.map((image, i) => ({ src: image, value: i }))}
                    onPick={onPick}
                    selected={{
                      src: bgList[renderProps.templateBg - 1],
                      value: renderProps.templateBg - 1,
                    }}
                  />
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Layout
                </Col>
                <Col>
                  <Row>
                    <Col md="auto">
                      <CUSelectButton
                        type="button"
                        selected={renderProps.templateLayout === 1}
                        onClick={() => updateRenderProps({ templateLayout: 1 })}
                      >
                        Left
                      </CUSelectButton>
                    </Col>
                    <Col md="auto">
                      <CUSelectButton
                        type="button"
                        selected={renderProps.templateLayout === 2}
                        onClick={() => updateRenderProps({ templateLayout: 2 })}
                      >
                        Center
                      </CUSelectButton>
                    </Col>
                  </Row>
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
                      value={renderProps.certTitle}
                      onChange={(e) => updateRenderProps({ certTitle: e.target.value })}
                      type="text"
                      placeholder="Certificate of Completion"
                      isInvalid={!!errors.certTitle}
                    />
                    <Form.Control.Feedback type="invalid">{errors.certTitle}</Form.Control.Feedback>
                  </Form.Group>
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
                      value={renderProps.line1Text}
                      onChange={(e) => updateRenderProps({ line1Text: e.target.value })}
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
                      value={renderProps.line3Text}
                      onChange={(e) => updateRenderProps({ line3Text: e.target.value })}
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
                      value={renderProps.companyName}
                      onChange={(e) => updateRenderProps({ companyName: e.target.value })}
                      type="text"
                      placeholder="Corporate Finance Institute"
                      isInvalid={!!errors.companyName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.companyName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Company Logo
                </Col>
                <Col md="auto">
                  <ImageDropzone set={handleLogoChange} externalUri={renderProps.companyLogoUri} />
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
                      value={renderProps.signer}
                      onChange={(e) => updateRenderProps({ signer: e.target.value })}
                      type="text"
                      placeholder="John Smith"
                      isInvalid={!!errors.signer}
                    />
                    <Form.Control.Feedback type="invalid">{errors.signer}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Signature
                </Col>
                <Col md="auto">
                  <ImageDropzone
                    set={handleSigChange}
                    externalUri={renderProps.signerSignatureUri}
                  />
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
                      value={renderProps.signerTitle}
                      onChange={(e) => updateRenderProps({ signerTitle: e.target.value })}
                      type="text"
                      placeholder="Director"
                      isInvalid={!!errors.signerTitle}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.signerTitle}
                    </Form.Control.Feedback>
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
          <Row className="justify-content-end">
            <Col md="3" className="text-center">
              <h6>{participants.length} Certificates</h6>
            </Col>
          </Row>
          <Row style={{ marginBottom: '10px' }} className="justify-content-between">
            <Col md="3">
              <CUButton disabled={false} fill={true} onClick={handleSave}>
                <Row className="justify-content-space-between text-center">
                  <Col md={2} style={{ padding: '0px' }}>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                  </Col>
                  <Col style={{ padding: '0px', textAlign: 'center' }}>Save Project</Col>
                  <Col md={2} style={{ padding: '0px' }}>
                    {' '}
                  </Col>
                </Row>
              </CUButton>
            </Col>
            <Col md="3">
              <CUButton disabled={false} fill={true} onClick={scrtPayment} role="button">
                <Row className="justify-content-space-between">
                  <Col md={1} style={{ padding: '0px' }}>
                    {' '}
                  </Col>
                  <Col md="auto" style={{ padding: '0px' }}>
                    Proceed to Payment
                  </Col>
                  <Col style={{ padding: '0px', textAlign: 'right' }}>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Col>
                </Row>
              </CUButton>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}
