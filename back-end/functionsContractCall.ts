import {
  AnchorMode,
  broadcastTransaction,
  Cl,
  ClarityValue,
  createStacksPrivateKey,
  estimateTransactionFeeWithFallback,
  getPublicKey,
  makeContractCall,
  PostCondition,
  PostConditionMode,
  PrincipalCV,
  SignedContractCallOptions,
  TxBroadcastResult,
  UIntCV,
} from '@stacks/transactions';
import {
  StacksMainnet,
  StacksTestnet,
  StacksDevnet,
  createApiKeyMiddleware,
  createFetchFn,
} from '@stacks/network';
import {
  apiKey,
  apiUrl,
  development,
  network,
  poxAddress,
  privateKey,
  signerPrivateKey,
  transactionUrl,
} from './network';
import { ContractType, readOnlyGetStackersList } from './functionsReadOnly';
import { contractMapping, functionMapping } from './contracts';
import { Pox4SignatureTopic, StackingClient } from '@stacks/stacking';
import { maxAmount } from './consts';
import { eventData, logData, LogTypeMessage } from './fileLocalData';

const myApiMiddleware = createApiKeyMiddleware({ apiKey: apiKey });
const myFetchFn = createFetchFn(myApiMiddleware);

const contractNetwork =
  network === 'mainnet'
    ? new StacksMainnet({
        url: apiUrl[development][network],
        fetchFn: myFetchFn,
      })
    : network === 'testnet' || network === 'nakamotoTestnet'
      ? new StacksTestnet({ url: apiUrl[development][network] })
      : new StacksDevnet({ url: apiUrl[development][network] });
const stackingClient = new StackingClient(
  contractMapping.stacking[network].owner,
  contractNetwork,
);

const contractCallFunction = async (
  type: ContractType,
  functionName: string,
  functionArgs: ClarityValue[],
  postConditions: PostCondition[],
  fee: bigint = -1n,
  nonce: bigint = -1n,
): Promise<TxBroadcastResult> => {
  const contractAddress = contractMapping[type][network].contractAddress;
  const contractName = contractMapping[type][network].contractName;
  // TODO: change to deny
  const postConditionMode =
    functionName ===
    functionMapping.stacking.publicFunctions.batchRewardDistribution
      ? PostConditionMode.Allow
      : PostConditionMode.Deny;
  let options: SignedContractCallOptions = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    senderKey: privateKey,
    validateWithAbi: true,
    network: contractNetwork,
    postConditionMode: postConditionMode,
    postConditions: postConditions,
    anchorMode: AnchorMode.Any,
  };

  let tx = await makeContractCall(options);
  const feeEstimate = await estimateTransactionFeeWithFallback(
    tx,
    contractNetwork,
  );

  if (fee !== -1n) options.fee = fee;
  else if (feeEstimate < 500000n) options.fee = feeEstimate;
  else options.fee = 100001n;
  if (nonce !== -1n) options.nonce = nonce;

  tx = await makeContractCall(options);
  return await broadcastTransaction(tx, contractNetwork);
};

export const contractCallFunctionUpdateSCBalances = async (
  fee: bigint = -1n,
  nonce: bigint = -1n,
): Promise<TxBroadcastResult> => {
  const contractType = ContractType.stacking;
  let response: TxBroadcastResult = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.updateSCBalances,
    [],
    [],
    fee,
    nonce,
  );
  return response;
};

const createOperatorSig = (
  rewardCycle: number,
  authId: number,
  topic: Pox4SignatureTopic,
): string => {
  // has to be the Stacks' address of the deployer, not the liquidity provider of the stacking pool SC
  return stackingClient.signPoxSignature({
    signerPrivateKey: createStacksPrivateKey(signerPrivateKey),
    rewardCycle: rewardCycle + 1,
    period: 1,
    topic: topic,
    poxAddress: poxAddress,
    authId: authId,
    maxAmount: maxAmount,
  });
};

