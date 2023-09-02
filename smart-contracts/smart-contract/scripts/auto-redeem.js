// ST02D2KP0630FS1BCJ7YM4TYMDH6NS9QKR0B57R3.stacking-pool
import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';
import {
  broadcastTransaction,
  publicKeyToString,
  TransactionSigner,
  pubKeyfromPrivKey,
  AnchorMode,
  makeContractCall,
  callReadOnlyFunction,
  uintCV,
  PostConditionMode,
} from '@stacks/transactions';
import fs, { appendFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const senderAddress = process.env.STACKS_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractName = process.env.CONTRACT_NAME;
const fileLatestBurnBlock = process.env.FILE_LATEST_BURN_BLOCK;
const fileRewardedBurnBlocks = process.env.FILE_REWARDED_BURN_BLOCKS;

if (!privateKey) throw new Error('Private key not available in ENV');
if (!senderAddress) throw new Error('Stacks Address not available in ENV');
if (!contractAddress) throw new Error('Insert Contract Address in ENV');
if (!contractName) throw new Error('Insert Contract Name in ENV');
if (!fileLatestBurnBlock) throw new Error('Insert FILE_LATEST_BURN_BLOCK in ENV');
if (!fileRewardedBurnBlocks) throw new Error('Insert FILE_REWARDED_BURN_BLOCKS in ENV');

const networkSelected = 'testnet';
const checkWon = 'has-won-burn-block';
const checkAlreadyClaimed = 'already-rewarded-burn-block';
const rewardDistribution = 'reward-distribution';

const burn_height = await fetch('https://api.testnet.hiro.so/v2/info')
  .then((res) => res.json())
  .then((res) => res.burn_block_height);
console.log(burn_height);

// @ts-ignore
const network =
  networkSelected === 'mainnet'
    ? new StacksMainnet()
    : networkSelected === 'testnet'
    ? new StacksTestnet()
    : new StacksMocknet();

const fnCheckWon = async (burn_block) => {
  const options = {
    contractAddress,
    contractName,
    functionName: checkWon,
    functionArgs: [uintCV(burn_block)],
    network,
    senderAddress,
  };
  const result = await callReadOnlyFunction(options);
  console.log(result);
  return result;
};

const fnCheckAlreadyClaimed = async (burn_block) => {
  const options = {
    contractAddress,
    contractName,
    functionName: checkAlreadyClaimed,
    functionArgs: [uintCV(burn_block)],
    network,
    senderAddress,
  };
  const result = await callReadOnlyFunction(options);
  console.log(result);
  return result;
};

const fnRewardDistribute = async (burn_block) => {
  const options = {
    contractAddress,
    contractName,
    functionName: rewardDistribution,
    functionArgs: [uintCV(burn_block)],
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
  console.log('tx id: ', txId);
};

// append to rewarded burn block heights list
const fnAppendBurnBlockToFile = async (burnBlock) => {
  fs.appendFile(fileRewardedBurnBlocks, `${burnBlock.toString()}, `, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
};

/// main run
const main = async () => {
  await fs.readFile(fileLatestBurnBlock, 'utf8', async (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    // Parse the number from the file
    let latestQueriedBurnBlock = parseInt(data);
    for (
      let currentIndexBurnBlock = latestQueriedBurnBlock;
      currentIndexBurnBlock <= burn_height;
      currentIndexBurnBlock++
    ) {
      console.log('number: ', currentIndexBurnBlock);

      let response1 = await fnCheckWon(currentIndexBurnBlock);
      if (response1) {
        let response2 = await fnCheckAlreadyClaimed(currentIndexBurnBlock);
        if (response2) {
          await fnRewardDistribute(currentIndexBurnBlock);
          await fnAppendBurnBlockToFile(currentIndexBurnBlock);
        }
      }

      // Update and write the numbers back to the file
      await fs.writeFile(fileLatestBurnBlock, currentIndexBurnBlock.toString(), 'utf8', (err) => {
        // await
        if (err) {
          console.error(`Error writing to file: ${err}`);
        } else {
          console.log('Numbers updated and written to file.');
        }
      });
    }
  });
};

main();
