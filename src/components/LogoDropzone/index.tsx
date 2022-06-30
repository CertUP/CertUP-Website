import React, { useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';

interface props {
  set: (a: any) => void;
}

interface ExFile extends File {
  preview?: string;
  path?: string;
}

export default function LogoDropzone({ set }: props) {
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
      set(acceptedFiles[0]);
    },
  });

  const acceptedFileItems = acceptedFiles.map((file: FileWithPath) => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
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
      <div {...getRootProps({ className: 'dropzone' })}>
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
        {files.length ? (
          <ul>
            <li key={files[0].path}>
              {files[0].path} - {files[0].size} bytes
            </li>
          </ul>
        ) : null}
      </aside>
    </section>
  );
}
