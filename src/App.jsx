import { useState } from 'react';
import { getContract } from './blockchain';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('manufacturer');
  const [status, setStatus] = useState('');
  
  // Registration State
  const [regId, setRegId] = useState('');
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');

  // Verification State
  const [verifyResult, setVerifyResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('Processing registration...');
    try {
      const contract = await getContract();
      const tx = await contract.registerProduct(regId, brand, name);
      await tx.wait();
      
      setStatus('Product registered securely!');
      setRegId(''); setBrand(''); setName('');
    } catch (error) {
      console.error(error);
      setStatus('Registration failed. Ensure Owner account is connected.');
    }
  };

  const handleAutomaticScan = async (scannedId) => {
    if (!scannedId) return;
    setStatus(`Verifying ID: ${scannedId}...`);
    setVerifyResult('');
    
    try {
      const contract = await getContract();
      const result = await contract.verifyAndSell.staticCall(scannedId);
      
      if (result === "GENUINE - VERIFIED") {
         const tx = await contract.verifyAndSell(scannedId);
         await tx.wait();
      }
      
      setVerifyResult(result);
      setStatus('Verification complete.');
    } catch (error) {
      console.error(error);
      setStatus('Verification error. Invalid product data.');
    }
  };

  return (
    <>
      {/* 3D Shader Background */}
      <div className="shader-background">
        <ShaderGradientCanvas style={{ position: 'absolute', pointerEvents: 'none' }}>
          <ShaderGradient 
            animate="on" 
            axesHelper="off" 
            brightness={0.9} 
            cAzimuthAngle={180} 
            cDistance={3.6} 
            cPolarAngle={90} 
            cameraZoom={1} 
            color1="#92939f" 
            color2="#7c7e80" 
            color3="#beb7b5" 
            destination="onCanvas" 
            embedMode="off" 
            envPreset="city" 
            format="gif" 
            fov={45} 
            frameRate={10} 
            gizmoHelper="hide" 
            grain="on" 
            lightType="3d" 
            pixelDensity={0.9} 
            positionX={-1.4} 
            positionY={0} 
            positionZ={0} 
            range="disabled" 
            rangeEnd={40} 
            rangeStart={0} 
            reflection={0.1} 
            rotationX={0} 
            rotationY={10} 
            rotationZ={50} 
            shader="defaults" 
            type="plane" 
            uAmplitude={1} 
            uDensity={1.8} 
            uFrequency={5.5} 
            uSpeed={0.4} 
            uStrength={4.5} 
            uTime={0} 
            wireframe={false} 
          />
        </ShaderGradientCanvas>
      </div>

      {/* Navbar - Title Top Left, Toggle Top Right */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Fraudulent Product Identification System</h1>
        </div>

        <div className="service-toggle">
          <button 
            className={`toggle-btn ${activeTab === 'manufacturer' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manufacturer'); setVerifyResult(''); setStatus(''); }}
          >
            Manufacturer Portal
          </button>
          <button 
            className={`toggle-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => { setActiveTab('scanner'); setVerifyResult(''); setStatus(''); setIsScanning(true); }}
          >
            Consumer Scanner
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {status && (
          <div style={{ textAlign: 'center', marginBottom: '16px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
            {status}
          </div>
        )}

        {/* View 1: Manufacturer */}
        {activeTab === 'manufacturer' && (
          <div className="card">
            <h2>Manufacturer Portal</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input placeholder="Unique Product ID (e.g., 101)" value={regId} onChange={(e) => setRegId(e.target.value)} required />
              </div>
              <div className="form-group">
                <input placeholder="Brand Name" value={brand} onChange={(e) => setBrand(e.target.value)} required />
              </div>
              <div className="form-group">
                <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <button type="submit">Register Item Securely</button>
            </form>
          </div>
        )}

        {/* View 2: Consumer Scanner (Auto-Scan Only) */}
        {activeTab === 'scanner' && (
          <div className="card">
            <h2>Consumer & Retail Scanner</h2>
            
            <button 
              type="button"
              onClick={() => setIsScanning(!isScanning)} 
              className="success"
            >
              {isScanning ? 'Close Camera' : '📷 Open Camera to Scan QR'}
            </button>

            {isScanning && (
              <div className="scanner-container">
                <Scanner 
                  onResult={(text) => {
                    const scannedText = typeof text === 'object' ? text?.text : text;
                    if (scannedText) {
                      setIsScanning(false);
                      handleAutomaticScan(scannedText);
                    }
                  }}
                  onError={(error) => console.log(error?.message)}
                />
              </div>
            )}
            
            {verifyResult && (
              <div className={`result-box ${verifyResult.includes('GENUINE') ? 'result-genuine' : 'result-fake'}`}>
                RESULT: {verifyResult}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;