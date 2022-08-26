import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ItemProvider, ProjectProvider, WalletProvider } from './contexts';
import { Home, Error, About, Clients, Access, ViewCert, Payment } from './pages/';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'react-coinbase-commerce/dist/coinbase-commerce-button.css';

import './App.scss';
import Guide from './pages/Guide';
import Issuers from './pages/Issuers';
import AddCredit from './pages/AddCredit';
import Mint from './pages/Mint';
import { NftProvider } from './contexts/NftContext';
import Profile from './pages/Profile';

function App() {
  return (
    <WalletProvider>
      <ProjectProvider>
        <NftProvider>
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
                  <Route path="/access" element={<Access />} />
                  <Route path="/access/:tokenid" element={<ViewCert />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Error />} />
                </>
              ) : null}
            </Routes>
          </BrowserRouter>
        </NftProvider>
      </ProjectProvider>
    </WalletProvider>
  );
}

export default App;
