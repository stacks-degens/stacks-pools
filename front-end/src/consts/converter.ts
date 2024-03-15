import { cvToValue, listCV, uintCV, ClarityValue, ListCV } from '@stacks/transactions';
import { network } from './network';

import { stringCV } from '@stacks/transactions/dist/clarity/types/stringCV.js';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV.js';
import { address } from 'bitcoinjs-lib';

export const convertIntToArg = (number: number) => {
  return uintCV(number);
};

export const convertCVToValue = (value: ClarityValue) => {
  return cvToValue(value);
};

export const convertStringToArg = (str: string) => {
  return stringCV(str, 'ascii');
};

export const convertPrincipalToArg = (principal: string) => {
  return principalCV(principal);
};

export const convertListToListCV = (principalList: Array<string>) => {
  let principalCvList: Array<ClarityValue> = [];
  principalList.forEach((address) => principalCvList.push(convertPrincipalToArg(address)));

  return listCV(principalCvList);
};

export const convertPrincipalToList = (principal: string) => {
  return listCV([principalCV(principal)]);
};

export const isPrincipal = (str: string) => {
  const secondChar = network !== 'mainnet' ? 'T' : 'P';
  if (str.charAt(0) === 'S' && str.charAt(1) === secondChar && str.length >= 39 && str.length <= 41) {
    return true;
  }
  return false;
};

export const fromResultToList = (result: ClarityValue, start: number, end: number) => {
  let listArg: ClarityValue[] = [];
  let convertedArg: ClarityValue[] = [];

  (result as ListCV).list.forEach((x: ClarityValue) => {
    listArg.push(x);
  });
  listArg.slice(start, end).forEach((x: ClarityValue) => convertedArg.push(x));

  return listCV(convertedArg);
};

export const convertDigits = (n: number) => {
  const toStx = 1000000;
  const numberOfDigits = 2;

  return Math.floor((n / toStx) * Math.pow(10, numberOfDigits)) / Math.pow(10, numberOfDigits);
};

export const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const fromAddressToHashbytesAndVersion = (btcAddress: string) => {
  let decoded, version, networkType;
  try {
    // Try decoding as a Base58Check address (P2PKH or P2SH)
    decoded = address.fromBase58Check(btcAddress);
    switch (decoded.version) {
      case 0x00:
        version = '00'; // P2PKH
        networkType = 'mainnet';
        break;
      case 0x6f:
        version = '00'; // P2PKH
        networkType = 'testnet/regtest/signet';
        break;
      case 0x05:
        version = '01'; // P2SH
        networkType = 'mainnet';
        break;
      case 0xc4:
        version = '01'; // P2SH
        networkType = 'testnet/regtest/signet';
        break;
      default:
        version = 'Unknown';
        networkType = 'Unknown';
    }
  } catch (e) {
    // If Base58Check decoding fails, try Bech32 (P2WPKH, P2WSH, or P2TR)
    try {
      decoded = address.fromBech32(btcAddress);
      switch (decoded.version) {
        case 0: // P2WPKH
          version = '04';
          break;
        case 1: // P2WSH
          version = '05';
          break;
        case 2: // P2TR
          version = '06';
          break;
        default:
          version = 'Unknown';
          break;
      }
      networkType = decoded.network === 'mainnet' ? 'mainnet' : 'testnet/regtest/signet';
    } catch (err) {
      throw new Error('Invalid address format');
    }
  }
  // TODO: add test v5 and v6
  // TESTED: v0, v1 - testnet and mainnet
  // v4 - only working on mainnet
  let hash;
  if (parseInt(version, 10) < 3) {
    hash = decoded.hash.toString('hex');
  } else {
    hash = decoded.data;
  }
  return {
    version: version,
    network: networkType,
    hash: hash.toString('hex'),
  };
};
