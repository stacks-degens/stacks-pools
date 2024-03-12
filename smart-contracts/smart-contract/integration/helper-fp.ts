import {
  AnchorMode,
  broadcastTransaction,
  bufferCV,
  ClarityValue,
  listCV,
  noneCV,
  PostConditionMode,
  principalCV,
  standardPrincipalCV,
  tupleCV,
  uintCV,
  makeContractCall,
  TxBroadcastResult,
} from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';
import { mainContract } from './contracts';
import { handleContractCall } from './helpers-stacking';
import { Accounts } from './constants-stacking';

interface Account {
  stxAddress: string;
  btcAddress: string;
  secretKey: string;
}

export async function broadcastJoinPool({
  nonce,
  network,
  user,
}: {
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.JoinStackingPool.name,
    functionArgs: mainContract.Functions.JoinStackingPool.args({}),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}

export async function broadcastDelegateStx({
  amountUstx,
  nonce,
  network,
  user,
}: {
  amountUstx: number;
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.DelegateStx.name,
    functionArgs: mainContract.Functions.DelegateStx.args({
      amountUstx: uintCV(amountUstx),
    }),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}

export const broadcastDelegateStackStx = async (
  user: string,
  network: StacksNetwork,
  account: Account,
  fee: number,
  nonce: number
): Promise<TxBroadcastResult> => {
  const txOptions = {
    contractAddress: Accounts.DEPLOYER.stxAddress,
    contractName: mainContract.name,
    functionName: 'delegate-stack-stx',
    functionArgs: [principalCV(user)],
    fee,
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: account.secretKey,
  };
  // @ts-ignore
  const tx = await makeContractCall(txOptions);
  // Broadcast transaction to our Devnet stacks node
  const result = await broadcastTransaction(tx, network);
  return result;
};

export async function broadcastUpdateScBalances({
  nonce,
  network,
  user,
}: {
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.UpdateScBalances.name,
    functionArgs: mainContract.Functions.UpdateScBalances.args({}),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}

export async function broadcastRewardDistribution({
  burnBlockHeight,
  nonce,
  network,
  user,
}: {
  burnBlockHeight: number;
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.RewardDistribution.name,
    functionArgs: mainContract.Functions.RewardDistribution.args({
      burnBlockHeight: uintCV(burnBlockHeight),
    }),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}

export async function broadcastDepositStxOwner({
  amountUstx,
  nonce,
  network,
  user,
}: {
  amountUstx: number;
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.DepositStxOwner.name,
    functionArgs: mainContract.Functions.DepositStxOwner.args({
      amountUstx: uintCV(amountUstx),
    }),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}

export async function broadcastDelegateStackStxMany({
  stackersLockList,
  nonce,
  network,
  user,
}: {
  stackersLockList: [string];
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let convertedList = [];
  stackersLockList.forEach((stacker) => convertedList.push(standardPrincipalCV(stacker)));

  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.DelegateStackStxMany.name,
    functionArgs: mainContract.Functions.DelegateStackStxMany.args({
      stackersLockList: listCV(convertedList),
    }),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}

export async function broadcastReserveStxOwner({
  amountUstx,
  nonce,
  network,
  user,
}: {
  amountUstx: number;
  nonce: number;
  network: StacksNetwork;
  user: { stxAddress: string; secretKey: string };
}) {
  let txOptions = {
    contractAddress: mainContract.address,
    contractName: mainContract.name,
    functionName: mainContract.Functions.ReserveFundsLiqProvider.name,
    functionArgs: mainContract.Functions.ReserveFundsLiqProvider.args({
      amountUstx: uintCV(amountUstx),
    }),
    nonce,
    network,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey: user.secretKey,
  };
  return handleContractCall({ txOptions, network });
}
