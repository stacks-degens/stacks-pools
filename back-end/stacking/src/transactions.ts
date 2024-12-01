import { Pox4SignatureTopic, StackingClient } from '@stacks/stacking';
import {
  POOL_CONTRACT_ADDRESS,
  CONTRACT_ADMIN_PRIVATE_KEY,
  SIGNER_PRIVATE_KEY,
  STACKS_NETWORK_INSTANCE,
} from './consts';
import {
  AnchorMode,
  broadcastTransaction,
  bufferCV,
  callReadOnlyFunction,
  createStacksPrivateKey,
  cvToJSON,
  makeContractCall,
  optionalCVOf,
  principalCV,
  uintCV,
} from '@stacks/transactions';
import secp256k1 from 'secp256k1';

export const getAreBalancesComputed = async (cycle: number) => {
  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');
  const senderAddress = contractAddress || '';
  const functionName = 'updated-balances-given-cycle';

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [uintCV(cycle)],
    network: STACKS_NETWORK_INSTANCE,
    senderAddress,
  };

  const areBalancesUpdatedCV = await callReadOnlyFunction(options);
  return cvToJSON(areBalancesUpdatedCV).value;
};

export const computeBalances = async () => {
  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'update-sc-balances',
    functionArgs: [],
    senderKey: CONTRACT_ADMIN_PRIVATE_KEY || '',
    network: STACKS_NETWORK_INSTANCE,
    postConditions: [],
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(
    transaction,
    STACKS_NETWORK_INSTANCE
  );

  return broadcastResponse.txid;
};

export const acceptDelegation = async (
  stacker: string,
  amount: number,
  cycles: number,
  nonce: bigint
) => {
  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'delegate-stack-stx',
    functionArgs: [principalCV(stacker)],
    senderKey: CONTRACT_ADMIN_PRIVATE_KEY || '',
    network: STACKS_NETWORK_INSTANCE,
    postConditions: [],
    anchorMode: AnchorMode.Any,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(
    transaction,
    STACKS_NETWORK_INSTANCE
  );

  return broadcastResponse.txid;
};

export const extendDelegation = async (
  stacker: string,
  extendCount: number,
  nonce: bigint
) => {
  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'delegate-stack-stx',
    functionArgs: [principalCV(stacker)],
    senderKey: CONTRACT_ADMIN_PRIVATE_KEY || '',
    network: STACKS_NETWORK_INSTANCE,
    postConditions: [],
    anchorMode: AnchorMode.Any,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(
    transaction,
    STACKS_NETWORK_INSTANCE
  );

  return broadcastResponse.txid;
};

export const increaseDelegation = async (
  stacker: string,
  increaseBy: number,
  nonce: bigint
) => {
  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'delegate-stack-stx',
    functionArgs: [principalCV(stacker)],
    senderKey: CONTRACT_ADMIN_PRIVATE_KEY || '',
    network: STACKS_NETWORK_INSTANCE,
    postConditions: [],
    anchorMode: AnchorMode.Any,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(
    transaction,
    STACKS_NETWORK_INSTANCE
  );

  return broadcastResponse.txid;
};

export const commitDelegation = async (
  poxAddress: string,
  rewardCycle: number,
  nonce: bigint,
  poolClient: StackingClient
) => {
  const { signerKey, signerSignature, authId, maxAmount } =
    await generateSignature(
      poolClient,
      Pox4SignatureTopic.AggregateCommit,
      poxAddress,
      rewardCycle,
      1
    );

  const cvSignature = optionalCVOf(
    bufferCV(Uint8Array.from(Buffer.from(signerSignature, 'hex')))
  );
  const cvSignerKey = bufferCV(Uint8Array.from(Buffer.from(signerKey, 'hex')));

  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'maybe-stack-aggregation-commit',
    functionArgs: [
      uintCV(rewardCycle - 1),
      cvSignature,
      cvSignerKey,
      uintCV(maxAmount),
      uintCV(authId),
    ],
    senderKey: CONTRACT_ADMIN_PRIVATE_KEY || '',
    network: STACKS_NETWORK_INSTANCE,
    postConditions: [],
    anchorMode: AnchorMode.Any,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(
    transaction,
    STACKS_NETWORK_INSTANCE
  );

  return broadcastResponse.txid;
};

export const increaseCommitment = async (
  poxAddress: string,
  rewardCycle: number,
  rewardIndex: number,
  nonce: bigint,
  poolClient: StackingClient
) => {
  const { signerKey, signerSignature, authId, maxAmount } =
    await generateSignature(
      poolClient,
      Pox4SignatureTopic.AggregateIncrease,
      poxAddress,
      rewardCycle,
      1
    );

  const cvSignature = optionalCVOf(
    bufferCV(Uint8Array.from(Buffer.from(signerSignature, 'hex')))
  );
  const cvSignerKey = bufferCV(Uint8Array.from(Buffer.from(signerKey, 'hex')));

  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'maybe-stack-aggregation-commit',
    functionArgs: [
      uintCV(rewardCycle - 1),
      cvSignature,
      cvSignerKey,
      uintCV(maxAmount),
      uintCV(authId),
    ],
    senderKey: CONTRACT_ADMIN_PRIVATE_KEY || '',
    network: STACKS_NETWORK_INSTANCE,
    postConditions: [],
    anchorMode: AnchorMode.Any,
    nonce,
  };

  const transaction = await makeContractCall(txOptions);

  const broadcastResponse = await broadcastTransaction(
    transaction,
    STACKS_NETWORK_INSTANCE
  );

  return broadcastResponse.txid;
};

export const generateSignature = async (
  poolClient: StackingClient,
  topic: Pox4SignatureTopic,
  poxAddress: string,
  rewardCycle: number,
  period: number
) => {
  await sleep(10);

  const signerKey = convertPrivateKeyToPublicKey(SIGNER_PRIVATE_KEY as string);
  const maxAmount = '340282366920938463463374607431768211455'; // Translates to 0xffffffffffffffffffffffffffffffff, biggest uIntCV possible
  const authId = Date.now();

  const signerSignature = poolClient.signPoxSignature({
    topic,
    poxAddress,
    rewardCycle,
    period,
    signerPrivateKey: createStacksPrivateKey(SIGNER_PRIVATE_KEY as string),
    maxAmount,
    authId,
  });

  return {
    signerKey,
    signerSignature,
    maxAmount,
    authId,
  };
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const convertPrivateKeyToPublicKey = (privateKeyHex: string) => {
  const privateKeyWithFlag = Buffer.from(privateKeyHex, 'hex');
  const privateKey = privateKeyWithFlag.subarray(0, 32);
  const publicKey = secp256k1.publicKeyCreate(privateKey);
  return Buffer.from(publicKey).toString('hex');
};
