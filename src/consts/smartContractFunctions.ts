import { StacksMocknet, StacksMainnet, StacksTestnet } from '@stacks/network';
import { network, transactionUrl } from './network';
import { contractMapping, functionMapping } from './contract';
import { openContractCall, FinishedTxData } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  ClarityValue,
  stringCV,
  uintCV,
  boolCV,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  makeContractSTXPostCondition,
  STXPostCondition,
  noneCV,
  bufferCV,
} from '@stacks/transactions';
import { convertPrincipalToArg, convertStringToArg } from './converter';
import forge from 'node-forge';
import RIPEMD160 from 'ripemd160';
// const forge = require('node-forge');

// // Calculate RIPEMD-160 hash
// function hash160(data) {

// }

// // Example usage
// const str = 'Hello, world!';
// const buffer = Buffer.from(str, 'utf8');
// const hash = hash160(buffer);
// console.log('RIPEMD-160 Hash:', hash);
const contractNetwork =
  network === 'mainnet' ? new StacksMainnet() : network === 'testnet' ? new StacksTestnet() : new StacksMocknet();

const CallFunctions = (
  type: 'mining' | 'stacking' | 'pox',
  function_args: ClarityValue[],
  contractFunctionName: string,
  post_condition_args: STXPostCondition[]
) => {
  const options = {
    network: contractNetwork,
    anchorMode: AnchorMode.Any,
    contractAddress: contractMapping[type][network].contractAddress,
    contractName: contractMapping[type][network].contractName,
    functionName: contractFunctionName,
    functionArgs: function_args,
    postConditionMode: PostConditionMode.Deny,
    postConditions: post_condition_args,
    onFinish: (data: FinishedTxData) => {
      console.log(transactionUrl[network](data.txId).explorerUrl);
      console.log(transactionUrl[network](data.txId).apiUrl);
    },
    onCancel: () => {
      console.log('onCancel:', 'Transaction was canceled');
    },
  };
  openContractCall(options);
};

const createPostConditionSTXTransferToContract = (userAddress: string, conditionAmount: number) => {
  const postConditionAddress = userAddress;
  const postConditionCode = FungibleConditionCode.Equal;
  const postConditionAmount = conditionAmount;

  return makeStandardSTXPostCondition(postConditionAddress, postConditionCode, postConditionAmount);
};

const createPostConditionSTXTransferFromContract = (conditionAmount: number, type: 'mining' | 'stacking') => {
  const postConditionAddress = contractMapping[type][network].contractAddress;
  const postConditionContract = contractMapping[type][network].contractName;
  const postConditionCode = FungibleConditionCode.Equal;
  const postConditionAmount = conditionAmount;

  return makeContractSTXPostCondition(
    postConditionAddress,
    postConditionContract,
    postConditionCode,
    postConditionAmount
  );
};

// vote-positive-join-request
// args: (miner-to-vote principal)
// what does it do: When an user asks to join, they will be placed in a waiting list. With this function, you can vote for him to
//                  join the miners list.

export const ContractVotePositiveJoinMining = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  const type = 'mining';
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.votePositiveJoinRequest, []);
};

// vote-negative-join-request
// args: (miner-to-vote principal)
// what does it do: When an user asks to join, they will be placed in a waiting list. With this function, you can vote against him
//                  joining the miners list.

export const ContractVoteNegativeJoinMining = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  const type = 'mining';
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.voteNegativeJoinRequest, []);
};

// try-enter-pool
// args: none
// what does it do: It tries moving the user that called the function from waiting to pending list
//                  (the user needs to pass the positive votes threshold)

export const ContractTryEnterPoolMining = () => {
  const type = 'mining';
  CallFunctions(type, [], functionMapping[type].publicFunctions.tryEnterPool, []);
};

// ask-to-join
// args: (btc-address principal)
// what does it do: This function adds the user passed as argument to the waiting list

export const ContractAskToJoinMining = (args: string) => {
  const convertedArgs = [stringCV(args, 'ascii')];
  const type = 'mining';
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.askToJoin, []);
};

// deposit-stx
// args: (amount uint)
// what does it do: deposits stx into user's account

export const ContractDepositSTXMining = (amount: number, userAddress: string) => {
  const type = 'mining';
  const convertedArgs = [uintCV(amount * 1000000)];
  const postConditions = createPostConditionSTXTransferToContract(userAddress, amount * 1000000);
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.depositStx, [postConditions]);
};

