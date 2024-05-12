import { apiMapping } from './network';

export const getApiPoxData = async () => {
  return await fetch(apiMapping.stackingInfo).then((x) => x.json());
};

export const getCurrentBurnchainBlockHeight = (poxData: any): number => {
  return poxData.current_burnchain_block_height;
};

export const isInPreparePhase = (poxData: any): boolean => {
  return poxData.next_cycle.blocks_until_prepare_phase <= 0;
};

export const getCurrentCycle = (poxData: any): number => {
  return poxData.current_cycle.id;
};

/// to be used for triggering maybe-agg-commit on given moments
export const getBlocksUntilPreparePhase = (poxData: any): number => {
  return poxData.next_cycle.blocks_until_prepare_phase;
};

export const getRewardPhaseBlockLength = (poxData: any): number => {
  return poxData.reward_phase_block_length;
};

/// TEST
// const jsonDataTest = await getApiPoxData();
// console.log(
//   'current burnchain block height',
//   getCurrentBurnchainBlockHeight(jsonDataTest),
// );
// console.log('is in prepare phase', isInPreparePhase(jsonDataTest));
