import { generateWallet } from '@stacks/wallet-sdk';
import dotenv from 'dotenv';
dotenv.config();


const password = process.env.PASSWORD || "";
const secretKey = process.env.MNEMONIC || "";

const wallet = await generateWallet({
  secretKey,
  password,
});

console.log("wallet", wallet);
