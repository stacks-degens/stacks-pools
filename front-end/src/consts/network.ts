/// initial .env checkers
if (
  process.env.REACT_APP_NETWORK !== 'mainnet' &&
  process.env.REACT_APP_NETWORK !== 'testnet' &&
  process.env.REACT_APP_NETWORK !== 'devnet'
)
  throw 'Inexistent networkType';
if (process.env.REACT_APP_DEVELOPMENT !== 'prod' && process.env.REACT_APP_DEVELOPMENT !== 'local')
  throw 'Inexistent developmentType';

export type networkType = 'mainnet' | 'testnet' | 'devnet';
export type developmentType = 'prod' | 'local';

export const network: networkType = process.env.REACT_APP_NETWORK || 'devnet';
export const development: developmentType = process.env.REACT_APP_DEVELOPMENT || 'local';

type ApiMapping = { blockInfo: string; stackingInfo: string };
type ApiUrl = Record<networkType, string>;
type ExplorerUrl = Record<networkType, [string, string]>;
type TransactionMapping = (txId: string) => { apiUrl: string; explorerUrl: string; explorerUrlAddress: string };
type ExplorerUserAddressUrl = (userAddress: string) => { explorerUrl: string };
// not used at the moment
// type PostApiUrl = (contractAddress: string, contractName: string, functionName: string) => string;

const explorerUrl: ExplorerUrl = {
  mainnet: ['https://explorer.hiro.so', 'mainnet'],
  testnet: ['https://explorer.hiro.so', 'testnet'],
  devnet: ['http://localhost:8000', 'mainnet'],
};

export const apiUrl: Record<developmentType, ApiUrl> = {
  local: {
    mainnet: process.env.REACT_APP_API_KEY_LOCAL_MAINNET || '',
    testnet: process.env.REACT_APP_API_KEY_LOCAL_TESTNET || '',
    devnet: process.env.REACT_APP_API_KEY_DEVNET || '',
  },
  prod: {
    mainnet: process.env.REACT_APP_API_KEY_LOCAL_MAINNET || '',
    testnet: process.env.REACT_APP_API_KEY_LOCAL_TESTNET || '',
    devnet: process.env.REACT_APP_API_KEY_DEVNET || '',
  },
};

export const apiMapping: ApiMapping = {
  blockInfo: `${apiUrl[development][network]}/extended/v1/block`,
  stackingInfo: `${apiUrl[development][network]}/v2/pox`,
};

export const transactionUrl: TransactionMapping = (txId: string) => ({
  apiUrl: `${apiUrl[development][network]}/extended/v1/tx/${txId}`,
  explorerUrl: `${explorerUrl[network][0]}/txid/${txId}?chain=${explorerUrl[network][1]}`,
  explorerUrlAddress: `${explorerUrl[network][0]}/address/${txId}?chain=${explorerUrl[network][1]}`,
});

export const getExplorerUrl: ExplorerUserAddressUrl = (userAddress: string) => ({
  explorerUrl: `${explorerUrl[network][0]}/address/${userAddress}?chain=${explorerUrl[network][1]}`,
});

// not used at the moment
// export const postApiUrl: PostApiUrl = (contractAddress: string, contractName: string, functionName: string) =>
//   `${apiUrl[development][network]}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