// withdraw-stx
// args: (amount uint)
// what does it do: withdraws stx from user's account

export const ContractWithdrawSTXMining = (amount: number) => {
  const type = 'mining';
  const convertedArgs = [uintCV(amount * 1000000)];
  const postConditions = createPostConditionSTXTransferFromContract(amount * 1000000, type);
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.withdrawStx, [postConditions]);
};

// reward-distribution
// args: (block-number uint)
// what does it do: distributes rewards for a given block

export const ContractRewardDistributionMining = (blockHeight: number) => {
  const type = 'mining';
  const convertedArgs = [uintCV(blockHeight)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.rewardDistribution, []);
};

// add-pending-miners-to-pool
// args: none
// what does it do: It adds all the pending miners from pending list to pool

export const ContractAddPending = () => {
  const type = 'mining';
  CallFunctions(type, [], functionMapping[type].publicFunctions.addPendingMinersToPool, []);
};

// leave-pool
// args: none
// what does it do: makes the user leave the mining pool

export const ContractLeavePoolMining = () => {
  const type = 'mining';
  CallFunctions(type, [], functionMapping[type].publicFunctions.leavePool, []);
};

// propose-removal
// args: (miner-to-remove principal)
// what does it do: propose a miner to be removed from the pool

export const ContractProposeRemovalMining = (args: string) => {
  const type = 'mining';
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.proposeRemoval, []);
};

// vote-positive-remove-request
// args: (miner-to-vote principal)
// what does it do: add 1 to the positive votes to remove the user passed as argument

export const ContractVotePositiveRemoveMining = (args: string) => {
  const type = 'mining';
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.votePositiveRemoveRequest, []);
};

// vote-negative-remove-request
// args: (miner-to-vote principal)
// what does it do: add 1 to the negative votes to remove the user passed as argument

export const ContractVoteNegativeRemoveMining = (args: string) => {
  const type = 'mining';
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.voteNegativeRemoveRequest, []);
};

// start-vote-notifier
// args: none
// what does it do: starts the vote to elect a notifier

export const ContractStartVoteNotifier = () => {
  const type = 'mining';
  CallFunctions(type, [], functionMapping[type].publicFunctions.startVoteNotifier, []);
};

// end-vote-notifier
// args: none
// what does it do: ends the vote for the notifier election

export const ContractEndVoteNotifier = () => {
  const type = 'mining';
  CallFunctions(type, [], functionMapping[type].publicFunctions.endVoteNotifier, []);
};

// vote-notifier
// args: (voted-notifier principal)
// what does it do: adds a vote to the given notifier

export const ContractVoteForNotifier = (votedNotifier: string) => {
  const type = 'mining';
  const convertedArgs = [convertPrincipalToArg(votedNotifier)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.voteNotifier, []);
};

// warn-miner
// args: (miner principal)
// what does it do: warns the user passed as argument

export const ContractWarnMiner = (warnedMiner: string) => {
  const type = 'mining';
  const convertedArgs = [convertPrincipalToArg(warnedMiner)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.warnMiner, []);
};

// set-my-btc-address
// args: (new-btc-address  (string-ascii 42))
// what does it do: changed the btc address to the one given as arg

export const ContractChangeBtcAddressMining = (args: string) => {
  const type = 'mining';
  const convertedArgs = [convertStringToArg(args)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.setMyBtcAddress, []);
};

// set-auto-exchange
// args: bool value
// what does it do: switches the state of auto-exchange to the given value

export const ContractSetAutoExchangeMining = (value: boolean) => {
  const type = 'mining';
  const convertedArgs = [boolCV(value)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.setAutoExchange, []);
};

// delegate-stx
// args: (amount uint)
// what does it do: delegate stx

export const ContractDelegateSTXStacking = (amount: number, userAddress: string) => {
  const type = 'stacking';
  const convertedArgs = [uintCV(amount * 1000000)];
  // const postConditions = createPostConditionSTXTransferToContract(userAddress, amount * 1000000);
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.delegateStx, []);
};

// leave-pool
// args: none
// what does it do: makes the user leave the stacking pool

export const ContractLeavePoolStacking = () => {
  const type = 'stacking';
  CallFunctions(type, [], functionMapping[type].publicFunctions.leavePool, []);
};

// reward-distribution
// args: (rewarded-burn-block uint)
// what does it do: distributes rewards for a given block

