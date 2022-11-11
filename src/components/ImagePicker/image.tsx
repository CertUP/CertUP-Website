/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';

interface Props {
  src: any;
  isSelected: boolean;
  onImageClick: (a: any) => void;
  children?: ReactNode;
}

const ImageStyle = (width: number, height: number) => {
  return {
    width,
    height,
    objectFit: 'cover',
  };
};

export default class Image extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { src, isSelected, onImageClick } = this.props;
    return (
      <div className={`responsive${isSelected ? ' selected' : ''}`} onClick={onImageClick}>
        <img
          src={src}
          className={`thumbnail${isSelected ? ' selected' : ''}`}
          //style={ImageStyle(150, 150)}
          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          alt="Cert Background"
        />
        <div className="checked">
          {/*<img src={imgCheck} style={{ width: 75, height: 75, objectFit: "cover" }}/>*/}
          <div className="icon" />
        </div>
      </div>
    );
  }
}
