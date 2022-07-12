import React, { useEffect, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';

interface props {
  set: (a: any) => void;
  external?: ExFile;
}

interface ExFile extends File {
  preview?: string;
  path?: string;
}

export default function LogoDropzone({ set, external }: props) {
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

  useEffect(() => {
    if (external) {
      const added = Object.assign(external, {
        preview: URL.createObjectURL(external),
      });
      console.log('external file', added);

      setFiles([added]);
    }
  }, [external]);

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
              {files[0].path} - {files[0].size / 1000} kb
            </li>
          </ul>
        ) : null}
      </aside>
    </section>
  );
}