// (current-cycle uint)
// (signer-sig (optional (buff 65)))
// (signer-pubkey (buff 33))
// (max-allowed-amount uint)
// (auth-id uint))
export const contractCallFunctionMaybeStackAggregationCommit = async (
  currentCycle: number,
  topic: Pox4SignatureTopic,
  fee: bigint = -1n,
): Promise<TxBroadcastResult> => {
  const contractType = ContractType.stacking;
  const postConditions: PostCondition[] = [];
  const authId: number = Date.now() * 10 + Math.floor(Math.random() * 10);
  const signerSig: string = createOperatorSig(currentCycle, authId, topic);
  // console.log('signer sig ', signerSig);
  // console.log(
  //   'signer pubkey ',
  //   Cl.buffer(getPublicKey(createStacksPrivateKey(signerPrivateKey)).data),
  // );
  // console.log('max amount ', maxAmount);
  // console.log('auth id ', authId);
  const functionArgs: ClarityValue[] = [
    Cl.uint(currentCycle),
    Cl.some(Cl.bufferFromHex(signerSig)),
    Cl.buffer(getPublicKey(createStacksPrivateKey(signerPrivateKey)).data),
    Cl.uint(maxAmount),
    Cl.uint(authId),
  ];
  let response: TxBroadcastResult = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.maybeStackAggregationCommit,
    functionArgs,
    postConditions,
    fee,
  );
  return response;
};

export const contractCallFunctionDistributeRewards = async (
  blockheights: number[],
): Promise<TxBroadcastResult> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  // TODO: add a lot of postConditions from SC to each address STX will be sent to (and the amount)
  for (const blockheight of blockheights) {
    CVBlockHeights.push(Cl.uint(blockheight));
  }
  let response: TxBroadcastResult = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.batchRewardDistribution,
    [Cl.list(CVBlockHeights)],
    [],
  );
  return response;
};

export const contractCallFunctionDelegateStackStxMany = async (
  stackersAddresses: string[],
): Promise<TxBroadcastResult> => {
  const contractType = ContractType.stacking;
  const CVPrincipalStackersAddresses: PrincipalCV[] = [];
  for (const address of stackersAddresses) {
    CVPrincipalStackersAddresses.push(Cl.principal(address));
  }
  let response: TxBroadcastResult = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.delegateStackStxMany,
    [Cl.list(CVPrincipalStackersAddresses)],
    [],
  );
  return response;
};

// contractCallFunctionMaybeStackAggregationCommit(
//   10,
//   Pox4SignatureTopic.AggregateCommit,
//   1000000n,
// );

// const txResponse = await contractCallFunctionMaybeStackAggregationCommit(
//   10,
//   Pox4SignatureTopic.AggregateCommit,
//   1000000n,
// );

// console.log('response is ', txResponse);
// console.log('txid is ', txResponse.txid());

// write to file data when succesful broadcast
const logSuccesfulBroadcast = (
  txBroadcastResult: TxBroadcastResult,
  functionName: string,
) => {
  eventData(
    LogTypeMessage.Info,
    `${functionName} tx ${txBroadcastResult.txid}
      api link: ${transactionUrl(txBroadcastResult.txid).apiUrl}
      explorer link: ${transactionUrl(txBroadcastResult.txid).explorerUrl}`,
  );
};

const logRejectedBroadcast = (
  txBroadcastResult: TxBroadcastResult,
  functionName: string,
) => {
  eventData(
    LogTypeMessage.Err,
    `${functionName} failed broadcast tx ${txBroadcastResult.txid}
        error: ${txBroadcastResult.error}
        reason: ${txBroadcastResult.reason}
        reason data: ${txBroadcastResult.reason_data}`,
  );
};

export const logContractCallBroadcast = (
  txBroadcastResult: TxBroadcastResult,
  functionName: string,
) => {
  if (txBroadcastResult.reason !== undefined) {
    logRejectedBroadcast(txBroadcastResult, functionName);
  } else {
    logSuccesfulBroadcast(txBroadcastResult, functionName);
  }
};
