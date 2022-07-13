import React, { useEffect, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import xlsx from 'node-xlsx';
import { Participant } from '../../interfaces/Project';

interface props {
  setParticipants: (a: any) => void;
}

interface ExFile extends File {
  preview?: string;
  path?: string;
}

const xlsToParticipants = (input: string[][]): Participant[] => {
  const participants: Participant[] = [];

  const nameColumn = input[0].findIndex((c) => c === 'Name');
  if (nameColumn === -1) throw new Error("Didnt find column 'Name'");

  const surnameColumn = input[0].findIndex((c) => c === 'Surname');
  if (surnameColumn === -1) throw new Error("Didnt find column 'SurName'");

  const dobColumn = input[0].findIndex((c) => c === 'DOB');
  if (dobColumn === -1) throw new Error("Didnt find column 'DOB'");

  const certnumColumn = input[0].findIndex((c) => c === 'CertNum');
  if (certnumColumn === -1) throw new Error("Didnt find column 'CertNum'");

  for (let i = 0; i < input.length; i++) {
    if (!i) continue;

    const row = input[i];
    const participant = new Participant(
      row[nameColumn],
      row[surnameColumn],
      new Date(row[dobColumn]),
      row[certnumColumn],
    );
    console.log(participant);
    participants.push(participant);
  }

  return participants;
};

export default function CsvDropzone({ setParticipants }: props) {
  const [files, setFiles] = useState<ExFile[]>([]);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );

      const file = acceptedFiles[0];
      console.log(file);
      if (file.name.includes('xlsx')) {
        const worksheet = xlsx.parse(await file.arrayBuffer(), {
          type: 'buffer',
          cellDates: true,
          cellHTML: false,
          dateNF: 'yyyy-mm-dd hh:mm:ss',
          cellNF: true,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const sheet1: string[][] = worksheet[0].data;
        const result = xlsToParticipants(sheet1);
        console.log(result);

        setParticipants(result);
      }

      //set(acceptedFiles[0]);
    },
  });

  const acceptedFileItems = acceptedFiles.map((file: FileWithPath) => {
    return (
      <li key={file.path || file.name}>
        {file.path} - {file.size / 1000} kb
      </li>
    );
  });

  // const fileRejectionItems = fileRejections.map(({ file, errors }) => (
  //   <li key={file.path}>
  //     {file.path} - {file.size} bytes
  //     <ul>
  //       {errors.map((e) => (
  //         <li key={e.code}>{e.message}</li>
  //       ))}
  //     </ul>
  //   </li>
  // ));

  return (
    <section className={styles.logoContainer}>
      <div {...getRootProps({ className: 'dropzone' })} style={{ cursor: 'pointer' }}>
        <input {...getInputProps()} />
        {files.length ? null : (
          <div className={styles.dropzoneContainer}>
            <Col xs={2} className="text-center">
              <FontAwesomeIcon size="lg" icon={faUpload} />
            </Col>
            <Col>
              <div>
                <p className={styles.dropzoneText}>
                  Drop a file here
                  <br />
                  or click to select a file
                  <br />
                  <span className={styles.dropzoneSubText}>
                    (.csv and .xlsx files are accepted)
                  </span>
                </p>
              </div>
            </Col>
          </div>
        )}
      </div>
      <aside>
        {files.length && files[0].path ? (
          <span style={{ fontSize: '14px', textAlign: 'left' }}>{files[0].path}</span>
        ) : null}
      </aside>
    </section>
  );
}
