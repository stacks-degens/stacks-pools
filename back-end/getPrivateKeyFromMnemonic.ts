import {
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import {
  generateNewAccount,
  generateWallet,
  getStxAddress,
} from '@stacks/wallet-sdk';
import dotenv from 'dotenv';
import { network } from './network';
dotenv.config();

if (!process.env.PASSWORD) throw 'Invalid empty password env variable';
if (!process.env.MNEMONIC) throw 'Invalid empty mnemonic env variable';

const transactionVersion: TransactionVersion =
  network === 'mainnet'
    ? TransactionVersion.Mainnet
    : TransactionVersion.Testnet;

const password = process.env.PASSWORD;
const secretKey = process.env.MNEMONIC;

let wallet = await generateWallet({
  secretKey,
  password,
});
wallet = generateNewAccount(wallet);
const account = wallet.accounts[0];
const address = getStxAddress({
  account,
  transactionVersion: transactionVersion,
});

console.log('private key: ', account.stxPrivateKey);
console.log('account: ', address);

// console.log('wallet', wallet);
// if (!process.env.STX_PRIVATE_KEY)
//   throw 'Invalid empty stx-private-key env variable';

// const stacksAddress = getAddressFromPrivateKey(
//   process.env.STX_PRIVATE_KEY,
//   transactionVersion,
// );

// console.log(stacksAddress);
