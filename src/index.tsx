import React from 'react';
import ReactDOM from 'react-dom';
import './global/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from 'react-cookie';
import LogRocket from 'logrocket';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import setupLogRocketReact from 'logrocket-react';

LogRocket.init('zo1brw/certup', {
  shouldCaptureIP: false,
  dom: {
    //textSanitizer: true,
    inputSanitizer: true,
  },
});

setupLogRocketReact(LogRocket);

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
