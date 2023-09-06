export const network: networkType = 'testnet';
export type networkType = 'mainnet' | 'testnet' | 'devnet';

// get calls
// wrapped for each specific network
// not used right now

type ApiMapping = Record<
  networkType,
  () => {
    blockInfo: string;
    stackingInfo: string;
  }
>;

type ApiUrl = Record<networkType, string>;

// works on our website
export const apiUrl: ApiUrl = {
  mainnet:
    'https://responsive-cosmopolitan-panorama.stacks-mainnet.quiknode.pro/3a26316cbf4275e95002802aa24e9e19cf744239',
  testnet: 'https://cold-alpha-spring.stacks-testnet.quiknode.pro/a28b33a78e1ee89cc89e2c0eb02b4790cbbb671f',
  devnet: 'http://localhost:3999',
};

// works locally
// export const apiUrl: ApiUrl = {
//   mainnet: 'https://api.mainnet.hiro.so',
//   testnet: 'https://api.testnet.hiro.so',
//   devnet: 'http://localhost:3999',
// };

type ExplorerUrl = Record<networkType, [string, string]>;

const explorerUrl: ExplorerUrl = {
  mainnet: ['https://explorer.hiro.so', 'mainnet'],
  testnet: ['https://explorer.hiro.so', 'testnet'],
  devnet: ['http://localhost:8000', 'mainnet'],
};

export const apiMapping: ApiMapping = {
  mainnet: () => ({
    blockInfo: `${apiUrl.mainnet}/extended/v1/block`,
    stackingInfo: `${apiUrl.mainnet}/v2/pox`,
  }),
  testnet: () => ({
    blockInfo: `${apiUrl.testnet}/extended/v1/block`,
    stackingInfo: `${apiUrl.testnet}/v2/pox`,
  }),
  devnet: () => ({
    blockInfo: `${apiUrl.devnet}/extended/v1/block`,
    stackingInfo: `${apiUrl.devnet}/v2/pox`,
  }),
};

type TransactionMapping = Record<
  networkType,
  (txId: string) => { apiUrl: string; explorerUrl: string; explorerUrlAddress: string }
>;

export const transactionUrl: TransactionMapping = {
  mainnet: (txId: string) => ({
    apiUrl: `${apiUrl.mainnet}/extended/v1/tx/${txId}`,
    explorerUrl: `${explorerUrl.mainnet[0]}/txid/${txId}?chain=${explorerUrl.mainnet[1]}`,
    explorerUrlAddress: `${explorerUrl.mainnet[0]}/address/${txId}?chain=${explorerUrl.mainnet[1]}`,
  }),
  testnet: (txId: string) => ({
    apiUrl: `${apiUrl.testnet}/extended/v1/tx/${txId}`,
    explorerUrl: `${explorerUrl.testnet[0]}/txid/${txId}?chain=${explorerUrl.testnet[1]}`,
    explorerUrlAddress: `${explorerUrl.testnet[0]}/address/${txId}?chain=${explorerUrl.testnet[1]}`,
  }),
  devnet: (txId: string) => ({
    apiUrl: `${apiUrl.devnet}/extended/v1/tx/${txId}`,
    explorerUrl: `${explorerUrl.devnet[0]}/txid/${txId}?chain=${explorerUrl.devnet[0]}`,
    explorerUrlAddress: `${explorerUrl.devnet[0]}/address/${txId}?chain=${explorerUrl.devnet[0]}`,
  }),
};

type PostApiUrl = Record<networkType, (contractAddress: string, contractName: string, functionName: string) => string>;

export const postApiUrl: PostApiUrl = {
  mainnet: (contractAddress: string, contractName: string, functionName: string) =>
    `${apiUrl.mainnet}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
  testnet: (contractAddress: string, contractName: string, functionName: string) =>
    `${apiUrl.testnet}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
  devnet: (contractAddress: string, contractName: string, functionName: string) =>
    `${apiUrl.devnet}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
};

type ExplorerUserAddressUrl = Record<networkType, (userAddress: string) => { explorerUrl: string }>;

export const getExplorerUrl: ExplorerUserAddressUrl = {
  mainnet: (userAddress: string) => ({
    explorerUrl: `${explorerUrl.mainnet[0]}/address/${userAddress}?chain=${explorerUrl.mainnet[1]}`,
  }),
  testnet: (userAddress: string) => ({
    explorerUrl: `${explorerUrl.testnet[0]}/address/${userAddress}?chain=${explorerUrl.testnet[1]}`,
  }),
  devnet: (userAddress: string) => ({
    explorerUrl: `${explorerUrl.devnet[0]}/address/${userAddress}?chain=${explorerUrl.devnet[1]}`,
  }),
};
