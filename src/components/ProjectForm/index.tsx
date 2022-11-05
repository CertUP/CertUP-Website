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
import DatePicker from 'react-date-picker/dist/entry.nostyle';
import ImagePicker, { PickImage } from '../ImagePicker';
//import 'react-image-picker/dist/index.css';

import styles from './styles.module.scss';
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
import {
  generateImage,
  GenerateInput,
  generateWithWait,
  getTemplates,
} from '../../utils/backendHelper';
import { fileToDataURI } from '../../utils/fileHelper';

import bg1 from '../../assets/bg1-thumb.jpg';
import bg2 from '../../assets/bg2-thumb.jpg';
import bg3 from '../../assets/bg3-thumb.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowRight, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import CUSelectButton from '../CUSelectButton';
import CsvModal from '../CsvModal';

import ImportFile from '../../assets/importfile.svg';
import { SaveExitModal } from '../Issuers';
import { PreviewProvider, usePreview } from '../../contexts/PreviewContext';
import CUTooltip from '../Tooltip';

import '../../assets/DatePicker.css';
import '../../assets/Calendar.css';
import { useScrollbarWidth } from '../../hooks/ScroolbarWidthHook';
import { getPickerFormat } from '../../utils/helpers';
import CUSpinner from '../CUSpinner';
import { LoginToken } from '../../utils/loginPermit';
import { Template, TemplateFeatures } from '../../interfaces/common/templates.interface';
import { Addition, IssuingIndividual } from '../../interfaces/common/token.interface';
import TemplateSelectButton from '../TemplateSelectButton';

type InstructorFields = 'name' | 'company' | 'title';

const bgList = [bg1, bg2, bg3];

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

type ButtonProps = JSX.IntrinsicElements['button'];
type InputProps = JSX.IntrinsicElements['input'];

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
  dateFormat?: any;
  displayEmployer?: any;
  employerText?: any;
  companyName?: any;
  signer?: any;
  signerTitle?: any;
  participants?: any;
  additions?: any;
}

