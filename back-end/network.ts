import {
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import dotenv from 'dotenv';
dotenv.config();

// initial .env checkers
if (
  process.env.NETWORK !== 'mainnet' &&
  process.env.NETWORK !== 'testnet' &&
  process.env.NETWORK !== 'devnet' &&
  process.env.NETWORK !== 'nakamotoTestnet'
)
  throw 'Inexistent networkType';
if (process.env.DEVELOPMENT !== 'prod' && process.env.DEVELOPMENT !== 'local')
  throw 'Inexistent developmentType';
if (!process.env.STX_PRIVATE_KEY) throw 'Inexistent Private Key';
if (!process.env.STX_SIGNER_PRIVATE_KEY) throw 'Inexistent Signer Private Key';
if (!process.env.POX_ADDRESS) throw 'Inexistent Pox Address';
if (!process.env.API_KEY_MAINNET) throw 'Inexistent API Key';

export type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'nakamotoTestnet';
export type DevelopmentType = 'prod' | 'local';

export const network: NetworkType = process.env.NETWORK || 'devnet';
export const development: DevelopmentType = process.env.DEVELOPMENT || 'local';
export const privateKey: string = process.env.STX_PRIVATE_KEY;
export const signerPrivateKey: string = process.env.STX_SIGNER_PRIVATE_KEY;
export const poxAddress: string = process.env.POX_ADDRESS;
export const apiKey: string = process.env.API_KEY_MAINNET;

const transactionVersion: TransactionVersion =
  network === 'mainnet'
    ? TransactionVersion.Mainnet
    : TransactionVersion.Testnet;

export const stxAddress: string = getAddressFromPrivateKey(
  privateKey,
  transactionVersion,
);
console.log(stxAddress);

export const stxToUstx: number = 1000000;

type ApiMapping = {
  blockInfo: string;
  stackingInfo: string;
  mempoolInfo: (address: string) => string;
  nonce: (address: string) => string;
};
type ApiUrl = Record<NetworkType, string>;
type ExplorerUrl = Record<NetworkType, [string, string]>;
type TransactionMapping = (txId: string) => {
  apiUrl: string;
  explorerUrl: string;
};
type ExplorerUserAddressUrl = (userAddress: string) => { explorerUrl: string };
// not used at the moment
// type PostApiUrl = (contractAddress: string, contractName: string, functionName: string) => string;

const explorerUrl: ExplorerUrl = {
  mainnet: ['https://explorer.hiro.so', 'mainnet'],
  testnet: ['https://explorer.hiro.so', 'testnet'],
  devnet: ['http://localhost:8000', 'mainnet'],
  nakamotoTestnet: [
    'https://explorer.hiro.so',
    'testnet&api=https://api.nakamoto.testnet.hiro.so',
  ],
};

export const apiUrl: Record<DevelopmentType, ApiUrl> = {
  local: {
    mainnet: process.env.API_KEY_LOCAL_MAINNET || '',
    testnet: process.env.API_KEY_LOCAL_TESTNET || '',
    devnet: process.env.API_KEY_DEVNET || '',
    nakamotoTestnet: process.env.API_KEY_NAKAMOTO || '',
  },
  prod: {
    mainnet: process.env.API_KEY_LOCAL_MAINNET || '',
    testnet: process.env.API_KEY_LOCAL_TESTNET || '',
    devnet: process.env.API_KEY_DEVNET || '',
    nakamotoTestnet: process.env.API_KEY_NAKAMOTO || '',
  },
};

export const apiMapping: ApiMapping = {
  blockInfo: `${apiUrl[development][network]}/extended/v1/block`,
  stackingInfo: `${apiUrl[development][network]}/v2/pox`,
  mempoolInfo: (address: string) =>
    `${apiUrl[development][network]}/extended/v1/address/${address}/mempool?limit=50`,
  nonce: (address: string) =>
    `${apiUrl[development][network]}/extended/v1/address/${address}/nonces`,
};

export const transactionUrl: TransactionMapping = (txId: string) => ({
  apiUrl: `${apiUrl[development][network]}/extended/v1/tx/${txId}`,
  explorerUrl: `${explorerUrl[network][0]}/txid/${txId}?chain=${explorerUrl[network][1]}`,
});

export const getExplorerUrl: ExplorerUserAddressUrl = (
  userAddress: string,
) => ({
  explorerUrl: `${explorerUrl[network][0]}/address/${userAddress}?chain=${explorerUrl[network][1]}`,
});
