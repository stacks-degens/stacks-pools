import {
  getAddressFromPrivateKey,
  privateKeyToString,
  TransactionVersion,
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import dotenv from 'dotenv';
dotenv.config();

const password = process.env.PASSWORD || '';
const secretKey = process.env.MNEMONIC || '';

const wallet = await generateWallet({
  secretKey,
  password,
});

console.log('wallet', wallet);

const stacksAddress = getAddressFromPrivateKey(
  process.env.STX_PRIVATE_KEY,
  TransactionVersion.Testnet, // remove for Mainnet addresses
);

console.log(stacksAddress);
