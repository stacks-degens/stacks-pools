import {
  StacksDevnet,
  StacksMainnet,
  StacksNetwork,
  StacksNetworkName,
  StacksTestnet,
} from '@stacks/network';
import { Network as BitcoinNetworkName } from 'bitcoin-address-validation';
import dotenv from 'dotenv';
import { getContractRewardAddress } from './api-calls';
import { getStacksAddressFromPrivateKey } from './checks';
dotenv.config();

export enum NetworkUsed {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  NakamotoTestnet = 'nakamotoTestnet',
  Devnet = 'devnet',
}

export const NETWORK: NetworkUsed = process.env.NETWORK as NetworkUsed;

// Function to map NetworkUsed to StacksNetworkName
const getStacksNetworkName = (network: NetworkUsed): StacksNetworkName => {
  switch (network) {
    case NetworkUsed.Mainnet:
      return 'mainnet';
    case NetworkUsed.Devnet:
      return 'devnet';
    case NetworkUsed.NakamotoTestnet:
    case NetworkUsed.Testnet:
    default:
      return 'testnet';
  }
};

const getBitcoinNetworkName = (network: NetworkUsed): BitcoinNetworkName => {
  switch (network) {
    case NetworkUsed.Mainnet:
      return BitcoinNetworkName.mainnet;
    case NetworkUsed.Devnet:
    case NetworkUsed.NakamotoTestnet:
    case NetworkUsed.Testnet:
    default:
      return BitcoinNetworkName.testnet;
  }
};

export const STACKS_NETWORK_NAME: StacksNetworkName =
  getStacksNetworkName(NETWORK);

export const BITCOIN_NETWORK_NAME: BitcoinNetworkName =
  getBitcoinNetworkName(NETWORK);

const getStacksNetworkInstance = (network: NetworkUsed): StacksNetwork => {
  switch (network) {
    case NetworkUsed.Mainnet:
      return new StacksMainnet();
    case NetworkUsed.Devnet:
      return new StacksDevnet();
    case NetworkUsed.NakamotoTestnet:
      return new StacksTestnet({ url: 'https://api.nakamoto.testnet.hiro.so' });
    case NetworkUsed.Testnet:
    default:
      return new StacksTestnet();
  }
};

export const STACKS_NETWORK_INSTANCE: StacksNetwork =
  getStacksNetworkInstance(NETWORK);

