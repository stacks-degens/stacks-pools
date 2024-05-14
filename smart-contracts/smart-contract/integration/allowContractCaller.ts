import {
  AnchorMode,
  broadcastTransaction,
  contractPrincipalCV,
  makeContractCall,
  noneCV,
  PostConditionMode,
} from '@stacks/transactions';
import { mainContract, poxPools1CycleContract } from './contracts';
import { StacksTestnet } from '@stacks/network';

export async function broadcastAllowContractCallerContracCall({
  senderKey,
  network,
  nonce,
}: {
  senderKey: string;
  network: StacksTestnet;
  nonce: number;
}) {
  let txOptions = {
    contractAddress: 'ST000000000000000000002AMW42H',
    contractName: 'pox-4',
    functionName: 'allow-contract-caller',
    functionArgs: [contractPrincipalCV(mainContract.address, mainContract.name), noneCV()],
    network,
    nonce,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    senderKey,
  };
  // @ts-ignore
  let tx = await makeContractCall(txOptions);
  // Broadcast transaction to our Devnet stacks node
  return broadcastTransaction(tx, network);
}
