import {
  makeContractCall,
  broadcastTransaction,
  uintCV,
  bufferCV,
  AnchorMode,
  PostConditionMode,
  hexToCV,
  bufferCVFromString,
} from "@stacks/transactions";
import { crypto } from "bitcoinjs-lib";
import { network } from "../consts/network.js";
import { bridgeContract } from "../consts/contracts.js";
import { StacksMainnet, StacksTestnet, StacksMocknet } from "@stacks/network";

export const initiateOutboundSwap = async () => {
  // Set up network configuration
  const broadcastNetwork =
    network === "mainnet"
      ? new StacksMainnet()
      : network === "testnet"
      ? new StacksTestnet()
      : network === "mocknet"
      ? new StacksMocknet()
      : new StacksTestnet();

  const publicKeyHex =
    "02e8f7dc91e49a577ce9ea8989c7184aea8886fe5250f02120dc6f98e3619679b0";
  const publicKey = Buffer.from(publicKeyHex, "hex");
  const pKhash160 = crypto.hash160(publicKey);
  const btcHashBuffer = pKhash160;

  const txAmount = 1000;
  const supplierId = 0;

  let swapperPrivateKey =
    "a30478991cde6a39b21e4f90e2ecde4fee92812be9ff06b0924c50afc5cf998d01";

  // Set contract and function details
  const contractAddress = bridgeContract.contractAddress;
  const contractName = bridgeContract.contractName;
  const functionName = bridgeContract.functionNames.initiateOutboundSwap;
  const functionArgs = [
    uintCV(txAmount),
    bufferCV(Uint8Array.from(Buffer.from("00", "hex"))),
    bufferCV(Uint8Array.from(btcHashBuffer)),
    uintCV(supplierId),
  ];

  // Build and broadcast the transaction
  const txOptions = {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderKey: swapperPrivateKey,
    network: broadcastNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  console.log(transaction);
  console.log("transaction", transaction.payload["functionArgs"]);
  broadcastTransaction(transaction, network)
    .then((txResult) => {
      console.log("Transaction result:", txResult);
      console.log("Transaction broadcasted successfully.");
      console.log("Transaction ID:", txResult.txid);
    })
    .catch((error) => {
      console.error("Error broadcasting transaction:", error);
    });
};
