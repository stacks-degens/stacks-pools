import { cvToValue, listCV, uintCV, ClarityValue, ListCV } from '@stacks/transactions';
import { network } from './network';

import { stringCV } from '@stacks/transactions/dist/clarity/types/stringCV.js';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV.js';

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
