import { ethers } from 'ethers';
import ProductRegistryABI from './ProductRegistry.json';

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

export const getContract = async () => {
    if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install MetaMask.");
    }
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ProductRegistryABI.abi,
        signer
    );
    
    return contract;
};