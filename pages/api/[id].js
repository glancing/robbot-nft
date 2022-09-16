// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import metaDataArray from '../../metadata.json';
import Web3 from 'web3';
import contract from '../../RobBot.json';

export default async function handler(req, res) {
  let id = req.query.id;
  const provider = new Web3.providers.HttpProvider('FILL_IN');
  const web3Alch = new Web3(provider);
  const contractAddress = '0xa63C6E67E1100aEF623D03B8d91a1a4Eb1c2eFe5';
  const robBotContract = new web3Alch.eth.Contract(contract.abi, contractAddress);

  const totalSupply = await robBotContract.methods.totalSupply().call();

  if(parseInt(id) < totalSupply) {
    let metaData = metaDataArray[id];
    if (!metaData) {
      let emptyMetaData = {
        'name': `Rob Bot ${(parseInt(id) + 1)}`,
        'description': 'Rob Bot Test NFT',
        'external_url': '',
        'tokenId' : parseInt(id),
        'image': ``,
        'attributes': []
      }
      return res.status(200).json(emptyMetaData);
    }
    let cleanMetaData = {
      'name': metaData.name,
      'description': 'Rob Bot Test NFT',
      'external_url': '',
      'tokenId' : parseInt(id),
      'image': `https://gateway.pinata.cloud/ipfs/${metaData.imageIPFS}`,
      'attributes': metaData.attributes
    }
    res.status(200).json(cleanMetaData);
  } else {
    res.status(200).json({});
  }
}
