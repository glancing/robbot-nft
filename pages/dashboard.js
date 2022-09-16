import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { ethers, utils } from 'ethers'
import Image from 'next/image'

import contract from '../RobBot.json';
import stakingContractJson from '../RobBotStaking.json';

const contractAddress = '0xa63C6E67E1100aEF623D03B8d91a1a4Eb1c2eFe5';
const stakingAddress = '0x4C46fF4FB3ebd10466db1aE9653A563aC4A368AB';

export default function Dashboard() {

  const [loggedIn, setLogIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [stateOwnedBots, setOwnedBots] = useState([]);
  const [stateStakedBots, setStakedBots] = useState([]);
  const [stateContract, setContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [totalRewards, setTotalRewards] = useState(0);

  const setupDashboard = async (robContract, userWalletAddress) => {
    let balance = await robContract.balanceOf(userWalletAddress);
    let intBalance = parseInt(balance._hex);
    let ownedBots = [];
    for (let i = 0; i < intBalance; i++) {
      let ownedId = await robContract.tokenOfOwnerByIndex(userWalletAddress, i);
      let intOwnedId = parseInt(ownedId._hex);
      ownedBots.push(intOwnedId);
    }

    let responseArray = [];
    for (let ownedBotId of ownedBots) {
      try {
        let res = await fetch('http://localhost:3000/api/' + ownedBotId);
        let botJson = await res.json();
        responseArray.push(botJson);
      } catch (e) { }
    }

    setOwnedBots(responseArray);
  }

  const setupStaking = async (robStakeContract, userWalletAddress) => {
    console.log(userWalletAddress);
    let botsStaked = await robStakeContract.getBotsStaked(userWalletAddress);
    let stakedBotIds = [];
    let stakedTotalRewards = 0;
    for (let botStaked of botsStaked) {
      let id = parseInt(botStaked._hex);
      stakedBotIds.push(id);
      let reward = await robStakeContract.getRewardsTokenId(id);
      console.log(reward);
      stakedTotalRewards += parseInt(reward._hex);
    }
    console.log(stakedBotIds);
    let responseArray = [];
    for (let stakedBotId of stakedBotIds) {
      try {
        let res = await fetch('http://localhost:3000/api/' + stakedBotId);
        let botJson = await res.json();
        responseArray.push(botJson);
      } catch (e) { }
    }
    setTotalRewards(stakedTotalRewards);
    setStakedBots(responseArray);
  }

  const loginToWallet = async () => {
    try {
      if (loggedIn) return;
      
      if (!window.ethereum) return toast.error("No MetaMask Installed!", { style: { fontSize: '10px' } });

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const robBotContract = new ethers.Contract(contractAddress, contract.abi, provider.getSigner());
      setContract(robBotContract);
      
      const stakingRobBotContract = new ethers.Contract(stakingAddress, stakingContractJson.abi, provider.getSigner());
      setStakingContract(stakingRobBotContract);

      const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (acc) setWalletAddress(acc);

      const network = await provider.getNetwork();
      if (network.name !== 'rinkeby') return toast.error("Not Connected to Rinkeby!", { style: { fontSize: '10px' } });

      setLogIn(true);
      setupDashboard(robBotContract, acc);
      setupStaking(stakingRobBotContract, acc);
      toast.success('Logged In!', { style: { fontSize: '10px' }});
    } catch (e) {
      console.log(e);
    }
  }

  const NotLoggedIn = () => {
    return (
      <div>
        <button className="mint-input" onClick={loginToWallet}>Log In</button>
      </div>
    )
  }


  const stakeBot = async (bot) => {
    console.log(bot);
    console.log(stakingContract);
    let isApproved = await stateContract.isApprovedForAll(walletAddress, stakingAddress);
    if (!isApproved) {
      await stateContract.setApprovalForAll(stakingAddress, true);
    }
    await stakingContract.stakeRobBot([bot.tokenId]);
  }

  const unstakeBot = async (bot) => {
    console.log(bot);
    console.log(bot);
    console.log(stakingContract);
    let isApproved = await stateContract.isApprovedForAll(walletAddress, stakingAddress);
    if (!isApproved) {
      await stateContract.setApprovalForAll(stakingAddress, true);
    }
    await stakingContract.unstakeRobBots([bot.tokenId]);
  }

  const RenderBot = ({ bot, unstake }) => {
    const RenderBotImage = () => {
      if (bot.image) {
        return (
          <Image width="200" height="200" src={bot.image}/>
        )
      } else {
        return (
          <p>missing image</p>
        )
      }
    }

    return (
      <div className="ownedBot">
        <h4>{bot.name}</h4>
        <RenderBotImage/>
        <button onClick={() => unstake ? unstakeBot(bot): stakeBot(bot)}>{unstake ? 'unstake' : 'stake'}</button>
      </div>
    )
  }

  const LoggedInDash = () => {
    return (
      <div className="loggedin-dashboard">
        <div className="inventory-dashboard">
          <h2>Inventory</h2>
          <div className="bot-grid">
            {stateOwnedBots.map((bot, i) => (
              <RenderBot key={'bot-' + i} bot={bot}/>
            ))}
          </div>
        </div>
        <div className="staking-dashboard">
          <h2>Staking</h2>
          <div className="staking-information">
            <h4>Staked Rob Bots: {stateStakedBots.length}</h4>
            <h4>Rewards Per Day: {(stateStakedBots.length * 30000000000000) / 10 ** 13}</h4>
            <h4>Total Rewards: {totalRewards / 10 ** 18}</h4>
            <div className="bot-grid">
              {stateStakedBots.map((bot, i) => (
                <RenderBot key={'bot-' + i} bot={bot} unstake={true}/>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="dashboard">
      <div className="inner-dashboard">
        <div className="container">
          <h1>Dashboard</h1>
            { loggedIn ? 
              <LoggedInDash/>
              :
              <NotLoggedIn/>
            }
        </div>
      </div>
    </div>
  )
}
