import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
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

export default function AddCertsWidget({ issuerProfile, refresh }: { issuerProfile: Issuer; refresh: any }) {
  const { ProcessingTx } = useWallet();
  const { addCerts } = useExecute();

  const [numCerts, setNumCerts] = useState<number>(0);
  const [loadingAdd, setLoadingAdd] = useState(false);

  useEffect(() => {
    setNumCerts(0);
  }, [issuerProfile]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingAdd(true);
    const toastRef = toast.loading('Transaction Processing...');

    try {
      const result = await addCerts({ issuer: issuerProfile.addr, num_certs: numCerts, toastRef });
      console.log('Add Result:', result);
    } catch (error: any) {
      toast.update(toastRef, {
        render: error.toString(),
        type: 'error',
        isLoading: false,
        autoClose: 10000,
      });
      console.error(error);
    }
    setLoadingAdd(false);
    refresh();
  };

  return (
    <Form noValidate className={styles.widgetInputForm} onSubmit={handleAdd}>
      <Row className="text-center mt-2">
        <h5>Add Certificate Credits</h5>
      </Row>
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={6}>
          <InputGroup>
            <InputGroup.Text
              onClick={() => setNumCerts(numCerts === 0 ? 0 : numCerts - 1)}
              className={!loadingAdd && numCerts > 0 ? styles.pointer : styles.noPointer}
            >
              -
            </InputGroup.Text>
            <Form.Control
              required
              className="text-center"
              value={numCerts.toString()}
              onChange={(e) => {
                setNumCerts(parseInt(e.target.value, 10));
              }}
            />
            <InputGroup.Text
              onClick={() => setNumCerts(numCerts + 1)}
              className={!loadingAdd ? styles.pointer : undefined}
            >
              +
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
      <Row className="justify-content-center mt-2">
        <Col xs="auto">
          <CUButton btnStyle="square" type="submit" disabled={ProcessingTx || loadingAdd}>
            {loadingAdd ? (
              <>
                <span>Adding Credits</span>&nbsp;
                <CUSpinner size="xs" />
              </>
            ) : (
              'Add Credits'
            )}
          </CUButton>
        </Col>
      </Row>
    </Form>
  );
}
