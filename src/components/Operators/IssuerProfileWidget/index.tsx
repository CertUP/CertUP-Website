import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styles from './styles.module.scss';

import CUButton from '../../CUButton';
import CUSpinner from '../../CUSpinner';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useWallet } from '../../../contexts';
import { useIssuer } from '../../../contexts/IssuerContext';
import useExecute from '../../../hooks/ExecuteHook';
import { Issuer } from '../../../interfaces/manager';

interface FormErrors {
  name?: any;
  verified_name?: any;
}

export default function ProfileWidget({ issuerProfile, refresh }: { issuerProfile: Issuer; refresh: any }) {
  const { ProcessingTx } = useWallet();
  const { editIssuer } = useExecute();

  const [isEditing, setIsEditing] = useState(false);
  const [newIssuerData, setNewIssuerData] = useState<Issuer>(issuerProfile);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Rest when clicking a different issuer
  useEffect(() => {
    setNewIssuerData(issuerProfile);
    setIsEditing(false);
  }, [issuerProfile]);

  const updateIssuerData = (changedData: any) => {
    setNewIssuerData({
      ...newIssuerData,
      ...changedData,
    });
  };

  const checkFormErrors = (): boolean => {
    const { name, verified, verified_name } = newIssuerData;

    let newErrors: FormErrors = {};
    if (!name || name === '') newErrors = { ...newErrors, name: `Please enter a company or individual's name.` };

    if (verified && (!verified_name || verified_name === ''))
      newErrors = {
        ...newErrors,
        verified_name: `Verified issuers must have their verified company name entered.`,
      };

    console.log('Errors:', newErrors);
    // return newErrors;
    if (Object.keys(newErrors).length > 0) {
      // We got errors!
      setErrors(newErrors);
      return true;
    } else {
      setErrors(newErrors);
      return false;
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkFormErrors()) return;

    setLoadingUpdate(true);
    const toastRef = toast.loading('Transaction Processing...');
    try {
      const result = await editIssuer({ ...newIssuerData, toastRef, issuer: issuerProfile.addr });
      console.log('Edit Result:', result);
    } catch (error: any) {
      toast.update(toastRef, {
        render: error.toString(),
        type: 'error',
        isLoading: false,
        autoClose: 10000,
      });
      console.error(error);
    }
    setLoadingUpdate(false);
    refresh();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setErrors({});
    setNewIssuerData(issuerProfile);
    setIsEditing(false);
  };

  return (
    <Form noValidate className={styles.widgetInputForm} onSubmit={handleUpdate}>
      <Row className="text-center mt-2">
        <h5>Issuer Profile</h5>
      </Row>
      <Row className="justify-content-center mb-2">
        <Form.Group>
          <Form.Label className={styles.formLabel}>Name</Form.Label>
          <Form.Control
            required
            value={newIssuerData?.name}
            onChange={(e) => {
              updateIssuerData({ name: e.target.value });
            }}
            type="text"
            placeholder="Corporate Finance Institute"
            disabled={loadingUpdate || !isEditing}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>
      </Row>

      <Row className="justify-content-center mb-2">
        <Form.Group>
          <Form.Label className={styles.formLabel}>Website</Form.Label>

          <Form.Control
            required
            value={newIssuerData?.website || ''}
            onChange={(e) => {
              updateIssuerData({ website: e.target.value });
            }}
            type="text"
            placeholder="https://cfi.org"
            disabled={loadingUpdate || !isEditing}
          />
        </Form.Group>
      </Row>

      <Row className="justify-content-center mb-2">
        <Form.Group>
          <Form.Label className={styles.formLabel}>Logo URL</Form.Label>

          <Form.Control
            required
            value={newIssuerData?.logo_img_url || ''}
            onChange={(e) => {
              updateIssuerData({ logo_img_url: e.target.value });
            }}
            type="text"
            placeholder="https://cfi.org/logo.png"
            disabled={loadingUpdate || !isEditing}
          />
        </Form.Group>
      </Row>

      <Row className="justify-content-center mb-2">
        <Form.Group>
          <Form.Label className={styles.formLabel}>Verified</Form.Label>

          <Form.Select
            value={newIssuerData.verified ? 'True' : 'False'}
            disabled={loadingUpdate || !isEditing}
            onChange={(e) => {
              updateIssuerData({ verified: e.target.value === 'True' ? true : false });
            }}
          >
            <option>False</option>
            <option>True</option>
          </Form.Select>
        </Form.Group>
      </Row>

      <Row className="justify-content-center mb-2">
        <Form.Group>
          <Form.Label className={styles.formLabel}>Verified Name (verified as)</Form.Label>

          <Form.Control
            required
            value={newIssuerData.verified_name || ''}
            onChange={(e) => {
              updateIssuerData({ verified_name: e.target.value });
            }}
            type="text"
            placeholder="Corporate Finance Institute, LLC"
            disabled={loadingUpdate || !isEditing}
            isInvalid={!!errors.verified_name}
          />

          <Form.Control.Feedback type="invalid">{errors.verified_name}</Form.Control.Feedback>
        </Form.Group>
      </Row>
      <Row className="justify-content-center mt-2">
        {isEditing ? (
          <>
            <Col xs="auto">
              <CUButton btnStyle="square" type="button" disabled={loadingUpdate} onClick={handleCancel}>
                Cancel
              </CUButton>
            </Col>
            <Col xs="auto">
              <CUButton btnStyle="square" type="submit" disabled={ProcessingTx || loadingUpdate}>
                {loadingUpdate ? (
                  <>
                    <span>Updating Profile</span>&nbsp;
                    <CUSpinner size="xs" />
                  </>
                ) : (
                  'Update Profile'
                )}
              </CUButton>
            </Col>
          </>
        ) : (
          <Col xs="auto">
            <CUButton btnStyle="square" type="button" onClick={() => setIsEditing(true)}>
              Edit
            </CUButton>
          </Col>
        )}
      </Row>
    </Form>
  );
}