export const ContractRewardDistributionStacking = (blockHeight: number) => {
  const type = 'stacking';
  const convertedArgs = [uintCV(blockHeight)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.rewardDistribution, []);
};

export const ContractUpdateScBalancesStacking = () => {
  const type = 'stacking';
  CallFunctions(type, [], functionMapping[type].publicFunctions.updateScBalances, []);
};

//deposit-stx-liquidity-provider
// args: (amount uint)
// what does it do: deposits stx into user's account

export const ContractDepositSTXStacking = (amount: number, userAddress: string) => {
  const type = 'stacking';
  const convertedArgs = [uintCV(amount * 1000000)];
  const postConditions = createPostConditionSTXTransferToContract(userAddress, amount * 1000000);
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.depositStx, [postConditions]);
};

//set-liquidity-provider
// args: (new principal address)
// what does it do: sets a new provider

export const ContractSetNewLiquidityProvider = (newProvider: string) => {
  const type = 'stacking';
  const convertedArgs = [convertPrincipalToArg(newProvider)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.setLiquidityProvider, []);
};

export const ContractSetNewBtcPoxAddress = (publicKey: string) => {};
//   const type = 'stacking';
//   // const pubkey = '02e8f7dc91e49a577ce9ea8989c7184aea8886fe5250f02120dc6f98e3619679b0';
//   const version = '00';
//   const versionBuffer = stringToUint8Array(version);
//   const pubKeyBuffer = stringToUint8Array(publicKey);

//   console.log('pubKeyBuffer, versionBuffer', pubKeyBuffer, versionBuffer);
//   console.log('hash160', hash160(pubKeyBuffer));
//   // const functionArgs = [bufferCV(Uint8Array.from(versionBuffer)), bufferCV(Uint8Array.from(hash160(pubKeyBuffer)))];

//   // CallFunctions(type, functionArgs, functionMapping[type].publicFunctions.setPoolPoxAddress, []);
// };

// const hash160 = (pubKeyBuffer: any) => {
//   // => 0df020ba32aa9b8b904471ff582ce6b579bf8bc8
//   const md = forge.md.sha256.create();
//   md.update(pubKeyBuffer);
//   const hash = md.digest().toHex();
//   console.log(new RIPEMD160().update(hash).digest('hex'));

//   return new RIPEMD160().update(hash).digest('hex');
// };

// function stringToUint8Array(str: string) {
//   const encoder = new TextEncoder();
//   return encoder.encode(str);
// }

// reserve-funds-future-rewards
// args: (amount uint)
// what does it do: deposits stx into user's account

export const ContractReserveFundsFutureRewardsStacking = (amount: number, userAddress: string) => {
  const type = 'stacking';
  const convertedArgs = [uintCV(amount * 1000000)];
  const postConditions = createPostConditionSTXTransferToContract(userAddress, amount * 1000000);
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.lockInPool, [postConditions]);
};

//unlock-extra-reserved-funds
// args: none
// what does it do: deposits stx into user's account

export const ContractUnlockExtraReserveFundsStacking = () => {
  const type = 'stacking';
  CallFunctions(type, [], functionMapping[type].publicFunctions.unlockExtraStxInPool, []);
};

//allow-contract-caller
// args: (principal address)
// what does it do: allows to join pool for stacking

export const ContractAllowInPoolPoxScStacking = () => {
  const type = 'pox';
  const convertedArgs = [
    convertPrincipalToArg(
      `${contractMapping['stacking'][network].contractAddress}.${contractMapping['stacking'][network].contractName}`
    ),
    noneCV(),
  ];
  // console.log(address);
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.allowContractCaller, []);
};

//join-stacking-pool
// args: none
// what does it do: It tries moving the user that called the function into stacking pool

export const ContractJoinPoolStacking = () => {
  const type = 'stacking';
  CallFunctions(type, [], functionMapping[type].publicFunctions.tryEnterPool, []);
};

//revoke-delegate-stx
// args: none
// what does it do: ??

export const ContractRevokeDelegateStacking = () => {
  const type = 'pox';
  CallFunctions(type, [], functionMapping[type].publicFunctions.revokeDelegate, []);
};

//disallow-contract-caller
// args: (principal address)
// what does it do: allows to join pool for stacking

export const ContractDisallowContractCallerStacking = (address: string) => {
  const type = 'pox';
  const convertedArgs = [convertPrincipalToArg(address)];
  CallFunctions(type, convertedArgs, functionMapping[type].publicFunctions.disallowContractCaller, []);
};
