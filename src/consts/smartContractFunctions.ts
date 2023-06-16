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
} from '@stacks/transactions';
import { convertPrincipalToArg, convertStringToArg } from './converter';

const contractNetwork =
  network === 'mainnet' ? new StacksMainnet() : network === 'testnet' ? new StacksTestnet() : new StacksMocknet();

const CallFunctions = (
  function_args: ClarityValue[],
  contractFunctionName: string,
  post_condition_args: STXPostCondition[]
) => {
  const options = {
    network: contractNetwork,
    anchorMode: AnchorMode.Any,
    contractAddress: contractMapping[network].contractAddress,
    contractName: contractMapping[network].contractName,
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

const createPostConditionSTXTransferFromContract = (conditionAmount: number) => {
  const postConditionAddress = contractMapping[network].contractAddress;
  const postConditionContract = contractMapping[network].contractName;
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

export const ContractVotePositiveJoin = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.votePositiveJoinRequest, []);
};

// vote-negative-join-request
// args: (miner-to-vote principal)
// what does it do: When an user asks to join, they will be placed in a waiting list. With this function, you can vote against him
//                  joining the miners list.

export const ContractVoteNegativeJoin = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.voteNegativeJoinRequest, []);
};

// try-enter-pool
// args: none
// what does it do: It tries moving the user that called the function from waiting to pending list
//                  (the user needs to pass the positive votes threshold)

export const ContractTryEnterPool = () => {
  CallFunctions([], functionMapping.publicFunctions.tryEnterPool, []);
};

// ask-to-join
// args: (btc-address principal)
// what does it do: This function adds the user passed as argument to the waiting list

export const ContractAskToJoin = (args: string) => {
  const convertedArgs = [stringCV(args, 'ascii')];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.askToJoin, []);
};

// deposit-stx
// args: (amount uint)
// what does it do: deposits stx into user's account

export const ContractDepositSTX = (amount: number, userAddress: string) => {
  const convertedArgs = [uintCV(amount * 1000000)];
  const postConditions = createPostConditionSTXTransferToContract(userAddress, amount * 1000000);
  CallFunctions(convertedArgs, functionMapping.publicFunctions.depositStx, [postConditions]);
};

// withdraw-stx
// args: (amount uint)
// what does it do: withdraws stx from user's account

export const ContractWithdrawSTX = (amount: number) => {
  const convertedArgs = [uintCV(amount * 1000000)];
  const postConditions = createPostConditionSTXTransferFromContract(amount * 1000000);
  CallFunctions(convertedArgs, functionMapping.publicFunctions.withdrawStx, [postConditions]);
};

// reward-distribution
// args: (block-number uint)
// what does it do: distributes rewards for a given block

export const ContractRewardDistribution = (blockHeight: number) => {
  const convertedArgs = [uintCV(blockHeight)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.rewardDistribution, []);
};

// add-pending-miners-to-pool
// args: none
// what does it do: It adds all the pending miners from pending list to pool

export const ContractAddPending = () => {
  CallFunctions([], functionMapping.publicFunctions.addPendingMinersToPool, []);
};

// leave-pool
// args: none
// what does it do: makes the user leave the mining pool

export const ContractLeavePool = () => {
  CallFunctions([], functionMapping.publicFunctions.leavePool, []);
};

// propose-removal
// args: (miner-to-remove principal)
// what does it do: propose a miner to be removed from the pool

export const ContractProposeRemoval = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.proposeRemoval, []);
};

// vote-positive-remove-request
// args: (miner-to-vote principal)
// what does it do: add 1 to the positive votes to remove the user passed as argument

export const ContractVotePositiveRemove = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.votePositiveRemoveRequest, []);
};

// vote-negative-remove-request
// args: (miner-to-vote principal)
// what does it do: add 1 to the negative votes to remove the user passed as argument

export const ContractVoteNegativeRemove = (args: string) => {
  const convertedArgs = [convertPrincipalToArg(args)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.voteNegativeRemoveRequest, []);
};

// start-vote-notifier
// args: none
// what does it do: starts the vote to elect a notifier

export const ContractStartVoteNotifier = () => {
  CallFunctions([], functionMapping.publicFunctions.startVoteNotifier, []);
};

// end-vote-notifier
// args: none
// what does it do: ends the vote for the notifier election

export const ContractEndVoteNotifier = () => {
  CallFunctions([], functionMapping.publicFunctions.endVoteNotifier, []);
};

// vote-notifier
// args: (voted-notifier principal)
// what does it do: adds a vote to the given notifier

export const ContractVoteForNotifier = (votedNotifier: string) => {
  const convertedArgs = [convertPrincipalToArg(votedNotifier)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.voteNotifier, []);
};

// warn-miner
// args: (miner principal)
// what does it do: warns the user passed as argument

export const ContractWarnMiner = (warnedMiner: string) => {
  const convertedArgs = [convertPrincipalToArg(warnedMiner)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.warnMiner, []);
};

// set-my-btc-address
// args: (new-btc-address  (string-ascii 42))
// what does it do: changed the btc address to the one given as arg

export const ContractChangeBtcAddress = (args: string) => {
  const convertedArgs = [convertStringToArg(args)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.setMyBtcAddress, []);
};

// set-auto-exchange
// args: bool value
// what does it do: switches the state of auto-exchange to the given value

export const ContractSetAutoExchange = (value: boolean) => {
  const convertedArgs = [boolCV(value)];
  CallFunctions(convertedArgs, functionMapping.publicFunctions.setAutoExchange, []);
};