export default function ProjectForm({ pid, step, backHandler }: FormProps) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, RemainingCerts } = useWallet();
  const { findProject, updateProject, addProject } = useProject();

  const [participants, setParticipants] = useState<Participant[]>([
    new Participant(),
    new Participant(),
  ]);
  const [renderProps, setRenderProps] = useState<RenderProps>(defaultRenderProps);
  const [certInfo, setCertInfo] = useState<CertInfo>(defaultCertInfo);
  const [projectName, setProjectName] = useState<string>('');

  const [templates, setTemplates] = useState<Template[]>();

  const [dirty, setDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState<FormErrors>({});

  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);

  const { Rendering, requestRender, LastRender, LastGeneric } = usePreview();

  const projectId = useRef<string | undefined>(pid);
  const navigate = useNavigate();
  const scrollBarWidth = useScrollbarWidth();

  const getTemplate = (): Template | undefined => {
    if (templates && templates.length) {
      const template = templates.find((e) => e.id === renderProps.template);
      if (template) return template;
    }
  };

  //reset hidden fields when changing templates
  useEffect(() => {
    const features = getTemplate()?.features;
    if (!features) return;

    if (!features.company_name) updateRenderProps({ companyName: '' });
    if (!features.expiration) updateCertInfo({ expire_date: undefined });
    if (!features.instructors) updateCertInfo({ additions: [] });
    if (!features.signer) updateRenderProps({ signer: undefined, signerTitle: undefined });
    setDirty(true);
  }, [renderProps.template]);

  // Load data from saved project
  useEffect(() => {
    if (!pid) return;
    const pInfo = findProject(pid);
    if (pInfo) {
      setParticipants(pInfo.participants);
      setRenderProps(pInfo.renderProps);
      setCertInfo(pInfo.certInfo);
      setProjectName(pInfo.project_name);
      projectId.current = pid;
    } else toast.error(`Unable to load project with ID: ${pid}`);
  }, [pid]);

  // Set Tab Title
  useEffect(() => {
    document.title = `CertUP Project - ${projectName}`;
  }, [projectName]);

  // Get templates from backend when LoginToken is available
  useEffect(() => {
    if (!LoginToken) return;
    updateTemplates(LoginToken);
  }, [LoginToken]);

  // Re-Render Peview when data changes
  useEffect(() => {
    reRender();
  }, [participants[0], renderProps, certInfo.issue_date, certInfo.expire_date]);

  const updateFormErrors = (newErrors: FormErrors) => {
    const fullErrors: FormErrors = {
      ...errors,
      ...newErrors,
    };
    setErrors(fullErrors);
  };

  const updateTemplates = async (token: LoginToken) => {
    try {
      const templates = await getTemplates(token);
      setTemplates(templates);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load templates, please try again.');
    }
  };

  const findFormErrors = (): FormErrors => {
    const { cert_name, pub_description, priv_description, issue_date, expire_date } = certInfo;
    const {
      certTitle,
      displayDob,
      dateFormat,
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

    if (expire_date && new Date() > expire_date) {
      newErrors = { ...newErrors, expire_date: 'Expire date can not be in the past.' };
      toast.error('Expire date can not be in the past.');
    }

    if (!certTitle)
      newErrors = {
        ...newErrors,
        certTitle: 'Please enter a title to be displayed on the certificate image',
      };

    if (!companyName && getTemplate()?.features.company_name)
      newErrors = {
        ...newErrors,
        companyName: 'Please enter a company name to be displayed on the certificate image',
      };

    if (!signer && getTemplate()?.features.signer)
      newErrors = {
        ...newErrors,
        signer: 'Please enter a signer name to be displayed on the certificate image',
      };

    if (!signerTitle && getTemplate()?.features.signer_title)
      newErrors = { ...newErrors, signerTitle: 'Please enter a title for the certificate signer' };

    let dobError = false;
    for (let i = 0; i < participants.length; i++) {
      let participantErrors = {};
      const participant = participants[i];

      if (!participant.name) participantErrors = { name: true };
      if (!participant.surname) participantErrors = { ...participantErrors, surname: true };
      if (!participant.dob) participantErrors = { ...participantErrors, dob: true };
      else if (participant.dob > new Date()) {
        toast.error(
          <>
            Participant Birth Date can not be in the future.
            <br /> {`Check participant ${participant.name} ${participant.surname}`}
          </>,
        );
        participantErrors = { ...participantErrors, dob: true };
        dobError = true;
      }
      if (!participant.cert_num) participantErrors = { ...participantErrors, cert_num: true };

      // If no participant errors for this participant, delete it from newErrors
      if (!Object.keys(participantErrors).length) {
        if (newErrors.participants) delete newErrors.participants[i];
        // Otherwise set the new participant errors in newErrors
      } else
        newErrors = {
          ...newErrors,
          participants: { ...newErrors.participants, [i]: participantErrors },
        };
    }

    // If no participant errors, delete the empty array
    if (newErrors.participants && !Object.keys(newErrors.participants).length)
      delete newErrors.participants;

    console.log('Errors:', newErrors);
    if (!newErrors.expire_date && !dobError && Object.keys(newErrors).length > 0)
      toast.error('Please complete all required fields.');
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
      additions: certInfo.additions,
    };
    const rprops: RenderProps = {
      ...renderProps,
      //template: '2',
    };

    // this is only used for Save, so we want to use the GenericRender since the image is stored unencrypted
    return new Project({
      _id: projectId.current,
      owner: Address,
      project_name: projectName,
      lastPreview: LastGeneric,
      participants: participants,
      certInfo: cinfo,
      renderProps: rprops,
    });
  };

  const handleLogoChange = async (uri: string | undefined) => {
    setDirty(true);
    updateRenderProps({ companyLogoUri: uri });
  };

  const handleSigChange = async (uri: string | undefined) => {
    setDirty(true);
    updateRenderProps({ signerSignatureUri: uri });
  };

  const reRender = () => {
    const input: GenerateInput = {
      renderProps: renderProps,
      certInfo: certInfo,
      participant: participantToRender(participants[0]),
    };
    requestRender({
      id: renderProps.template,
      layoutId: renderProps.templateLayout,
      input,
    });
  };

  const handleBack = () => {
    if (!dirty) backHandler();
    else setShowExitModal(true);
  };

  function updateDobFormat(value: string): void {
    if (!value) {
      updateRenderProps({
        displayDob: false,
        dateFormat: value,
      });
    } else {
      updateRenderProps({
        displayDob: true,
        dateFormat: value,
      });
    }
  }

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

      if (participants.length > 100) {
        toast.error('Projects are currently limited to 100 participants.');
        return;
      }

      const newErrors = findFormErrors();
      // Conditional logic:
      if (Object.keys(newErrors).length > 0) {
        // We got errors!
        setErrors(newErrors);
        return;
      }

      await handleSave();
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
    if (participants.length > 100) {
      toast.error('Projects are currently limited to 100 participants.');
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
    if (participants.length >= 100) {
      toast.error('Projects are currently limited to 100 participants.');
      return;
    }
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
        participant.surname = value || '';
        break;
      case 'dob': {
        if (!date) throw new Error('date must be set when field is "dob"');
        participant.dob = date;
        break;
      }
      case 'cert_num':
        participant.cert_num = value || '';
        break;
    }
    setParticipants(newAry);
    setDirty(true);
  };

  const addInstructor = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const blankAddition: Addition = {
      addition_type: 'Instructor',
      individual: {
        name: '',
        title: '',
        company: '',
      },
    };

    const newAdditions = [...certInfo.additions, blankAddition];
    updateCertInfo({ additions: newAdditions });
    setDirty(true);
  };

  const deleteInstructor = async (index: number) => {
    const newAry = [...certInfo.additions];
    newAry.splice(index, 1);
    updateCertInfo({ additions: newAry });
    setDirty(true);
  };

  const changeInstructor = async (index: number, field: InstructorFields, value?: string) => {
    const newAry = [...certInfo.additions];
    const addition = newAry[index];
    const individual: IssuingIndividual = addition.individual || { name: '' };
    switch (field) {
      case 'name':
        individual.name = value || '';
        break;
      case 'company':
        individual.company = value || '';
        break;
      case 'title': {
        individual.title = value || '';
        break;
      }
    }
    updateCertInfo({ additions: newAry });
    setDirty(true);
  };

  const changeExpireDate = (newDate: Date) => {
    // if (new Date() > newDate) {
    //   const newErrors: FormErrors = {
    //     expire_date: 'Expire date can not be in the past.',
    //   };
    //   updateFormErrors(newErrors);
    //   toast.error('Expire date can not be in the past.');
    // } else {
    //   const newErrors: FormErrors = {
    //     expire_date: undefined,
    //   };
    //   updateFormErrors(newErrors);
    updateCertInfo({ expire_date: newDate });
    // }
  };

  const onPick = (image: PickImage) => {
    updateRenderProps({ templateBg: image.value + 1 });
  };

  return (
    <>
      <CsvModal show={showCsvModal} setShow={setShowCsvModal} setParticipants={setParticipants} />
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
      <Container fluid="lg">
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
            <Col xs={'auto'} className="text-center">
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col style={{ paddingTop: '0vh' }}>
              <Row className="mb-4">
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
              </Row>
              {!!(templates && templates.length > 1) && (
                <>
                  <Row>
                    <p className={`${styles.medLabel}`}>Project Template</p>
                  </Row>
                  <Row className="mx-2 mb-4 align-items-stretch">
                    {templates.map((template) => {
                      return (
                        <Col xs="auto" key={template.id}>
                          <TemplateSelectButton
                            type="button"
                            selected={renderProps.template === template.id}
                            templateId={template.id}
                            onClick={() => updateRenderProps({ template: template.id })}
                          >
                            {template.name}
                          </TemplateSelectButton>
                        </Col>
                      );
                    })}
                  </Row>
                </>
              )}
            </Col>
          </Row>
          {/* \/ Participants Section \/ */}

          <Row className="mb-4">
            <Col xs={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col>
              <Row>
                <span className={`${styles.sectionTitle} mb-1`}>Participants</span>
                <hr className={styles.formHr} />
              </Row>
              {/* Labels Row */}
              <Row
                style={{ paddingRight: scrollBarWidth * 2 }}
                className="justify-content-left d-none d-md-flex"
              >
                <Col md={3} className={styles.participantLabels}>
                  Name
                </Col>
                <Col md={3} className={styles.participantLabels}>
                  Surname
                </Col>
                <Col md={3} lg={2} className={styles.participantLabels}>
                  Birth Date
                </Col>
                <Col md={2} className={styles.participantLabels}>
                  Certificate Number
                </Col>
              </Row>
              <Row className={styles.participantList}>
                {participants.map((item, index) => {
                  let pErrors;
                  if (errors.participants) pErrors = errors.participants[index];
                  return (
                    <div key={index}>
                      <Row
                        key={`participant-${index}`}
                        className={`mb-2`}
                        style={{ paddingRight: 0 }}
                      >
                        <Col xs="auto" className="d-md-none">
                          {`${index + 1}.`}
                        </Col>
                        <Col>
                          <Row style={{ paddingRight: 0 }}>
                            <Form.Group
                              as={Col}
                              xs="12"
                              md="3"
                              controlId="validationCustom02"
                              className={styles.participantInput}
                            >
                              <Form.Label className="d-md-none">Name</Form.Label>
                              <Form.Control
                                required
                                value={participants[index].name}
                                onChange={(e) => changeParticipant(index, 'name', e.target.value)}
                                type="text"
                                placeholder="First name"
                                isInvalid={!!pErrors?.name}
                              />
                            </Form.Group>

                            <Form.Group
                              as={Col}
                              xs="12"
                              md="3"
                              controlId="validationCustom02"
                              className={styles.participantInput}
                            >
                              <Form.Label className="d-md-none">Surname</Form.Label>
                              <Form.Control
                                required
                                value={participants[index].surname}
                                onChange={(e) =>
                                  changeParticipant(index, 'surname', e.target.value)
                                }
                                type="text"
                                placeholder="Last name"
                                isInvalid={!!pErrors?.surname}
                              />
                            </Form.Group>

                            <Form.Group
                              as={Col}
                              xs="12"
                              md="3"
                              lg="2"
                              controlId="validationCustom02"
                              className={styles.participantInput}
                              //className="text-center"
                            >
                              <Form.Label className="d-md-none">Birth Date</Form.Label>
                              <br className="d-md-none" />
                              <DatePicker
                                value={participants[index].dob}
                                onChange={(date: Date) =>
                                  changeParticipant(index, 'dob', undefined, date)
                                }
                                clearIcon={null}
                                className={pErrors?.dob && `invalidSelection`}
                                calendarIcon={null}
                                format={getPickerFormat(renderProps.dateFormat)}
                              />
                            </Form.Group>

                            <Form.Group as={Col} xs="12" md="2" controlId="validationCustom02">
                              <Form.Label className="d-md-none">Certificate Number</Form.Label>
                              <Form.Control
                                required
                                value={participants[index].cert_num}
                                onChange={(e) =>
                                  changeParticipant(index, 'cert_num', e.target.value)
                                }
                                type="text"
                                placeholder="123456"
                                isInvalid={!!pErrors?.cert_num}
                                className={styles.participantInput}
                              />
                            </Form.Group>

                            <Col
                              xs="12"
                              md="auto"
                              className={`d-flex align-items-center ${styles.participantInput}`}
                            >
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
                                  <span className="d-inline-block d-md-none d-lg-inline-block">
                                    Delete
                                  </span>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      {index !== participants.length - 1 && (
                        <hr className="d-md-none" style={{ marginBottom: '3rem' }} />
                      )}
                    </div>
                  );
                })}
              </Row>

              <Row className="mt-2">
                <Col xs={'auto'}>
                  <CUButton
                    btnStyle="small"
                    onClick={addParticipant}
                    disabled={participants.length >= 100}
                  >
                    + Add
                  </CUButton>
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
            <Col xs={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
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
                <Col md={2} className={`${styles.participantLabels} d-flex d-md-block`}>
                  <Col xs="auto">Public Certificate Description</Col>
                  <Col xs="auto" style={{ margin: '0 .5rem' }}>
                    <CUTooltip text="An optional description that will be embedded in the public metadata of the certificate. This description will be visible to anyone with the certificate's unique ID." />
                  </Col>
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
                <Col md={2} className={`${styles.participantLabels} d-flex d-md-block`}>
                  <Col xs="auto">Private Certificate Description</Col>
                  <Col xs="auto" style={{ margin: '0 .5rem' }}>
                    <CUTooltip text="An optional description that will be embedded in the private metadata of the certificate. This description will only be visible to the recipient and anyone the recipient has granted access to." />
                  </Col>
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
                      value={certInfo.issue_date}
                      onChange={(date: Date) => updateCertInfo({ issue_date: date })}
                      clearIcon={null}
                      format={getPickerFormat(renderProps.dateFormat)}
                      className={errors.issue_date && `invalidSelection`}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {!!getTemplate()?.features.expiration && (
                <Row className="mb-4 align-items-center">
                  <Col md={2} className={styles.participantLabels}>
                    Expire Date
                  </Col>
                  <Col>
                    <Row style={{ margin: 0 }}>
                      <Form.Group
                        as={Col}
                        md="auto"
                        controlId="validationCustom02"
                        style={{ padding: 0 }}
                      >
                        <DatePicker
                          value={certInfo.expire_date}
                          onChange={(date: Date) => changeExpireDate(date)}
                          clearIcon={null}
                          format={getPickerFormat(renderProps.dateFormat)}
                          className={errors.expire_date && `invalidSelection`}
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
              )}
            </Col>
          </Row>

          {/* \/ Instructors Section \/ */}

          {getTemplate()?.features.instructors && (
            <Row className="mb-4">
              <Col xs={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
                <MiniCircle />
                <div className={styles.vr} />
              </Col>
              <Col>
                <Row>
                  <span className={`${styles.sectionTitle} mb-1`}>Instructors</span>
                  <hr className={styles.formHr} />
                </Row>
                {/* Labels Row */}
                <Row
                  style={{ paddingRight: scrollBarWidth * 2 }}
                  className="justify-content-left d-none d-md-flex px-2"
                >
                  <Col md={4} className={styles.participantLabels}>
                    Name
                  </Col>
                  <Col md={4} className={`${styles.participantLabels}`}>
                    Company
                  </Col>
                  <Col md={2} lg={2} className={styles.participantLabels}>
                    Title
                  </Col>
                </Row>
                <Row className={styles.instructorList}>
                  {certInfo.additions.map((item, index) => {
                    let aErrors;
                    if (errors.additions) aErrors = errors.participants[index];
                    return (
                      <div key={index}>
                        <Row
                          key={`addition-${index}`}
                          className={`mb-2`}
                          style={{ paddingRight: 0 }}
                        >
                          <Col xs="auto" className="d-md-none">
                            {`${index + 1}.`}
                          </Col>
                          <Col>
                            <Row style={{ paddingRight: 0 }}>
                              <Form.Group
                                as={Col}
                                xs="12"
                                md="4"
                                controlId="validationCustom02"
                                className={styles.participantInput}
                              >
                                <Form.Label className="d-md-none">Name</Form.Label>
                                <Form.Control
                                  required
                                  value={certInfo.additions[index].individual?.name}
                                  onChange={(e) => changeInstructor(index, 'name', e.target.value)}
                                  type="text"
                                  placeholder="Name"
                                  isInvalid={!!aErrors?.name}
                                />
                              </Form.Group>

                              <Form.Group
                                as={Col}
                                xs="12"
                                md="4"
                                controlId="validationCustom02"
                                className={styles.participantInput}
                              >
                                <Form.Label className="d-md-none">Company</Form.Label>
                                <Form.Control
                                  required
                                  value={certInfo.additions[index].individual?.company}
                                  onChange={(e) =>
                                    changeInstructor(index, 'company', e.target.value)
                                  }
                                  type="text"
                                  placeholder="Company"
                                  isInvalid={!!aErrors?.company}
                                />
                              </Form.Group>

                              <Form.Group as={Col} xs="12" md="2" controlId="validationCustom02">
                                <Form.Label className="d-md-none">Title</Form.Label>
                                <Form.Control
                                  required
                                  value={certInfo.additions[index].individual?.title}
                                  onChange={(e) => changeInstructor(index, 'title', e.target.value)}
                                  type="text"
                                  placeholder="Title"
                                  isInvalid={!!aErrors?.title}
                                  className={styles.participantInput}
                                />
                              </Form.Group>

                              <Col
                                xs="12"
                                md="auto"
                                className={`d-flex align-items-center ${styles.participantInput}`}
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => deleteInstructor(index)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') deleteInstructor(index);
                                  }}
                                >
                                  <div>
                                    <img src={trashImg} alt="trash" />
                                    <span className="d-inline-block d-md-none d-lg-inline-block">
                                      Delete
                                    </span>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        {index !== participants.length - 1 && (
                          <hr className="d-md-none" style={{ marginBottom: '3rem' }} />
                        )}
                      </div>
                    );
                  })}
                  {!certInfo.additions.length && (
                    <Row className="justify-content-center pt-4">
                      <Col xs="auto" style={{ color: '#696969' }}>
                        <h3>No Instructors Added</h3>
                      </Col>
                    </Row>
                  )}
                </Row>

                <Row className="mt-2">
                  <Col xs={'auto'}>
                    <CUButton
                      btnStyle="small"
                      onClick={addInstructor}
                      disabled={certInfo.additions.length >= 20}
                    >
                      + Add
                    </CUButton>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
          {/* \/ Cert Image Section \/ */}

          <Row className="mb-4">
            <Col xs={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
              <MiniCircle />
              <div className={styles.vr} />
            </Col>
            <Col>
              <Row>
                <span className={`${styles.sectionTitle} mb-1`}>Certificate Image</span>
                <hr className={styles.formHr} />
              </Row>
              {(getTemplate()?.backgrounds?.length || 0) > 1 && (
                <Row className="mb-4 align-items-center">
                  <Col md={2} className={styles.participantLabels}>
                    Background
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
              )}
              {(getTemplate()?.layouts?.length || 0) > 1 && (
                <Row className="mb-4 align-items-center">
                  <Col md={2} className={styles.participantLabels}>
                    Layout
                  </Col>
                  <Col>
                    <Row>
                      {getTemplate()?.layouts?.map((layout) => {
                        return (
                          <Col xs="auto" key={layout.id}>
                            <CUSelectButton
                              type="button"
                              selected={renderProps.templateLayout === layout.id}
                              onClick={() => updateRenderProps({ templateLayout: layout.id })}
                            >
                              {layout.name}
                            </CUSelectButton>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>
                </Row>
              )}
              {!!getTemplate()?.features.company_name && (
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
              )}
              {!!getTemplate()?.features.logo && (
                <Row className="mb-4 align-items-center">
                  <Col md={2} className={styles.participantLabels}>
                    Company Logo
                  </Col>
                  <Col md="auto">
                    <ImageDropzone
                      set={handleLogoChange}
                      externalUri={renderProps.companyLogoUri}
                    />
                  </Col>
                </Row>
              )}
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
              {!!getTemplate()?.features.dob && (
                <Row className="mb-4 align-items-center">
                  <Col md={2} className={styles.participantLabels}>
                    <Row className={`mx-0 ${styles.tooltipLabel}`}>
                      <Col xs="auto" className="px-0">
                        Display DOB
                      </Col>
                      <Col xs="auto" className="px-2">
                        <CUTooltip text="Choose if you want to display the participant's date of birth on the certificate image." />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Row>
                      <Form.Group as={Col} md="2" controlId="validationCustom02">
                        {/* <Form.Control
                        required
                        value={'1'}
                        onChange={(e) => updateRenderProps({ line3Text: e.target.value })}
                        type="select"
                        //placeholder="has completed Advanced Financial Training"
                      > */}
                        <Form.Select
                          aria-label="Select Date of Birth display format"
                          value={renderProps.displayDob.toString()}
                          //onChange={(e) => updateDobFormat(e.target.value)}
                          onChange={(e) =>
                            updateRenderProps({
                              displayDob: e.target.value === 'true' ? true : false,
                            })
                          }
                        >
                          <option value="true">Show</option>
                          <option value="false">Hide</option>
                        </Form.Select>
                      </Form.Group>
                    </Row>
                  </Col>
                </Row>
              )}
              {!!getTemplate()?.features.line2 && (
                <Row className="mb-4 align-items-center">
                  <Col md={2} className={styles.participantLabels}>
                    <Row className={`mx-0 ${styles.tooltipLabel}`}>
                      <Col xs="auto" className="px-0">
                        Additional Line 2 Text
                      </Col>
                      <Col xs="auto" className="px-2">
                        <CUTooltip
                          text={`Choose if you want to add extra text to the second line, e.g. "Employed at CertUP" or "Attending CertUP University". This text will be displayed after the participant's name and DOB (if shown).`}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Row>
                      <Form.Group as={Col} md="2" controlId="validationCustom02">
                        <Form.Select
                          aria-label="Select if Date of Birth should be displayed"
                          value={renderProps.displayEmployer?.toString()}
                          onChange={(e) =>
                            updateRenderProps({
                              displayEmployer: e.target.value === 'true' ? true : false,
                            })
                          }
                        >
                          <option value="true">Custom</option>
                          <option value="false">None</option>
                        </Form.Select>
                      </Form.Group>
                      {renderProps.displayEmployer && (
                        <Form.Group as={Col} md="6" controlId="validationCustom02">
                          <Form.Control
                            required
                            value={renderProps.employerText}
                            onChange={(e) => updateRenderProps({ employerText: e.target.value })}
                            type="text"
                            placeholder="Employed at: "
                          />
                        </Form.Group>
                      )}
                    </Row>
                  </Col>
                </Row>
              )}
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
              {!!getTemplate()?.features.signer && (
                <>
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
                        <Form.Control.Feedback type="invalid">
                          {errors.signer}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mb-4 align-items-center">
                    <Col md={2} className={styles.participantLabels}>
                      Signature
                    </Col>
                    <Col>
                      <ImageDropzone
                        set={handleSigChange}
                        externalUri={renderProps.signerSignatureUri}
                      />
                    </Col>
                  </Row>
                  {!!getTemplate()?.features.signer_title && (
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
                  )}
                </>
              )}
              <Row className="mb-4 align-items-center">
                <Col md={2} className={styles.participantLabels}>
                  Date Format
                </Col>
                <Col>
                  <Form.Group as={Col} md="3" controlId="validationCustom02">
                    {/* <Form.Control
                      required
                      value={'1'}
                      onChange={(e) => updateRenderProps({ line3Text: e.target.value })}
                      type="select"
                      //placeholder="has completed Advanced Financial Training"
                    > */}
                    <Form.Select
                      aria-label="Select Date of Birth display format"
                      value={renderProps.dateFormat}
                      onChange={(e) => updateRenderProps({ dateFormat: e.target.value })}
                    >
                      <option value="en-US">MM/DD/YYYY</option>
                      <option value="en-GB">DD/MM/YYYY</option>
                      <option value="nl">YYYY/MM/DD</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* \/ Preview Section \/ */}

          <Row className="mb-2">
            <Col xs={'auto'} className="text-center" style={{ paddingTop: '5px' }}>
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
                <Image src={LastRender} fluid={true} />
                {Rendering ? (
                  <div className={styles.previewLoading}>
                    <CUSpinner size="xxl" />
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
            <Col xs="6" sm="5" lg="4" xl="3">
              <CUButton disabled={false} fill={true} onClick={handleSave}>
                <Row className="justify-content-space-between text-center">
                  <Col xs={2} style={{ padding: '0px' }}>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                  </Col>
                  <Col style={{ padding: '0px', textAlign: 'center' }}>Save Project</Col>
                  {/* <Col xs={"auto"} md={2} style={{ padding: '0px' }} className="d-none d-md-block">
                    {' '}
                  </Col> */}
                </Row>
              </CUButton>
            </Col>
            <Col xs="6" sm="5" lg="4" xl="3">
              <CUButton disabled={false} fill={true} onClick={scrtPayment} role="button">
                <Row className="justify-content-space-between">
                  <Col xs={1} style={{ padding: '0px' }} className="d-none d-lg-inline-block">
                    {' '}
                  </Col>
                  <Col xs={10} lg={9} style={{ padding: '0px' }}>
                    Proceed to Payment
                  </Col>
                  <Col xs={2} style={{ padding: '0px', textAlign: 'right' }}>
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
