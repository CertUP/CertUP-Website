import React, { useEffect, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';
import { dataURLtoFile, fileToDataURI } from '../../utils/fileHelper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';

interface props {
  set: (a: string | undefined) => void;
  //external?: ExFile;
  externalUri?: string;
}

interface ExFile extends File {
  preview?: string;
  path?: string;
}

export default function ImageDropzone({ set, externalUri }: props) {
  const [files, setFiles] = useState<ExFile[]>([]);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      //set(acceptedFiles[0])
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
      returnAcceptedFile(acceptedFiles[0]);
      //set(acceptedFiles[0]);
    },
  });

  useEffect(() => {
    if (externalUri) {
      processExternalURI(externalUri);
    }
  }, []);

  const returnAcceptedFile = async (file: File) => {
    //convert URI to file object
    const dataUri = await fileToDataURI(file, file.type);
    set(dataUri);
  };

  const processExternalURI = async (externalUri: string) => {
    //convert URI to file object
    const externalFile = await dataURLtoFile(externalUri, 'Saved Image');

    const added = Object.assign(externalFile, {
      preview: URL.createObjectURL(externalFile),
    });
    console.log('External File', added);

    setFiles([added]);
  };

  const acceptedFileItems = acceptedFiles.map((file: FileWithPath) => {
    return (
      <li key={file.path || file.name}>
        {file.path} - {file.size / 1000} kb
      </li>
    );
  });

  const handleReset = () => {
    setFiles([]);
    set(undefined);
  };

  return (
    <Row>
      <Col xs="auto">
        <section className={styles.logoContainer}>
          <div {...getRootProps({ className: 'dropzone' })} style={{ cursor: 'pointer' }}>
            <input {...getInputProps()} />
            {files.length ? (
              <Image
                src={files[0].preview}
                alt=""
                fluid
                style={{ maxHeight: '100px', cursor: 'pointer' }}
              />
            ) : (
              <>
                <Image src={ChooseFile} alt="Choose File" style={{ cursor: 'pointer' }} />
              </>
            )}
          </div>
          <aside>
            {files.length && files[0].path ? (
              <span style={{ fontSize: '14px', textAlign: 'left' }}>
                {files[0].path || files[0].name}
              </span>
            ) : null}
          </aside>
        </section>
      </Col>

      <Col xs="auto" className="d-flex align-items-center">
        {!!files.length && (
          <FontAwesomeIcon
            icon={faTimesCircle}
            size="lg"
            onClick={() => handleReset()}
            style={{ cursor: 'pointer' }}
          />
        )}
      </Col>
    </Row>
  );
}
