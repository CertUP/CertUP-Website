import { TypeOptions, UpdateOptions } from 'react-toastify';

const defaultTimeout = 5000;

export class ToastProps implements UpdateOptions {
  render: string;
  type?: TypeOptions;
  isLoading: boolean;
  autoClose?: number;
  closeOnClick: boolean;
  constructor(render: string, type: TypeOptions, autoClose = defaultTimeout) {
    this.render = render;
    this.type = type;
    this.isLoading = false;
    this.autoClose = autoClose;
    this.closeOnClick = true;
  }
}

export const SuccessToast = new ToastProps('Success!', 'success');
