// provide SC address
// provide SC name
// provide function name
// provide arguments
// autoconvert arguments to correct type for clarity call

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  uintCV,
  bufferCV,
  PostConditionMode,
  principalCV,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

// for mainnet, use `StacksMainnet()`
const network = new StacksMainnet();
const mainnet_tester_seed =
  'never roast autumn near copper observe limit swing wall trust faith state adult chapter dilemma mammal exit heart art chat fiscal border auction welcome';
const mainnet_tester_privkey = '9318a7278ed941ec4d16306b039c929b439e88186ef02a35db161e59c7abc26401';
const mainnet_tester_address = 'SP3CX8H4PFBTVY0ZKX7CMEM7F75SYVJ2DKQJYRZDH';
// Add an optional post condition
// See below for details on constructing post conditions
const postConditionAddress = 'SP2ZD731ANQZT6J4K3F5N8A40ZXWXC1XFXHVVQFKE';
const postConditionCode = FungibleConditionCode.Equal;
const stx_amount = 5n;
const postConditionAmount = stx_amount * 1000000n;
const postConditions = [makeStandardSTXPostCondition(postConditionAddress, postConditionCode, postConditionAmount)];

const slippeage = 4;

const txOptions = {
  contractAddress: 'SP6Q01JSXN4HGPBXE6Y7F4GHTZF98PKZKJ57K91M',
  contractName: 'overwhelming-coffee-chimpanzee',
  // functionName: 'swap-stx-to-xbtc-directly',
  functionName: 'swap-stx-to-xbtc',
  functionArgs: [
    principalCV('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx'),
    principalCV('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wbtc'),
    uintCV(stx_amount),
    uintCV(slippeage),
  ],
  senderKey: mainnet_tester_privkey,
  // validateWithAbi: true,
  network: network,
  postConditionMode: PostConditionMode.Allow,
  // postConditions: postConditions,
  anchorMode: AnchorMode.Any,
};

const transaction = await makeContractCall(txOptions);

const broadcastResponse = await broadcastTransaction(transaction, network);
const txId = broadcastResponse.txid;
console.log(broadcastResponse);
