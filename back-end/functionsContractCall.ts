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
} from './network';
import { ContractType } from './functionsReadOnly';
import { contractMapping, functionMapping } from './contracts';
import { Pox4SignatureTopic, StackingClient } from '@stacks/stacking';

const contractNetwork =
  network === 'mainnet'
    ? new StacksMainnet({ url: apiUrl[development][network] })
    : network === 'testnet'
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
  const options: SignedContractCallOptions = {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderKey: privateKey,
    validateWithAbi: true,
    network: contractNetwork,
    postConditions,
    postConditionMode: PostConditionMode.Allow, // change to deny
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
  const postConditions: PostCondition[] = [];
  let response: StacksTransaction = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.updateSCBalances,
    [],
    postConditions,
    fee,
    nonce,
  );
  console.log('update sc balance transaction response is: ', response);
  return response;
};

const createOperatorSig = (
  rewardCycle: number,
  authId: number,
  topic: Pox4SignatureTopic,
): string => {
  // should be the Stacks' address of the deployer, not the liquidity provider of the stacking pool SC
  return stackingClient.signPoxSignature({
    signerPrivateKey: createStacksPrivateKey(privateKey),
    rewardCycle: rewardCycle,
    period: 1,
    topic: topic,
    poxAddress: poxAddress,
    authId: authId,
    maxAmount: Number.MAX_SAFE_INTEGER,
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
  const functionArgs: ClarityValue[] = [
    Cl.uint(currentCycle),
    Cl.some(Cl.bufferFromHex(signerSig)),
    Cl.buffer(getPublicKey(createStacksPrivateKey(privateKey)).data),
    Cl.uint(Number.MAX_SAFE_INTEGER),
    Cl.uint(authId),
  ];
  let response: StacksTransaction = await contractCallFunction(
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
): Promise<StacksTransaction> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  for (const blockheight in blockheights) {
    CVBlockHeights.push(Cl.uint(blockheight));
  }
  let response: StacksTransaction = await contractCallFunction(
    contractType,
    functionMapping[contractType].publicFunctions.batchRewardDistribution,
    [Cl.list(CVBlockHeights)],
    [],
  );
  console.log('update sc balance transaction response is: ', response);
  return response;
};
