// import { prompt } from 'inquirer';
// import 'cross-fetch/polyfill';
import { stacksProvider, bridgeContract } from '../src/stacks';
// const bitcoin = require('bitcoinjs-lib');
// import { bitcoin } from 'bitcoinjs-lib/types/networks';
// import bitcoin from 'bitcoinjs-lib/types/networks';
// hash160
// import { bpsToPercent, btcToSats, satsToBtc, shiftInt, stxToUstx } from '../src/utils';
import {
  getBtcAddress,
  getNetworkKey,
  getPublicKey,
  getStxAddress,
  getStxNetwork,
  getSupplierId,
  validateKeys,
} from '../src/config';
import { PostConditionMode } from 'micro-stacks/transactions';
// import BigNumber from 'bignumber.js';
import { getBalances } from '../src/wallet';
// import { AnchorMode } from 'micro-stacks/transactions';
// import { bytesToHex } from 'micro-stacks/common';
import { askStxFee, broadcastAndLog, broadcastAndLogSwapper } from './helpers';
import { networks, crypto } from 'bitcoinjs-lib';
// import { hash160 } from 'bitcoinjs-lib/types/crypto';

interface Answers {
  inboundFee: number;
  inboundBaseFee: number;
  outboundFee: number;
  outboundBaseFee: number;
  xbtcFunds: number;
  name: string;
  stxFee: number;
}

async function run() {
  const provider = stacksProvider();
  const bridge = bridgeContract();

  try {
    validateKeys();
  } catch (error) {
    console.error('Unable to register supplier - environment not configured');
    console.error(error);
    return;
  }

  const stxAddress = getStxAddress();
  const btcAddress = getBtcAddress();
  const balances = await getBalances();
  const network = getStxNetwork();
  const networkKey = getNetworkKey();

  const stxBalance = balances.stx.stx;
  const xbtcBalance = balances.stx.xbtc;
  const btcBalance = balances.btc.btc;

  console.log(`STX Address: ${stxAddress}`);
  console.log(`BTC Address: ${btcAddress}`);
  console.log(`STX Balance: ${stxBalance} STX`);
  console.log(`xBTC Balance: ${xbtcBalance} xBTC`);
  console.log(`BTC Balance: ${btcBalance} BTC`);
  console.log(`Network: ${networkKey}`);
  console.log(`Stacks node: ${network.getCoreApiUrl()}`);

  const { stxFee, ustxFee: fee } = await askStxFee(stxBalance);

  console.log(`Transaction fee: ${stxFee} STX (${fee} uSTX)`);

  const btcPublicKey = getPublicKey();

  console.log(Buffer.from('d946c5ab1cb31bf6d0a67d824e548393dca3b9f8'));

  const publicKeyHex = '02e8f7dc91e49a577ce9ea8989c7184aea8886fe5250f02120dc6f98e3619679b0';
  const publicKey = Buffer.from(publicKeyHex, 'hex');
  const pKhash160 = crypto.hash160(publicKey); //types['crypto'].hash160(publicKey);
  const btcHashBuffer = pKhash160;

  let txAmount = 1000;

  const initiateOutboundSwapTx = bridge.initiateOutboundSwap(
    BigInt(txAmount),
    Uint8Array.from(Buffer.from([0x00])),
    Uint8Array.from(btcHashBuffer),
    BigInt(getSupplierId())
  );

  console.log(initiateOutboundSwapTx);
  let swapperPrivateKey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';

  await broadcastAndLogSwapper(swapperPrivateKey, initiateOutboundSwapTx, {
    postConditionMode: PostConditionMode.Allow,
    fee,
  });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
