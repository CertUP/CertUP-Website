import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider, WalletProvider } from './contexts';
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
import Contact from './pages/Contact';
import ProjectReview from './pages/ProjectReview';
import { IssuerProvider } from './contexts/IssuerContext';
import { useEffect } from 'react';
import Operators from './pages/Operators';
import Pricing from './pages/Pricing';

const whip003 = `
[chains.secret-network]
namespace = "cosmos"
reference = "${process.env.REACT_APP_CHAIN_ID}"
label = "Secret Network"
bech32s = "secret"

[coins.scrt]
chain = "cosmos:${process.env.REACT_APP_CHAIN_ID}"
slip44 = 529
symbol = "SCRT"
label = "Secret"

[contracts.sSCRT]
chain = "cosmos:${process.env.REACT_APP_CHAIN_ID}"
address = "${process.env.REACT_APP_SNIP20_ADDR}"
label = "Secret SCRT"
[contracts.sSCRT.interfaces.snip20]
symbol = "SSCRT"

[contracts.manager]
chain = "cosmos:${process.env.REACT_APP_CHAIN_ID}"
address = "${process.env.REACT_APP_MANAGER_ADDR}"
label = "CertUP Manager"

[contracts.721]
chain = "cosmos:${process.env.REACT_APP_CHAIN_ID}"
address = "${process.env.REACT_APP_NFT_ADDR}"
label = "CertUP Certificates"
[contracts.sSCRT.interfaces.snip721]
`;

function App() {
  useEffect(() => {
    const script = document.createElement('script');

    script.type = 'application/toml';
    script.dataset['whip-003'] = '';
    script.innerHTML = whip003;

    const managerImg = document.createElement('link');
    managerImg.rel = 'prefetch';
    managerImg.as = 'image';
    managerImg.href = 'https://certup.net/apple-touch-icon.png';
    managerImg.dataset['caip-10'] = `cosmos:${process.env.REACT_APP_CHAIN_ID}:${process.env.REACT_APP_MANAGER_ADDR}`;

    const contractsImg = document.createElement('link');
    contractsImg.rel = 'prefetch';
    contractsImg.as = 'image';
    contractsImg.href = 'https://certup.net/apple-touch-icon.png';
    contractsImg.dataset['caip-10'] = `cosmos:${process.env.REACT_APP_CHAIN_ID}:${process.env.REACT_APP_NFT_ADDR}`;

    document.getElementsByTagName('head')[0].appendChild(managerImg);
    document.getElementsByTagName('head')[0].appendChild(contractsImg);
    document.getElementsByTagName('head')[0].appendChild(script);

    return () => {
      document.getElementsByTagName('head')[0].removeChild(managerImg);
      document.getElementsByTagName('head')[0].removeChild(contractsImg);
      document.getElementsByTagName('head')[0].removeChild(script);
    };
  }, []);
  return (
    <WalletProvider>
      <IssuerProvider>
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
              style={{ width: '360px' }}
            />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/issuers" element={<Issuers />} />
                <Route path="/issuers/review/:projectid" element={<ProjectReview />} />
                <Route path="/addCredit" element={<AddCredit />} />
                <Route path="/generate" element={<Mint />} />
                <Route path="/access" element={<Access />} />
                <Route path="/claim" element={<Access />} />
                <Route path="/access/:tokenid" element={<ViewCert />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<Error />} />
                <Route path="/operator" element={<Operators />} />
                <Route path="/pricing" element={<Pricing />} />
              </Routes>
            </BrowserRouter>
          </NftProvider>
        </ProjectProvider>
      </IssuerProvider>
    </WalletProvider>
  );
}

export default App;
