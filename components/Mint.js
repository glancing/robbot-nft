import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { ethers, utils } from 'ethers'

import contract from '../RobBot.json';
const contractAddress = '0xa63C6E67E1100aEF623D03B8d91a1a4Eb1c2eFe5';

export default function Mint() {

  const [loggedIn, setLogIn] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [ethPrice, setEthPrice] = useState(0.03);
  const [totalSupply, setTotalSupply] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [stateContract, setContract] = useState(null);

  const onQuantityChange = (e) => {
    let value = e.target.value;
    if (value < 0 || value > 20) return;
    setQuantity(parseInt(e.target.value));
    setEthPrice(Math.round(100 * (0.03 * value))/100);
  }

  const loginToWallet = async () => {
    try {
      if (loggedIn) return;
      
      if (!window.ethereum) return toast.error("No MetaMask Installed!", { style: { fontSize: '10px' } });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const robBotContract = new ethers.Contract(contractAddress, contract.abi, provider.getSigner());
      setContract(robBotContract);
      
      const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (acc) setWalletAddress(acc);

      const network = await provider.getNetwork();
      if (network.name !== 'rinkeby') return toast.error("Not Connected to Rinkeby!", { style: { fontSize: '10px' } });
     
      const supply = await robBotContract.totalSupply();
      setTotalSupply(supply.toString());
  
      const price = await robBotContract.getPrice();
      setEthPrice(utils.formatEther(price));

      setLogIn(true);
      toast.success('Logged In!', { style: { fontSize: '10px' }});
    } catch (e) {
      console.log(e);
    }
  }

  
  const mintRobot = async () => {
    if (!stateContract || (quantity == 0)) return;
    try {
      await stateContract.mintToken(quantity, { value: utils.parseEther(ethPrice.toString()) });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="mint">
      <Toaster/>
      <div className="container">
        <div className="mint-inner">
          <h1>mint</h1>
          {loggedIn && 
            <p>Wallet {walletAddress} connected</p>
          }
          <div className="mint-section">
            { loggedIn ? 
              <div className="mint-button">
                <h3>{totalSupply ?? '~'}/3000 minted</h3>
                <button className="mint-input" onClick={mintRobot}>mint {ethPrice} eth</button>
                <div className="mint-quantity">
                  <label>
                    quantity:
                    <input type="number" value={quantity} placeholder="1" name="quantity" onChange={onQuantityChange}/>
                  </label>
                </div> 
              </div>
              : 
              <button className="mint-input" onClick={loginToWallet}>Log In</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}