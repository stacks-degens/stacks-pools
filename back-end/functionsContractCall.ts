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
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';
import { apiUrl, development, network, privateKey } from './network';
import { ContractType } from './functionsReadOnly';
import { contractMapping, functionMapping, poxAddress } from './contracts';
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
  fee: number = -1,
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

  if (fee !== -1) options.fee = fee;
  return await makeContractCall(options);
};

export const contractCallFunctionUpdateSCBalances =
  async (): Promise<StacksTransaction> => {
    const contractType = ContractType.stacking;
    const postConditions: PostCondition[] = [];
    let response: StacksTransaction = await contractCallFunction(
      contractType,
      functionMapping[contractType].publicFunctions.updateSCBalances,
      [],
      postConditions,
    );
    console.log('update sc balance transaction response is: ', response);
    return response;
  };

const createOperatorSig = (rewardCycle: number, authId: number): string => {
  // TODO: should be the Stacks' address of the deployer or the liquidity provider of the stacking pool SC?
  return stackingClient.signPoxSignature({
    signerPrivateKey: createStacksPrivateKey(privateKey),
    rewardCycle: rewardCycle,
    period: 1,
    topic: Pox4SignatureTopic.AggregateCommit, // TODO: or aggregateIncrease?
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
): Promise<boolean> => {
  const contractType = ContractType.stacking;
  const postConditions: PostCondition[] = [];
  const authId: number = Date.now() * 10 + Math.floor(Math.random() * 10);
  const signerSig: string = createOperatorSig(currentCycle, authId);
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
  );
  // TODO: get txid where it's called
  console.log(
    'maybe stack aggregation commit transaction response is: ',
    response,
  );
  console.log(
    'maybe stack aggregation commit transaction response converted is: ',
    response,
  );
  return true;
};
