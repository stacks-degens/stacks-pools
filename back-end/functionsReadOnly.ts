import {
  callReadOnlyFunction,
  Cl,
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
import { apiUrl, development, network, poxAddress } from './network';
import { contractMapping, functionMapping } from './contracts';
import { poxAddressToTuple } from '@stacks/stacking';

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

export const readOnlyGetPartialStackedByCycle = async (
  rewardCycle: number,
  // sender: string,
): Promise<number> => {
  const contractType = ContractType.pox;
  const partialStackedByCycle: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.getPartialStackedByCycle,
    [
      poxAddressToTuple(poxAddress),
      Cl.uint(rewardCycle),
      Cl.principal(
        contractMapping[contractType][network].contractAddress +
          '.' +
          contractMapping[contractType][network].contractName,
      ),
    ],
  );
  return cvToValue(partialStackedByCycle) || 0;
};

export const readOnlyGetPoxAddressIndices = async (
  rewardCycle: number,
): Promise<boolean> => {
  const contractType = ContractType.stacking;
  const partialStackedByCycle: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.getPoxAddrIndices,
    [Cl.uint(rewardCycle)],
  );
  console.log('check if none is empty list', cvToValue(partialStackedByCycle));

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

// TODO: return directly what we want from it
export const readOnlyUpdatedBalancesGivenCycle = async (
  givenCycle: number,
): Promise<boolean> => {
  const contractType = ContractType.stacking;
  const updatedBalancesGivenCycle: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.updatedBalancesGivenCycle,
    [Cl.uint(givenCycle)],
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

  const CVblockWonResponse: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.checkWonBlockRewardsBatch,
    [listCV(CVBlockHeights)],
  );

  // add the block heights that aren't 0
  const blocksWon: number[] = [];
  const blockWonResponse = cvToValue(CVblockWonResponse);
  Object.entries(blockWonResponse.value).forEach(([, value]) => {
    const blockheight = parseInt(value.value);
    if (blockheight) blocksWon.push(blockheight);
  });
  return blocksWon;
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

  const CVblockNotClaimedResponse: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions
      .checkClaimedBlocksRewardsBatch,
    [listCV(CVBlockHeights)],
  );
  const blocksNotClaimed: number[] = [];
  // add the block heights that aren't 0
  const blockNotClaimedResponse = cvToValue(CVblockNotClaimedResponse);
  Object.entries(blockNotClaimedResponse.value).forEach(([, value]) => {
    const blockheight = parseInt(value.value);
    if (blockheight) blocksNotClaimed.push(blockheight);
    console.log('block claimed: ', blockheight);
  });
  console.log('what blocks are won :', blocksNotClaimed);
  return blocksNotClaimed;
};

// readOnlyCheckWonBlockRewardsBatch([140, 141, 142]);
readOnlyCheckClaimedBlocksRewardsBatch([140, 141, 142]);
// TODO: distribute rewards
// when can this be done? -can be done anytime after it was won, even in other new cycles
