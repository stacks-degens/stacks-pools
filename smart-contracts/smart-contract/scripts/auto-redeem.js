import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';
import {
  broadcastTransaction,
  AnchorMode,
  makeContractCall,
  callReadOnlyFunction,
  uintCV,
  PostConditionMode,
  cvToValue,
} from '@stacks/transactions';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/// configured variables
const privateKey = process.env.PRIVATE_KEY;
const senderAddress = process.env.STACKS_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractName = process.env.CONTRACT_NAME;
const fileLatestBurnBlock = process.env.FILE_LATEST_BURN_BLOCK;
const fileRewardedBurnBlocks = process.env.FILE_REWARDED_BURN_BLOCKS;
const networkSelected = process.env.NETWORK;

if (!privateKey) throw new Error('Private key not available in ENV');
if (!senderAddress) throw new Error('Stacks Address not available in ENV');
if (!contractAddress) throw new Error('Insert Contract Address in ENV');
if (!contractName) throw new Error('Insert Contract Name in ENV');
if (!fileLatestBurnBlock) throw new Error('Insert FILE_LATEST_BURN_BLOCK in ENV');
if (!fileRewardedBurnBlocks) throw new Error('Insert FILE_REWARDED_BURN_BLOCKS in ENV');
if (!networkSelected) throw new Error('Insert NETWORK in ENV');

const checkWon = 'has-won-burn-block';
const checkAlreadyClaimed = 'already-rewarded-burn-block';
const rewardDistribution = 'reward-distribution';

const apiStacks = {
  mainnet: 'https://api.mainnet.hiro.so/v2/info',
  testnet: 'https://api.testnet.hiro.so/v2/info',
  mocknet: 'http://localhost:3999/v2/info',
};

/// API call for current burn block height
const burnHeight = await fetch(apiStacks[networkSelected])
  .then((res) => res.json())
  .then((res) => res.burn_block_height);
// console.log(burnHeight);

// @ts-ignore
const network =
  networkSelected === 'mainnet'
    ? new StacksMainnet()
    : networkSelected === 'testnet'
    ? new StacksTestnet()
    : new StacksMocknet();

/// functions used: read-onlys and contract-call
const fnCheckWon = async (burnBlock) => {
  const options = {
    contractAddress,
    contractName,
    functionName: checkWon,
    functionArgs: [uintCV(burnBlock)],
    network,
    senderAddress,
  };
  const result = await callReadOnlyFunction(options);
  return cvToValue(result);
};

const fnCheckAlreadyClaimed = async (burnBlock) => {
  const options = {
    contractAddress,
    contractName,
    functionName: checkAlreadyClaimed,
    functionArgs: [uintCV(burnBlock)],
    network,
    senderAddress,
  };
  const result = await callReadOnlyFunction(options);
  return cvToValue(result);
};

const fnRewardDistribute = async (burnBlock) => {
  const options = {
    contractAddress,
    contractName,
    functionName: rewardDistribution,
    functionArgs: [uintCV(burnBlock)],
    senderKey: privateKey,
    validateWithAbi: true,
    network,
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(options);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  const txId = broadcastResponse.txid;
  console.log('info: broadcasted tx id: ', txId);
};

/// append to rewarded burn block heights list
const fnAppendBurnBlockToFile = async (burnBlock) => {
  fs.appendFile(fileRewardedBurnBlocks, `${burnBlock.toString()}, `, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
};

/// main run
const main = async () => {
  /// read latest block height verified
  await fs.readFile(fileLatestBurnBlock, 'utf8', async (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    let latestQueriedBurnBlock = parseInt(data);
    for (
      let currentIndexBurnBlock = latestQueriedBurnBlock + 1;
      currentIndexBurnBlock <= burnHeight;
      currentIndexBurnBlock++
    ) {
      console.log('info: checked burn block height ', currentIndexBurnBlock);

      let response1 = await fnCheckWon(currentIndexBurnBlock);
      if (response1) {
        console.log('info: won by stacking pool');
        let response2 = await fnCheckAlreadyClaimed(currentIndexBurnBlock);
        if (!response2) {
          console.log('info: not already claimed');
          await fnRewardDistribute(currentIndexBurnBlock);
          await fnAppendBurnBlockToFile(currentIndexBurnBlock);
        }
      }

      // Update and write the numbers back to the file
      await fs.writeFile(fileLatestBurnBlock, currentIndexBurnBlock.toString(), 'utf8', (err) => {
        // await
        if (err) {
          console.error(`Error writing to file: ${err} at burn_block_height: ${currentIndexBurnBlock}`);
        } else {
          // console.log('Numbers updated and written to file.');
        }
      });
    }
  });
};

main();
