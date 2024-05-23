import {
  AnchorMode,
  Cl,
  ClarityValue,
  createStacksPrivateKey,
  getPublicKey,
  makeContractCall,
  PostCondition,
  PostConditionMode,
  SignedContractCallOptions,
  StacksTransaction,
  UIntCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';
import {
  apiUrl,
  development,
  network,
  poxAddress,
  privateKey,
  signerPrivateKey,
} from './network';
import { ContractType } from './functionsReadOnly';
import { contractMapping, functionMapping } from './contracts';
import { Pox4SignatureTopic, StackingClient } from '@stacks/stacking';
import { maxAmount } from './consts';

const contractNetwork =
  network === 'mainnet'
    ? new StacksMainnet({ url: apiUrl[development][network] })
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
): Promise<StacksTransaction> => {
  const contractAddress = contractMapping[type][network].contractAddress;
  const contractName = contractMapping[type][network].contractName;
  // TODO: change to deny
  const postConditionMode =
    functionName ===
    functionMapping.stacking.publicFunctions.batchRewardDistribution
      ? PostConditionMode.Allow
      : PostConditionMode.Deny;
  const options: SignedContractCallOptions = {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    senderKey: privateKey,
    validateWithAbi: true,
    network: contractNetwork,
    postConditions: postConditions,
    postConditionMode: postConditionMode,
    anchorMode: AnchorMode.Any,
  };

  if (fee !== -1n) options.fee = fee;
  if (nonce !== -1n) options.nonce = nonce;
  return await makeContractCall(options);
};

export const contractCallFunctionUpdateSCBalances = async (
  fee: bigint = -1n,
  nonce: bigint = -1n,
): Promise<StacksTransaction> => {
  const contractType = ContractType.stacking;
  let response: StacksTransaction = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.updateSCBalances,
    [],
    [],
    fee,
    nonce,
  );
  // TODO: see why it never broadcasts
  // console.log('update sc balance transaction response is: ', response);
  return response;
};
const tx = await contractCallFunctionUpdateSCBalances();
console.log('tx', tx);
console.log('tx id', tx.txid());

const createOperatorSig = (
  rewardCycle: number,
  authId: number,
  topic: Pox4SignatureTopic,
): string => {
  // has to be the Stacks' address of the deployer, not the liquidity provider of the stacking pool SC
  return stackingClient.signPoxSignature({
    signerPrivateKey: createStacksPrivateKey(signerPrivateKey),
    rewardCycle: rewardCycle,
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
): Promise<StacksTransaction> => {
  const contractType = ContractType.stacking;
  const postConditions: PostCondition[] = [];
  const authId: number = Date.now() * 10 + Math.floor(Math.random() * 10);
  const signerSig: string = createOperatorSig(currentCycle, authId, topic);
  console.log('signer sig ', signerSig);
  console.log(
    'signer pubkey ',
    Cl.buffer(getPublicKey(createStacksPrivateKey(signerPrivateKey)).data),
  );
  console.log('max amount ', maxAmount);
  console.log('auth id ', authId);
  const functionArgs: ClarityValue[] = [
    Cl.uint(currentCycle),
    Cl.some(Cl.bufferFromHex(signerSig)),
    Cl.buffer(getPublicKey(createStacksPrivateKey(signerPrivateKey)).data),
    Cl.uint(maxAmount),
    Cl.uint(authId),
  ];
  let response: StacksTransaction = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.maybeStackAggregationCommit,
    functionArgs,
    postConditions,
    fee,
  );
  // return '' as any;
  return response;
};

export const contractCallFunctionDistributeRewards = async (
  blockheights: number[],
): Promise<StacksTransaction> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  // TODO: add a lot of postConditions from SC to each address STX will be sent to (and the amount)
  const postConditions: PostCondition[] = [];
  for (const blockheight in blockheights) {
    CVBlockHeights.push(Cl.uint(blockheight));
  }
  let response: StacksTransaction = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.batchRewardDistribution,
    [Cl.list(CVBlockHeights)],
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
