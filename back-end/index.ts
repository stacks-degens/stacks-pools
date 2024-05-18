import {
  getApiPoxData,
  getBlocksUntilPreparePhase,
  getCurrentBurnchainBlockHeight,
  getCurrentCycle,
  getRewardPhaseBlockLength,
  isInPreparePhase,
} from './apiPox';
import {
  contractCallFunctionDistributeRewards,
  contractCallFunctionMaybeStackAggregationCommit,
  contractCallFunctionUpdateSCBalances,
} from './functionsContractCall';
import {
  PoxInfoMap,
  readOnlyCheckClaimedBlocksRewardsBatch,
  readOnlyCheckWonBlockRewardsBatch,
  readOnlyGetPartialStackedByCycle,
  readOnlyGetPoxAddressIndices,
  readOnlyGetPoxInfo,
  readOnlyGetStackingMinimum,
  readOnlyUpdatedBalancesGivenCycle,
} from './functionsReadOnly';
import {
  blockSpanAggIncrease,
  blockSpanRewardDistribute,
  feeContractCall,
  limitPerReadOnly,
  offsetIncreaseUpdateBalances,
  offsetRewardDistribute,
  thresholdAmounPartialStackedByCycle,
  triggerNumberOfLastXBlocksBeforeRewardPhase,
} from './consts';

