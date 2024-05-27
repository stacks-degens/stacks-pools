import {
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import dotenv from 'dotenv';
import { network } from './network';
dotenv.config();

if (!process.env.PASSWORD) throw 'Invalid empty password env variable';
if (!process.env.MNEMONIC) throw 'Invalid empty mnemonic env variable';
if (!process.env.STX_PRIVATE_KEY)
  throw 'Invalid empty stx-private-key env variable';

const transactionVersion: TransactionVersion =
  network === 'mainnet'
    ? TransactionVersion.Mainnet
    : TransactionVersion.Testnet;

const password = process.env.PASSWORD;
const secretKey = process.env.MNEMONIC;

const wallet = await generateWallet({
  secretKey,
  password,
});

console.log('wallet', wallet);

const stacksAddress = getAddressFromPrivateKey(
  process.env.STX_PRIVATE_KEY,
  transactionVersion,
);

console.log(stacksAddress);
