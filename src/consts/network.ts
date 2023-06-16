export const network: networkType = 'devnet';
export type networkType = 'mainnet' | 'testnet' | 'devnet';

// get calls
// wrapped for each specific network
// not used right now

type ApiMapping = Record<
  networkType,
  (accountAddress: string) => {
    balance: string;
    nftsOwned: string;
  }
>;

export const apiMapping: ApiMapping = {
  mainnet: (accountAddress: string) => ({
    balance: `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${accountAddress}/balances`,
    nftsOwned: `https://stacks-node-api.mainnet.stacks.co/extended/v1/tokens/nft/holdings?principal=${accountAddress}&&`,
  }),
  testnet: (accountAddress: string) => ({
    balance: `https://stacks-node-api.testnet.stacks.co/extended/v1/address/${accountAddress}/balances`,
    nftsOwned: `https://stacks-node-api.testnet.stacks.co/extended/v1/tokens/nft/holdings?principal=${accountAddress}&&`,
  }),
  devnet: (accountAddress: string) => ({
    balance: `http://localhost:3999/extended/v1/address/${accountAddress}/balances`,
    nftsOwned: `http://localhost:3999/extended/v1/tokens/nft/holdings?principal=${accountAddress}&&`,
  }),
};

type TransactionMapping = Record<
  networkType,
  (txId: string) => { apiUrl: string; explorerUrl: string; explorerUrlAddress: string }
>;

export const transactionUrl: TransactionMapping = {
  mainnet: (txId: string) => ({
    apiUrl: `https://api.mainnet.hiro.so/extended/v1/tx/${txId}`,
    explorerUrl: `https://explorer.hiro.so/txid/${txId}?chain=mainnet`,
    explorerUrlAddress: `https://explorer.hiro.so/address/${txId}?chain=mainnet`,
  }),
  testnet: (txId: string) => ({
    apiUrl: `https://api.testnet.hiro.so/extended/v1/tx/${txId}`,
    explorerUrl: `https://explorer.hiro.so/txid/${txId}?chain=testnet`,
    explorerUrlAddress: `https://explorer.hiro.so/address/${txId}?chain=testnet`,
  }),
  devnet: (txId: string) => ({
    apiUrl: `http://localhost:3999/extended/v1/tx/${txId}`,
    explorerUrl: `http://localhost:8000/txid/${txId}?chain=mainnet`,
    explorerUrlAddress: `http://localhost:8000/address/${txId}?chain=mainnet`,
  }),
};

type PostApiUrl = Record<networkType, (contractAddress: string, contractName: string, functionName: string) => string>;

export const postApiUrl: PostApiUrl = {
  mainnet: (contractAddress: string, contractName: string, functionName: string) =>
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
  testnet: (contractAddress: string, contractName: string, functionName: string) =>
    `https://api.testnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
  devnet: (contractAddress: string, contractName: string, functionName: string) =>
    `http://localhost:3999/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
};

type ExplorerUrl = Record<networkType, (userAddress: string) => { explorerUrl: string }>;

export const getExplorerUrl: ExplorerUrl = {
  mainnet: (userAddress: string) => ({
    explorerUrl: `https://explorer.hiro.so/address/${userAddress}?chain=mainnet`,
  }),
  testnet: (userAddress: string) => ({
    // explorerUrl: `https://explorer.hiro.so?chain=testnet`,
    explorerUrl: `https://explorer.hiro.so/address/${userAddress}?chain=testnet`,
  }),
  devnet: (userAddress: string) => ({
    explorerUrl: `http://localhost:8000/address/${userAddress}?chain=mainnet`,
  }),
};
