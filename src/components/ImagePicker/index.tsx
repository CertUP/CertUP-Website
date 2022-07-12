import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import './index.scss';
import Image from './image';

export interface PickImage {
  src: string;
  value: number;
}

interface Props {
  images: PickImage[];
  onPick: (a: any) => void;
  selected?: PickImage;
}

interface State {
  picked: Map<any, any>;
}

class ImagePicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleImageClick = this.handleImageClick.bind(this);
    this.renderImage = this.renderImage.bind(this);

    if (props.selected) {
      this.state = {
        picked: Map({ 0: props.selected.src }),
      };
    } else {
      this.state = {
        picked: Map(),
      };
    }

    console.log('state', this.state);
    console.log('selected', this.props.selected);
  }

  // handleSelected(selected) {

  // }

  handleImageClick(image: PickImage) {
    console.log('flicked', image);
    const { onPick } = this.props;
    const pickedImage = Map();
    const newerPickedImage = pickedImage.set(image.value.toString(), image.src);

    this.setState({ picked: newerPickedImage }, () => {
      console.log('state changed', this.state);
    });

    const pickedImageToArray: PickImage[] = [];

    newerPickedImage.map((image, i) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pickedImageToArray.push({ src: image, value: parseInt(i, 10) }),
    );

    onPick(pickedImageToArray[0]);
  }

  renderImage(image: PickImage, i: number) {
    // console.log('rendering', image.value, this.state.picked.has(image.value.toString()));
    return (
      <Image
        src={image.src}
        isSelected={this.state.picked.has(image.value.toString())}
        onImageClick={() => this.handleImageClick(image)}
        key={i}
      />
    );
  }

  render() {
    const { images } = this.props;
    return (
      <div className="image_picker">
        {images.map(this.renderImage)}
        <div className="clear" />
      </div>
    );
  }
}

export default ImagePicker;
