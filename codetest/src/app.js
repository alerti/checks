import React, { useState } from 'react';

function LandingPage({ connectKeplrAccount }) {
  return (
    <div>
      <h1>Connect your Keplr Account</h1>
      <button onClick={() => connectKeplrAccount('sample_address')}>Connect</button>
    </div>
  );
}

function MissionControlPage() {
  return <div>Mission Control Page</div>;
}

function DashboardPage({ userAddress }) {
  return <div>Dashboard Page for {userAddress}</div>;
}

function App() {
  const [page, setPage] = useState(0);
  const [userAddress, setUserAddress] = useState('');
  
  const connectKeplrAccount = (address) => {
    if (!address) {
      alert('Please provide a valid address');
      return;
    }
    setUserAddress(address);
    setPage(1);
  };
  
  let currentPage;
  switch (page) {
    case 0:
      currentPage = <LandingPage connectKeplrAccount={connectKeplrAccount} />;
      break;
    case 1:
      currentPage = <MissionControlPage />;
      break;
    case 2:
      currentPage = <DashboardPage userAddress={userAddress} />;
      break;
    default:
      currentPage = <LandingPage connectKeplrAccount={connectKeplrAccount} />;
  }
  
  return currentPage;
}

export default App;
