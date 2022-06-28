import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ItemProvider, WalletProvider } from './contexts';
import { Home, Error, About, Clients } from './pages/';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.scss';
import Guide from './pages/Guide';
import Issuers from './pages/Issuers';
import AddCredit from './pages/AddCredit';
import Mint from './pages/Mint';

function App() {
  return (
    <WalletProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        theme="colored"
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {!parseInt(process.env.REACT_APP_HOME_ONLY as string, 10) ? (
            <>
              <Route path="/about" element={<About />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/issuers" element={<Issuers />} />
              <Route path="/addCredit" element={<AddCredit />} />
              <Route path="/generate" element={<Mint />} />
              <Route path="*" element={<Error />} />
            </>
          ) : null}
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
