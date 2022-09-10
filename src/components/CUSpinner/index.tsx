// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import CustomImageLoader from 'react-custom-image-loader.';
import CU_COnly from '../../assets/cOnlySq.svg';

import styles from './styles.module.scss';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'custom';
  customSize?: number;
  style?: any;
  className?: string;
}
export const CUSpinner = ({ size, style, className, customSize = 50 }: SpinnerProps) => {
  let width = '50px';
  switch (size) {
    case 'xs':
      width = '25px';
      break;
    case 'sm':
      width = '50px';
      break;
    case 'md':
      width = '75px';
      break;
    case 'lg':
      width = '100px';
      break;
    case 'xl':
      width = '150px';
      break;
    case 'xxl':
      width = '200px';
      break;
    case 'custom':
      width = `${customSize}px`;
      break;
    default:
      width = '50px';
  }

  return (
    <>
      <CustomImageLoader
        image={CU_COnly}
        isLoaded={false}
        circle={false}
        speed={2}
        animationType={'flash'}
        style={{ width: '500px' }}
      />
      <img
        src={CU_COnly}
        style={{ width: width, animation: '2s linear 0s infinite normal none running flash' }}
        alt="Loading"
        className={className}
        //className={styles.flashAnimation}
      />
    </>
  );
};

export default CUSpinner;
