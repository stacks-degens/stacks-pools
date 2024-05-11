import {
  getApiPoxData,
  getCurrentBurnchainBlockHeight,
  getCurrentCycle,
  isInPreparePhase,
} from './apiPox';
import {
  contractCallFunctionMaybeStackAggregationCommit,
  contractCallFunctionUpdateSCBalances,
} from './functionsContractCall';
import {
  PoxInfoMap,
  readOnlyGetPartialStackedByCycle,
  readOnlyGetPoxInfo,
  readOnlyGetStackingMinimum,
  readOnlyUpdatedBalancesGivenCycle,
} from './functionsReadOnly';

import { readJsonData, writeJsonData } from './fileLocalData';

// based on burn block height
// 1. prepare phase
//   a. check if update balances happened for current cycle
//   b. if it didn't call update balances -> set that txid somewhere to check its status, the block height when it was called and nonce
//      if after 10 blocks it didn't confirmed, increase the fee and call it with same nonce
// 2. reward phase
//   create signature
//   check partial stacked from pox-4 (you need pox-address and reward cycle), if partial stacked > min threshold (also from pox-4)
//     call maybe-commit-aggregate
//    with 100 blocks before prepare phase starts, call maybe-commit-aggregate
//    also 10 blocks before ->
//    with 15 blocks block before prepare-phase from front-end the possibility to delegate

// at every new block height
const runtime = async () => {
  // general calls
  const poxInfo: PoxInfoMap = await readOnlyGetPoxInfo();
  const poxAPIData = await getApiPoxData();
  // if reward-cycle is different between SC and API -> flag it
  const rewardCycleId: number = poxInfo.get('reward-cycle-id') || -1;
  const rewardCycleIdApi: number = getCurrentCycle(poxAPIData);
  const currentBurnBlockHeight: number =
    getCurrentBurnchainBlockHeight(poxAPIData);
  if (rewardCycleId !== rewardCycleIdApi) {
    // TODO: add write to file with error handling
    // TODO: throws this error when in the block when prepare phase end and reward phase starts,
    // The API updates the cycle id, the SC waits for the first reward block to update it
    console.log(
      `ERR: reward cycles different: SC: ${rewardCycleId} ${typeof rewardCycleId}, API: ${rewardCycleIdApi} ${typeof rewardCycleIdApi}`,
    );
  }

  // check is prepare phase
  // const isPreparePhase = await readOnlyIsPreparePhaseNow(); // overflow read_legth
  const isPreparePhase = isInPreparePhase(poxAPIData);
  console.log('is in prepare phase: ', isPreparePhase);
  if (isPreparePhase) {
    // check already updated balances
    // 1. local
    const localJson = readJsonData();
    const alreadyUpdatedBalancesJSON = localJson.updated_balances_this_cycle;
    console.log('this is', alreadyUpdatedBalancesJSON);
    if (!alreadyUpdatedBalancesJSON) {
      // 2. from read-only
      const alreadyUpdatedBalancesReadOnly =
        await readOnlyUpdatedBalancesGivenCycle(rewardCycleId); // TODO: or +1 ?

      // TODO: check this returned as boolean
      if (alreadyUpdatedBalancesReadOnly) {
        localJson.updated_balances_this_cycle = true;
        writeJsonData(localJson);
      } else {
        // 3. update balances -> update local, set txid, set status: unconfirmed, set burn_block_height_called: current_burn_block_height
        // TODO: call update balances with fees high
        const updateBalanceTransaction =
          await contractCallFunctionUpdateSCBalances();
        console.log('update balances tx ', updateBalanceTransaction);
      }
    }
  } else {
    // in reward phase
    console.log('rewardCycleId: ', rewardCycleId);

    const stackingMinimum = await readOnlyGetStackingMinimum();
    console.log('stacking min: ', stackingMinimum);

    const partialStackedByCycle =
      await readOnlyGetPartialStackedByCycle(rewardCycleId);
    console.log(`partial stacked by cycle ${rewardCycleId}: `, stackingMinimum);

    // TODO: + triggering moment -> once every 500 blocks or 100 blocks before prepare phase and 10 blocks before prepare phase
    // if local + 500 < current_burn_block_height => do this:
    // also do it with 100 blocks before prepare phase // TODO: how to find the burn block height for the prepare phase
    if (partialStackedByCycle > stackingMinimum) {
      contractCallFunctionMaybeStackAggregationCommit(rewardCycleId);
    }
  }
};

runtime();
