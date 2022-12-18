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
import { Template } from '../../../interfaces/common/templates.interface';
import { getAllowedTemplates, getTemplates, setAllowedTemplates } from '../../../utils/backendHelper';
import { ToastProps } from '../../../utils/toastHelper';

interface FormErrors {
  name?: any;
  verified_name?: any;
}

interface AuthItem {
  id: string;
  name: string;
  restricted: boolean;
  authorized: boolean;
}

export default function TemplateAccessWidget({ issuerProfile, refresh }: { issuerProfile: Issuer; refresh: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [templateList, setTemplateList] = useState<AuthItem[]>([]);

  const { LoginToken } = useWallet();

  // Reset when clicking a different issuer
  useEffect(() => {
    setIsEditing(false);
  }, [issuerProfile]);

  useEffect(() => {
    refreshTemplateData();
  }, [LoginToken, issuerProfile]);

  const refreshTemplateData = async () => {
    if (!LoginToken) return;
    const templates = await getTemplates(LoginToken);
    const allowed = await getAllowedTemplates(LoginToken, issuerProfile.addr);

    const authlist = templates.map((template) => {
      return {
        id: template.id,
        name: template.name,
        restricted: template.restricted,
        authorized: allowed.find((a) => a.template_id === template.id) ? true : false,
      };
    });
    setTemplateList(authlist.sort((a, b) => Number(a.restricted) - Number(b.restricted)));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!LoginToken) {
      toast.error('No login token, try visiting the issuers page.');
      return;
    }

    setLoadingUpdate(true);
    const toastRef = toast.loading('Saving...');
    try {
      const allowed = templateList.filter((t) => t.restricted && t.authorized).map((t) => t.id);
      console.log(allowed);

      const result = await setAllowedTemplates(LoginToken, issuerProfile.addr, allowed);
      console.log(result);

      toast.update(toastRef, new ToastProps('Success', 'success'));
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
    setIsEditing(false);
  };

  const handleChange = (id: string, value: boolean) => {
    console.log(id, value);
    const newList: AuthItem[] = [...templateList];
    const index = newList.findIndex((t) => t.id === id);
    if (index) {
      newList[index].authorized = value;
    }
    setTemplateList(newList);
  };

  return (
    <Form noValidate className={styles.widgetInputForm} onSubmit={handleUpdate}>
      <Row className="text-center mt-2">
        <h5>Template Access</h5>
      </Row>
      <Row className="justify-content-center">
        <Col xs="auto">
          {templateList.map((template, i) => {
            return (
              <Row key={`checkbox-${i}`}>
                <Form.Check
                  type="checkbox"
                  id={template.id}
                  label={template.name}
                  disabled={!isEditing || !template.restricted}
                  checked={template.restricted ? templateList[i].authorized : true}
                  onChange={(e) => handleChange(template.id, e.target.checked)}
                />
              </Row>
            );
          })}
        </Col>
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
              <CUButton btnStyle="square" type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? (
                  <>
                    <span>Saving</span>&nbsp;
                    <CUSpinner size="xs" />
                  </>
                ) : (
                  'Save'
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