import {
  logData,
  LogTypeMessage,
  readJsonData,
  refreshJsonData,
  writeJsonData,
} from './fileLocalData';
import { Pox4SignatureTopic } from '@stacks/stacking';
import { network, stxToUstx, transactionUrl } from './network';
import { StacksTransaction } from '@stacks/transactions';
import { CronJob } from 'cron';

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
  let localJson = readJsonData();
  const poxAPIData = await getApiPoxData();
  const currentBurnBlockHeight: number =
    getCurrentBurnchainBlockHeight(poxAPIData);
  // start all the flow only after the block changes
  if (localJson.current_burn_block_height < currentBurnBlockHeight || true) {
    // when cycle changes, update local parameters that are used for checking
    if (localJson.current_cycle < getCurrentCycle(poxAPIData)) {
      refreshJsonData()
    }
    localJson = readJsonData();
    const poxInfo: PoxInfoMap = await readOnlyGetPoxInfo();
    logData(
      LogTypeMessage.Info,
      `current burn block height: ${currentBurnBlockHeight}`,
    );

    // if reward-cycle is different between SC and API -> flag it
    const rewardCycleId: number = poxInfo.get('reward-cycle-id') || -1;
    const rewardCycleIdApi: number = getCurrentCycle(poxAPIData);
    logData(LogTypeMessage.Info, `current cycle: ${rewardCycleId}`);

    // would throw this error when in the block when prepare phase end and reward phase starts,
    // The API updates the cycle id 1 block faster (from block 0 in reward phase), the SC waits for the first reward block to update it
    // this block height is when reward phase lenth === blocks until prepare phase
    if (
      rewardCycleId !== rewardCycleIdApi &&
      getRewardPhaseBlockLength(poxAPIData) !==
        getBlocksUntilPreparePhase(poxAPIData)
    ) {
      logData(
        LogTypeMessage.Warn,
        `reward cycles different: SC: ${rewardCycleId} ${typeof rewardCycleId}, API: ${rewardCycleIdApi} ${typeof rewardCycleIdApi} at burn block height: ${currentBurnBlockHeight}`,
      );
    }
    // check is prepare phase
    // const isPreparePhase = await readOnlyIsPreparePhaseNow(); // overflow read_legth
    const isPreparePhase = isInPreparePhase(poxAPIData);
    logData(LogTypeMessage.Info, `is in prepare phase: ${isPreparePhase}`);
    if (isPreparePhase) {
      // check already updated balances
      // 1. local

      localJson.current_cycle = rewardCycleId + 1;
      logData(
        LogTypeMessage.Info,
        `updated balances this cycle ${localJson.updated_balances_this_cycle}`,
      );
      if (
        !localJson.updated_balances_this_cycle &&
        localJson.update_balances_txid === ''
      ) {
        // 2. update balances
        const updateBalanceTransaction =
          await contractCallFunctionUpdateSCBalances(
            BigInt(feeContractCall.updateBalances * stxToUstx),
          );
        logData(
          LogTypeMessage.Info,
          `update balances tx ${updateBalanceTransaction}`,
        );
        localJson.update_balances_burn_block_height = currentBurnBlockHeight;
        localJson.update_balances_txid = updateBalanceTransaction.txid();
        writeJsonData(localJson);
      } else if (!localJson.updated_balances_this_cycle) {
        const txResponse = await fetch(
          transactionUrl(localJson.update_balances_txid).apiUrl,
        ).then((x) => x.json());
        // 3.a. first check if it is anchored and update json if so
        if (txResponse.tx_status === 'success') {
          const alreadyUpdatedBalancesReadOnly =
            await readOnlyUpdatedBalancesGivenCycle(rewardCycleId + 1);
          // TODO: check this returned as boolean
          // 3.b. then from read-only
          if (alreadyUpdatedBalancesReadOnly) {
            localJson.updated_balances_this_cycle = true;
            writeJsonData(localJson);
          } else {
            logData(
              LogTypeMessage.Err,
              `Something went wrong with broadcasted data. The tx is succesfully anchored`,
            );
          }
        } else if (txResponse.tx_status === 'abort_by_response') {
          logData(
            LogTypeMessage.Err,
            `Something went wrong with broadcasted data. The tx is aborted by response: ${localJson.update_balances_txid}`,
          );
        } else if (txResponse.tx_status === 'pending') {
          // 4. increase fees update balances as that transaction is not happening after `a` blocks
          // get nonce from txid
          if (
            localJson.update_balances_burn_block_height +
              offsetIncreaseUpdateBalances[network] <
            currentBurnBlockHeight
          ) {
            const nonce: number = txResponse.nonce;
            const updateBalanceTransaction =
              await contractCallFunctionUpdateSCBalances(
                BigInt(feeContractCall.updateBalancesIncreasedFee * stxToUstx),
                BigInt(nonce),
              );
            localJson.update_balances_burn_block_height =
              currentBurnBlockHeight;
            localJson.update_balances_txid = updateBalanceTransaction.txid();
            writeJsonData(localJson);
          }
        }
      }
    } else {
      // is reward phase

      ///// signing part
      const partialStackedByCycle = await readOnlyGetPartialStackedByCycle(
        rewardCycleId + 1,
      );

      logData(
        LogTypeMessage.Info,
        `partial stacked by cycle ${rewardCycleId + 1}: ${partialStackedByCycle}`,
      );

      const poxAddressIndices = await readOnlyGetPoxAddressIndices(
        rewardCycleId + 1,
      );

      // if no indices , do commit asap
      if (!poxAddressIndices) {
        const stackingMinimum = await readOnlyGetStackingMinimum();

        logData(
          LogTypeMessage.Info,
          `stacking minimum by cycle ${rewardCycleId + 1}: ${stackingMinimum}`,
        );
        if (partialStackedByCycle > stackingMinimum) {
          contractCallFunctionMaybeStackAggregationCommit(
            rewardCycleId,
            Pox4SignatureTopic.AggregateCommit,
          );
          localJson.commit_agg_this_cycle = true;
          localJson.increase_agg_burn_block_height = currentBurnBlockHeight;
          writeJsonData(localJson);
        }
      } else {
        // there is an amount to be commited > threshold and at least x blocks have passed
        // TODO: wouldn't it be better to just increase it when the threshold is met? we also call increase in the end
        if (
          partialStackedByCycle >
            thresholdAmounPartialStackedByCycle[network] * stxToUstx &&
          localJson.increase_agg_burn_block_height +
            blockSpanAggIncrease[network] <
            currentBurnBlockHeight
        ) {
          contractCallFunctionMaybeStackAggregationCommit(
            rewardCycleId,
            Pox4SignatureTopic.StackIncrease,
          );
          // update partial stacked for checking the continuous flow for last X blocks
          localJson.partial_stacked = partialStackedByCycle;
          writeJsonData(localJson);
        }

        // if in last X blocks before prepare phase and partial stacked amount has changed through new delegations (optional + previous tx being anchored)
        if (
          getBlocksUntilPreparePhase(poxAPIData) <
            triggerNumberOfLastXBlocksBeforeRewardPhase[network] &&
          partialStackedByCycle > 0 &&
          partialStackedByCycle !== localJson.partial_stacked
        ) {
          contractCallFunctionMaybeStackAggregationCommit(
            rewardCycleId,
            Pox4SignatureTopic.StackIncrease,
          );
          // update partial stacked for checking the continuous flow for last X blocks
          localJson.partial_stacked = partialStackedByCycle;
          writeJsonData(localJson);
        }
      }

      ///// distributing rewards
      // it is ok to keep the previous localJSON as it was updated as needed
      if (
        localJson.distribute_rewards_last_burn_block_height +
          blockSpanRewardDistribute[network] <
        currentBurnBlockHeight - offsetRewardDistribute[network]
      ) {
        const nrCalls =
          blockSpanRewardDistribute[network] / limitPerReadOnly[network];
        const blocksToDistribute: number[] = [];
        for (let i = 0; i < nrCalls; i++) {
          // call win
          const blocksToBeCalled: number[] = [];
          for (
            let j =
              localJson.distribute_rewards_last_burn_block_height +
              i * limitPerReadOnly[network];
            j <= limitPerReadOnly[network];
            j++
          ) {
            blocksToBeCalled.push(j);
          }
          const blocksWon =
            await readOnlyCheckWonBlockRewardsBatch(blocksToBeCalled);
          if (blocksWon.length > 0) {
            const localBlocksClaimable: number[] =
              await readOnlyCheckClaimedBlocksRewardsBatch(blocksWon);
            if (localBlocksClaimable.length > 0)
              blocksToDistribute.concat(localBlocksClaimable);
          }
        }
        // add the last blocks that are less than limitPerReadOnly
        for (
          let i =
            currentBurnBlockHeight -
            offsetRewardDistribute[network] -
            (blockSpanRewardDistribute[network] % limitPerReadOnly[network]);
          i < currentBurnBlockHeight - offsetRewardDistribute[network];
          i++
        ) {
          // duplicated body of the function
          // call win
          const blocksToBeCalled: number[] = [];
          for (
            let j =
              localJson.distribute_rewards_last_burn_block_height +
              i * limitPerReadOnly[network];
            j <= limitPerReadOnly[network];
            j++
          ) {
            blocksToBeCalled.push(j);
          }
          const blocksWon =
            await readOnlyCheckWonBlockRewardsBatch(blocksToBeCalled);
          if (blocksWon.length > 0) {
            const localBlocksClaimable: number[] =
              await readOnlyCheckClaimedBlocksRewardsBatch(blocksWon);
            if (localBlocksClaimable.length > 0)
              blocksToDistribute.concat(localBlocksClaimable);
          }
        }
        if (blocksToDistribute.length > 0) {
          // TODO: make sure this doesn't overflow
          // if it does, decrease the offset OR something else?
          const txDistribute: StacksTransaction =
            await contractCallFunctionDistributeRewards(blocksToDistribute);
          logData(
            LogTypeMessage.Info,
            `distributed rewards: ${txDistribute.txid()}`,
          );
        }
        localJson.distribute_rewards_last_burn_block_height =
          localJson.distribute_rewards_last_burn_block_height +
          blockSpanRewardDistribute[network];
        writeJsonData(localJson);
      }
    }
  }
};

// cron job every 50 seconds
runtime();

new CronJob(
  '0 */1 * * * *', // every minute
  () => {
    runtime();
  }, // onTick
  null, // onComplete
  true, // start
  'America/Los_Angeles', // timeZone
);
