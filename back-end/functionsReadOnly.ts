import {
  callReadOnlyFunction,
  Cl,
  ClarityValue,
  cvToValue,
  principalCV,
  UIntCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';
import { apiUrl, development, network, poxAddress } from './network';
import { contractMapping, functionMapping } from './contracts';
import { poxAddressToTuple } from '@stacks/stacking';

const contractNetwork =
  network === 'mainnet'
    ? new StacksMainnet({ url: apiUrl[development][network] })
    : network === 'testnet' || network === 'nakamotoTestnet'
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
  const senderAddress = contractMapping[type][network].owner;

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
): Promise<number> => {
  const contractType = ContractType.pox;
  // TODO: double check it works with sender-address as stacking-pool-sc-address
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

// TODO: update function return type from any
export const readOnlyGetPoxAddressIndices = async (
  rewardCycle: number,
): Promise<any> => {
  const contractType = ContractType.stacking;
  const poxAddressIndices: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.getPoxAddrIndices,
    [Cl.uint(rewardCycle)],
  );
  return cvToValue(poxAddressIndices);
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

export const readOnlyUpdatedBalancesGivenCycle = async (
  givenCycle: number,
): Promise<boolean> => {
  const contractType = ContractType.stacking;
  const updatedBalancesGivenCycle: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.updatedBalancesGivenCycle,
    [Cl.uint(givenCycle)],
  );
  return cvToValue(updatedBalancesGivenCycle);
};

/// give list of block-heights
/// returns list of block-heights that are won
export const readOnlyCheckWonBlockRewardsBatch = async (
  blockheights: number[],
): Promise<number[]> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  for (const blockheight in blockheights) {
    CVBlockHeights.push(Cl.uint(blockheight));
  }
  const CVblockWonResponse: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions.checkWonBlockRewardsBatch,
    [Cl.list(CVBlockHeights)],
  );

  const blocksWon: number[] = [];
  const blockWonResponse = cvToValue(CVblockWonResponse);
  Object.entries(blockWonResponse.value).forEach(([, value]) => {
    const blockheight = parseInt((value as any).value);
    if (blockheight) blocksWon.push(blockheight);
  });
  return blocksWon;
};

/// give list of block-heights
/// returns list of block-heights that are not claimed
export const readOnlyCheckClaimedBlocksRewardsBatch = async (
  blockheights: number[],
): Promise<number[]> => {
  const contractType = ContractType.stacking;
  const CVBlockHeights: UIntCV[] = [];
  for (const blockheight in blockheights) {
    CVBlockHeights.push(Cl.uint(blockheight));
  }
  const CVblockNotClaimedResponse: ClarityValue = await readOnlyFunction(
    contractType,
    functionMapping[contractType].readOnlyFunctions
      .checkClaimedBlocksRewardsBatch,
    [Cl.list(CVBlockHeights)],
  );

  const blocksNotClaimed: number[] = [];
  const blockNotClaimedResponse = cvToValue(CVblockNotClaimedResponse);
  Object.entries(blockNotClaimedResponse.value).forEach(([, value]) => {
    const blockheight = parseInt((value as any).value);
    if (blockheight) blocksNotClaimed.push(blockheight);
  });
  return blocksNotClaimed;
};

/// TESTS
// readOnlyCheckWonBlockRewardsBatch([140, 141, 142]);
// readOnlyCheckClaimedBlocksRewardsBatch([140, 141, 142]);