const API_CONFIG = {
  [NetworkUsed.Mainnet]: {
    API_URL: 'https://api.mainnet.hiro.so/extended/v1/tx/events',
    POX_INFO_URL: 'https://api.mainnet.hiro.so/v2/pox',
    REWARD_INDEXES_API_URL:
      'https://api.mainnet.hiro.so/v2/map_entry/SP000000000000000000002Q6VF78/pox-4/reward-cycle-pox-address-list',
    GET_TRANSACTION_API_URL(txid: string): string {
      return `https://api.mainnet.hiro.so/extended/v1/tx/${txid}`;
    },
    CONTRIBUTOR_CONTRACT_ADDRESS:
      'SP1SCEXE6PMGPAC6B4N5P2MDKX8V4GF9QDE1FNNGJ.degenlab-stacking-pool-pox4',
    POX_CONTRACT_ADDRESS: 'SP000000000000000000002Q6VF78.pox-4',
    REWARD_BTC_ADDRESS: process.env.REWARD_BTC_ADDRESS,
    CONTRACT_ADMIN_PRIVATE_KEY: process.env.CONTRACT_ADMIN_PRIVATE_KEY,
    SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY,
    FIRST_POX_4_CYCLE: 84,
  },
  [NetworkUsed.Testnet]: {
    API_URL: 'https://api.testnet.hiro.so/extended/v1/tx/events',
    POX_INFO_URL: 'https://api.testnet.hiro.so/v2/pox',
    REWARD_INDEXES_API_URL:
      'https://api.testnet.hiro.so/v2/map_entry/ST000000000000000000002AMW42H/pox-4/reward-cycle-pox-address-list',
    GET_TRANSACTION_API_URL(txid: string): string {
      return `https://api.testnet.hiro.so/extended/v1/tx/${txid}`;
    },
    CONTRIBUTOR_CONTRACT_ADDRESS: '', // TODO: fill with actual contract
    POX_CONTRACT_ADDRESS: 'ST000000000000000000002AMW42H.pox-4',
    REWARD_BTC_ADDRESS: process.env.REWARD_BTC_ADDRESS,
    CONTRACT_ADMIN_PRIVATE_KEY: process.env.CONTRACT_ADMIN_PRIVATE_KEY,
    SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY,
    FIRST_POX_4_CYCLE: 1,
  },
  [NetworkUsed.NakamotoTestnet]: {
    API_URL: 'https://api.nakamoto.testnet.hiro.so/extended/v1/tx/events',
    POX_INFO_URL: 'https://api.nakamoto.testnet.hiro.so/v2/pox',
    REWARD_INDEXES_API_URL:
      'https://api.nakamoto.testnet.hiro.so/v2/map_entry/ST000000000000000000002AMW42H/pox-4/reward-cycle-pox-address-list',
    GET_TRANSACTION_API_URL(txid: string): string {
      return `https://api.nakamoto.testnet.hiro.so/extended/v1/tx/${txid}`;
    },
    CONTRIBUTOR_CONTRACT_ADDRESS: '', // TODO: fill with actual contract
    POX_CONTRACT_ADDRESS: 'ST000000000000000000002AMW42H.pox-4',
    REWARD_BTC_ADDRESS: process.env.REWARD_BTC_ADDRESS,
    CONTRACT_ADMIN_PRIVATE_KEY: process.env.CONTRACT_ADMIN_PRIVATE_KEY,
    SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY,
    FIRST_POX_4_CYCLE: 1,
  },
  [NetworkUsed.Devnet]: {
    API_URL: 'http://localhost:3999/extended/v1/tx/events',
    POX_INFO_URL: 'http://localhost:3999/v2/pox',
    REWARD_INDEXES_API_URL:
      'http://localhost:3999/v2/map_entry/ST000000000000000000002AMW42H/pox-4/reward-cycle-pox-address-list',
    GET_TRANSACTION_API_URL(txid: string): string {
      return `http://localhost:3999/extended/v1/tx/${txid}`;
    },
    CONTRIBUTOR_CONTRACT_ADDRESS:
      'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6.contributor',
    POX_CONTRACT_ADDRESS: 'ST000000000000000000002AMW42H.pox-4',
    REWARD_BTC_ADDRESS: process.env.REWARD_BTC_ADDRESS,
    CONTRACT_ADMIN_PRIVATE_KEY: process.env.CONTRACT_ADMIN_PRIVATE_KEY,
    SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY,
    FIRST_POX_4_CYCLE: 1,
  },
};

const currentConfig = API_CONFIG[NETWORK];

export const API_URL = currentConfig.API_URL;
export const POX_INFO_URL = currentConfig.POX_INFO_URL;
export const REWARD_INDEXES_API_URL = currentConfig.REWARD_INDEXES_API_URL;
export const GET_TRANSACTION_API_URL = currentConfig.GET_TRANSACTION_API_URL;
export const POOL_CONTRACT_ADDRESS = currentConfig.CONTRIBUTOR_CONTRACT_ADDRESS;
export const POX_CONTRACT_ADDRESS = currentConfig.POX_CONTRACT_ADDRESS;
export const DATABASE_PATH = `./database/${NETWORK}.sqlite`;
export const REWARD_BTC_ADDRESS = async () => await getContractRewardAddress();
export const CONTRACT_ADMIN_PRIVATE_KEY =
  currentConfig.CONTRACT_ADMIN_PRIVATE_KEY;
export const CONTRACT_ADMIN = getStacksAddressFromPrivateKey(
  CONTRACT_ADMIN_PRIVATE_KEY
);
export const SIGNER_PRIVATE_KEY = currentConfig.SIGNER_PRIVATE_KEY;
export const FIRST_POX_4_CYCLE = currentConfig.FIRST_POX_4_CYCLE;

export const LIMIT = 100;
