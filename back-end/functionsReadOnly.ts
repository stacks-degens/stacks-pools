import {
  callReadOnlyFunction,
  ClarityValue,
  cvToJSON,
  cvToString,
  cvToValue,
  hexToCV,
  listCV,
  principalCV,
  UIntCV,
  uintCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';
import { apiUrl, development, network } from './network';
import {
  contractMapping,
  CVpoxAddress,
  functionMapping,
  poxAddress,
} from './contracts';

const contractNetwork =
  network === 'mainnet'
    ? new StacksMainnet({ url: apiUrl[development][network] })
    : network === 'testnet'
      ? new StacksTestnet({ url: apiUrl[development][network] })
      : new StacksDevnet({ url: apiUrl[development][network] });

export enum ContractType {
  stacking = 'stacking',
  pox = 'pox',
}

const readOnlyFunction = async (
  type: ContractType,
  functionName: string,
  functionArgs: ClarityValue[],
) => {
  const contractAddress = contractMapping[type][network].contractAddress;
  const contractName = contractMapping[type][network].contractName;
  const senderAddress = contractAddress; // TODO: modify to address from private key from .env

  return await callReadOnlyFunction({
    contractName,
    contractAddress,
    functionName,
    functionArgs,
    network: contractNetwork,
    senderAddress,
  });
};

export const readOnlyGetStackingMinimum = async (): Promise<number> => {
  const contractType = ContractType.pox;
  const stackingMinimum: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.getStackingMinimum,
    [],
  );
  return cvToValue(stackingMinimum);
};

// (pox-addr { version: (buff 1), hashbytes: (buff 32) }) (reward-cycle uint) (sender principal)
/// TODO: should sender be the smart contract?
export const readOnlyGetPartialStackedByCycle = async (
  rewardCycle: number,
  // sender: string,
): Promise<any> => {
  const contractType = ContractType.pox;
  const partialStackedByCycle: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.getPartialStackedByCycle,
    [
      CVpoxAddress,
      uintCV(rewardCycle),
      principalCV(
        contractMapping[contractType][network].contractAddress +
          '.' +
          contractMapping[contractType][network].contractName,
      ),
    ],
  );
  console.log('partialStackedByCycle? :', partialStackedByCycle);
  console.log('partialStackedByCycle? val :', cvToValue(partialStackedByCycle));
  return cvToValue(partialStackedByCycle);
};

export interface PoxInfo {
  'first-burnchain-block-height': number;
  'min-amount-ustx': number;
  'prepare-cycle-length': number;
  'reward-cycle-id': number;
  'reward-cycle-length': number;
  'total-liquid-supply-ustx': number;
}

export type PoxInfoMap = Map<keyof PoxInfo, number>;

const extractPoxData = (data: any): PoxInfoMap => {
  const result = new Map();
  Object.keys(data.value).forEach((key) => {
    const clarityValue = data.value[key];
    result.set(key, parseInt(clarityValue.value));
  });
  return result;
};

export const readOnlyGetPoxInfo = async (): Promise<PoxInfoMap> => {
  const contractType = ContractType.pox;
  const poxInfo: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.getPoxInfo,
    [],
  );
  return extractPoxData(cvToValue(poxInfo));
};

// TODO: double check and remove this completely
// This throws overflow on read_lenght
// Transitioned to pox api call and read from json
export const readOnlyIsPreparePhaseNow = async (): Promise<boolean> => {
  const contractType = ContractType.stacking;
  const isPreparePhase: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.isPreparePhaseNow,
    [],
  );
  console.log('is it bool? :', cvToValue(isPreparePhase));
  return cvToValue(isPreparePhase);
};

// TODO: return directly what we want from it
export const readOnlyUpdatedBalancesGivenCycle = async (
  givenCycle: number,
): Promise<boolean> => {
  const contractType = ContractType.stacking;
  const updatedBalancesGivenCycle: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.updatedBalancesGivenCycle,
    [uintCV(givenCycle)],
  );
  console.log('is it bool? :', cvToValue(updatedBalancesGivenCycle));
  return cvToValue(updatedBalancesGivenCycle);
};

// (define-read-only (check-won-block-rewards-batch (burn-blocks-list (list 300 uint)))
// (ok (map check-won-block-rewards-one-block burn-blocks-list)))

/// give list of block-heights
/// returns list of block-heights that are won
export const readOnlyCheckWonBlockRewardsBatch = async (
  blockheights: number[],
): Promise<number[]> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  // for each blockheight add to list of uintCV
  for (const blockheight in blockheights) {
    CVBlockHeights.push(uintCV(blockheight));
  }

  const blockWonResponse: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.checkWonBlockRewardsBatch,
    [listCV(CVBlockHeights)],
  );

  // convert the answer, go through the values and only add to list those that are block heights

  console.log('what blocks are won :', blockWonResponse);
  // return list of block-heights as [number]
  return [];
};

/// give list of block-heights
/// returns list of block-heights that are won
export const readOnlyCheckClaimedBlocksRewardsBatch = async (
  blockheights: number[],
): Promise<number[]> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  // for each blockheight add to list of uintCV
  for (const blockheight in blockheights) {
    CVBlockHeights.push(uintCV(blockheight));
  }

  const blockWonResponse: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions
      .checkClaimedBlocksRewardsBatch,
    [listCV(CVBlockHeights)],
  );

  // convert the answer, go through the values and only add to list those that are block heights

  console.log('what blocks are won :', blockWonResponse);
  // return list of block-heights as [number]
  return [];
};

// TODO: distribute rewards
// when can this be done? - during cycle, can it be done after the cycle
