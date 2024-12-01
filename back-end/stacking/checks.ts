import {
  TransactionVersion,
  getAddressFromPrivateKey,
} from '@stacks/transactions';
import {
  BITCOIN_NETWORK_NAME,
  NETWORK,
  REWARD_BTC_ADDRESS,
  CONTRACT_ADMIN,
  CONTRACT_ADMIN_PRIVATE_KEY,
  SIGNER_PRIVATE_KEY,
  STACKS_NETWORK_NAME,
} from './consts';
import { validate } from 'bitcoin-address-validation';
import { getContractAdmin } from './api-calls';

const isValidStacksNetwork = (network: string) => {
  switch (network) {
    case 'mainnet':
    case 'testnet':
    case 'nakamotoTestnet':
    case 'devnet':
      return true;
    default:
      return false;
  }
};

const isNullOrEmpty = (value: string | undefined | null): boolean => {
  return value === undefined || value === null || value.trim() === '';
};

const isContractAdmin = async (stxAddress: string | undefined) => {
  if (isNullOrEmpty(stxAddress)) return false;
  return (await getContractAdmin()) === stxAddress;
};

const isValidBtcAddress = (btcAddress: string | undefined) => {
  if (isNullOrEmpty(btcAddress)) return false;
  return validate(btcAddress as string, BITCOIN_NETWORK_NAME);
};

export const getStacksAddressFromPrivateKey = (privKey: string | undefined) => {
  return getAddressFromPrivateKey(
    privKey || '',
    STACKS_NETWORK_NAME === 'mainnet'
      ? TransactionVersion.Mainnet
      : TransactionVersion.Testnet
  );
};

export const runConfigValidator = async () => {
  if (!isValidStacksNetwork(NETWORK)) throw 'Config: invalid stacks network';

  if (!isValidBtcAddress(await REWARD_BTC_ADDRESS()))
    throw 'Config: invalid reward btc address';

  if (isNullOrEmpty(CONTRACT_ADMIN_PRIVATE_KEY))
    throw 'Config: invalid contract admin private key';

  if (!(await isContractAdmin(CONTRACT_ADMIN)))
    throw 'Config: the contract admin provided does not match with the admin in the contract';

  if (isNullOrEmpty(SIGNER_PRIVATE_KEY))
    throw 'Config: invalid signer private key';
};
