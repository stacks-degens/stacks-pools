import {
  getApiPoxData,
  getBlocksUntilPreparePhase,
  getCheckCanDelegateAgainNow,
  getCurrentBurnchainBlockHeight,
  getCurrentCycle,
  getNonceData,
  getRewardPhaseBlockLength,
  isInPreparePhase,
} from './apiPox';
import {
  contractCallFunctionDelegateStackStxMany,
  contractCallFunctionDistributeRewards,
  contractCallFunctionMaybeStackAggregationCommit,
  contractCallFunctionUpdateSCBalances,
  logContractCallBroadcast,
} from './functionsContractCall';
import {
  PoxInfoMap,
  readOnlyCheckClaimedBlocksRewardsBatch,
  readOnlyCheckWonBlockRewardsBatch,
  readOnlyGetPartialStackedByCycle,
  readOnlyGetPoxAddressIndices,
  readOnlyGetPoxInfo,
  readOnlyGetStackersList,
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
  eventData,
  LocalData,
  logData,
  LogTypeMessage,
  readJsonData,
  refreshJsonData,
  saveErrorLog,
  writeJsonData,
} from './fileLocalData';
import { Pox4SignatureTopic } from '@stacks/stacking';
import { network, stxToUstx, transactionUrl } from './network';
import { CronJob } from 'cron';
import { TxBroadcastResult } from '@stacks/transactions';

// based on burn block height
// 1. prepare phase
//   a. check if update balances happened for current cycle
//   b. if it didn't call update balances -> set that txid somewhere to check its status, the block height when it was called and nonce
//      if after 10 blocks it didn't confirmed, increase the fee and call it with same nonce
// 2. reward phase
//   extend stacking current users
//   create signature
//   check partial stacked from pox-4 (you need pox-address and reward cycle), if partial stacked > min threshold (also from pox-4)
//     call maybe-commit-aggregate
//    with 100 blocks before prepare phase starts, call maybe-commit-aggregate
//    also 10 blocks before ->
//    with 15 blocks block before prepare-phase from front-end the possibility to delegate

// as there might be server failings, we could run this and update the json only at the end of different flows
// this way if there was any progress, such smart contract calls, it would track the ones that were broadcasted and not do them again

// at every new block height
const runtimeLogic = async () => {
  // general calls
  let localJson: LocalData = readJsonData();
  const poxAPIData = await getApiPoxData();
  const currentBurnBlockHeight: number =
    getCurrentBurnchainBlockHeight(poxAPIData);
  // start all the flow only after the block changes
  if (localJson.current_burn_block_height < currentBurnBlockHeight) {
    localJson.nonce_to_use = await getNonceData();

    localJson.current_burn_block_height = currentBurnBlockHeight;
    // when cycle changes, update local parameters that are used for checking
    if (localJson.current_cycle < getCurrentCycle(poxAPIData)) {
      eventData(
        LogTypeMessage.Info,
        `current cycle changed from ${localJson.current_cycle} to: ${getCurrentCycle(poxAPIData)}`,
      );
      localJson.current_cycle = getCurrentCycle(poxAPIData);
      refreshJsonData(localJson);
      localJson = readJsonData();
    }
    logData(
      LogTypeMessage.Info,
      `current burn block height: ${currentBurnBlockHeight}`,
    );

    // if reward-cycle is different between SC and API -> flag it
    const poxInfo: PoxInfoMap = await readOnlyGetPoxInfo();
    const rewardCycleId: number = poxInfo.get('reward-cycle-id') || -1;
    const currentCycleIdApi: number = getCurrentCycle(poxAPIData);
    logData(LogTypeMessage.Info, `current cycle: ${rewardCycleId}`);

    // would throw this error when in the block when prepare phase end and reward phase starts,
    // The API updates the cycle id 1 block faster (from block 0 in reward phase), the SC waits for the first reward block to update it
    // this block height is when reward phase lenth === blocks until prepare phase
    // added conditional so no unexpected behavior happens when getting this case
    if (
      rewardCycleId !== currentCycleIdApi &&
      getRewardPhaseBlockLength(poxAPIData) !==
        getBlocksUntilPreparePhase(poxAPIData)
    ) {
      logData(
        LogTypeMessage.Warn,
        `reward cycles different: \
        SC: ${rewardCycleId} ${typeof rewardCycleId}, \
        API: ${currentCycleIdApi} ${typeof currentCycleIdApi} \
        at burn block height: ${currentBurnBlockHeight}`,
      );
    } else {
      // check is prepare phase
      const isPreparePhase = isInPreparePhase(poxAPIData);
      if (isPreparePhase) logData(LogTypeMessage.Info, `is in prepare phase`);
      else logData(LogTypeMessage.Info, `is in reward phase`);

      if (isPreparePhase) {
        // check already updated balances
        // 1. local

        logData(
          LogTypeMessage.Info,
          `updated balances this cycle ${localJson.updated_balances_this_cycle}`,
        );
        if (!localJson.updated_balances_this_cycle) {
          if (localJson.update_balances_txid === '') {
            // 2. update balances
            const updateBalanceTransaction: TxBroadcastResult =
              await contractCallFunctionUpdateSCBalances(
                BigInt(feeContractCall.updateBalances * stxToUstx),
              );
            logContractCallBroadcast(
              updateBalanceTransaction,
              'update-sc-balances',
            );
            localJson.update_balances_burn_block_height =
              currentBurnBlockHeight;
            localJson.update_balances_txid = updateBalanceTransaction.txid;
            localJson.nonce_to_use++;
            writeJsonData(localJson);
          } else {
            // we have txid broadcasted
            const txResponse = await fetch(
              transactionUrl(localJson.update_balances_txid).apiUrl,
            ).then((x) => x.json());
            // 3.a. first check if it is anchored and update json if so
            switch (txResponse.tx_status) {
              case 'success':
                const alreadyUpdatedBalancesReadOnly =
                  await readOnlyUpdatedBalancesGivenCycle(rewardCycleId + 1);
                // 3.b. then from read-only
                if (alreadyUpdatedBalancesReadOnly) {
                  localJson.updated_balances_this_cycle = true;
                  writeJsonData(localJson);
                  eventData(
                    LogTypeMessage.Info,
                    `Updated balances is confirmed. The tx is succesfully anchored ${localJson.update_balances_txid}`,
                  );
                } else {
                  eventData(
                    LogTypeMessage.Err,
                    `Something went wrong with broadcasted data. The tx is succesfully anchored ${localJson.update_balances_txid}`,
                  );
                }
                break;
              case 'abort_by_response':
                eventData(
                  LogTypeMessage.Err,
                  `Something went wrong with broadcasted data. The tx is aborted by response: ${localJson.update_balances_txid}`,
                );
                break;
              case 'pending':
                // 4. increase fees update balances as that transaction is not happening after `a` blocks
                // get nonce from txid
                if (
                  localJson.update_balances_burn_block_height +
                    offsetIncreaseUpdateBalances[network] <
                  currentBurnBlockHeight
                ) {
                  const nonce: number = txResponse.nonce;
                  const updateBalanceTransaction: TxBroadcastResult =
                    await contractCallFunctionUpdateSCBalances(
                      BigInt(
                        feeContractCall.updateBalancesIncreasedFee * stxToUstx,
                      ),
                      BigInt(nonce),
                    );
                  // succesful broadcast
                  if (updateBalanceTransaction.reason === undefined) {
                    localJson.update_balances_burn_block_height =
                      currentBurnBlockHeight;
                    localJson.update_balances_txid =
                      updateBalanceTransaction.txid;
                    writeJsonData(localJson);
                    eventData(
                      LogTypeMessage.Info,
                      `update balances increased fees tx`,
                    );
                  }
                  logContractCallBroadcast(
                    updateBalanceTransaction,
                    'update-sc-balances',
                  );
                }
                break;
              // Add more cases if needed
              default:
                eventData(
                  LogTypeMessage.Err,
                  `Unhandled transaction status: ${txResponse.tx_status}`,
                );
                break;
            }
          }
        }
      } else {
        // is reward phase

        // check when possible to call delegate-stack-stx-many from stacking-pool
        // when possible, call it and save it to json file
        if (!localJson.delegated_stack_stx_many_this_cycle) {
          const checkCanDelegateAgainNow =
            getCheckCanDelegateAgainNow(poxAPIData);
          if (checkCanDelegateAgainNow) {
            // TODO: maybe overflow here
            const stackersAddresses = await readOnlyGetStackersList();
            const txResponse: TxBroadcastResult =
              await contractCallFunctionDelegateStackStxMany(stackersAddresses);
            if (txResponse.reason === undefined) {
              localJson.delegated_stack_stx_many_this_cycle = true;
              localJson.delegated_stack_stx_many_txid = txResponse.txid;
              localJson.nonce_to_use++;
              writeJsonData(localJson);
            }
            logContractCallBroadcast(txResponse, 'delegate-stack-stx-many');
          }
        }

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

        const stackingMinimum = await readOnlyGetStackingMinimum();
        // if no indices , do commit asap
        if (!poxAddressIndices) {
          logData(
            LogTypeMessage.Info,
            `stacking minimum by cycle ${rewardCycleId + 1}: ${stackingMinimum}`,
          );
          if (
            partialStackedByCycle > stackingMinimum &&
            !localJson.commit_agg_this_cycle
          ) {
            const txResponse: TxBroadcastResult =
              await contractCallFunctionMaybeStackAggregationCommit(
                rewardCycleId,
                Pox4SignatureTopic.AggregateCommit,
              );
            if (txResponse.reason === undefined) {
              localJson.commit_agg_txid = txResponse.txid;
              localJson.commit_agg_this_cycle = true;
              localJson.commit_agg_burn_block_height = currentBurnBlockHeight;
              localJson.nonce_to_use++;
              writeJsonData(localJson);
              eventData(
                LogTypeMessage.Info,
                `partial stacked enough, performed agg-commit for cycle ${rewardCycleId + 1}`,
              );
            }
            logContractCallBroadcast(
              txResponse,
              'maybe-stack-aggregation-commit > agg-commit',
            );
          }
        } else {
          // there is an amount to be commited > threshold and at least x blocks have passed
          // TODO: wouldn't it be better to just increase it when the threshold is met? we also call increase in the end
          if (
            partialStackedByCycle > stackingMinimum &&
            localJson.increase_agg_burn_block_height +
              blockSpanAggIncrease[network] <
              currentBurnBlockHeight
          ) {
            const txResponse: TxBroadcastResult =
              await contractCallFunctionMaybeStackAggregationCommit(
                rewardCycleId,
                Pox4SignatureTopic.AggregateIncrease,
              );
            // update partial stacked for checking the continuous flow for last X blocks
            if (txResponse.reason === undefined) {
              localJson.partial_stacked = partialStackedByCycle;
              localJson.increase_agg_burn_block_height = currentBurnBlockHeight;
              localJson.nonce_to_use++;
              eventData(
                LogTypeMessage.Info,
                `partial stacked enough and offset passed, performed agg-increase for cycle ${rewardCycleId + 1}`,
              );
              writeJsonData(localJson);
            }
            logContractCallBroadcast(
              txResponse,
              'maybe-stack-aggregation-commit > agg-increase',
            );
          }

          // if in last X blocks before prepare phase and partial stacked amount has changed through new delegations (optional + previous tx being anchored)
          if (
            getBlocksUntilPreparePhase(poxAPIData) <
              triggerNumberOfLastXBlocksBeforeRewardPhase[network] &&
            partialStackedByCycle > 0 &&
            partialStackedByCycle !== localJson.partial_stacked
          ) {
            const txResponse: TxBroadcastResult =
              await contractCallFunctionMaybeStackAggregationCommit(
                rewardCycleId,
                Pox4SignatureTopic.StackIncrease,
              );
            // update partial stacked for checking the continuous flow for last X blocks
            localJson.partial_stacked = partialStackedByCycle;
            localJson.nonce_to_use++;

            if (txResponse.reason === undefined) {
              localJson.partial_stacked = partialStackedByCycle;
              eventData(
                LogTypeMessage.Info,
                `partial stacked enough and offset passed, performed agg-increase for cycle ${rewardCycleId + 1}`,
              );
              writeJsonData(localJson);
            }
            logContractCallBroadcast(
              txResponse,
              'maybe-stack-aggregation-commit > agg-increase',
            );
          }
        }
      }
      ///// distributing rewards
      // it is ok to keep the previous localJSON as it was updated as needed
      if (
        localJson.distribute_rewards_first_burn_block_height_to_check +
          blockSpanRewardDistribute[network] <
        currentBurnBlockHeight - offsetRewardDistribute[network]
      ) {
        const blocksToDistribute: number[] = [];
        // only call it till given block height
        let finalBlockHeight =
          currentBurnBlockHeight - offsetRewardDistribute[network];
        let iterativeCurrentBlockHeight =
          localJson.distribute_rewards_first_burn_block_height_to_check;

        while (iterativeCurrentBlockHeight < finalBlockHeight) {
          let currentNumbers = 0;
          const blocksToBeCalled: number[] = [];
          while (
            iterativeCurrentBlockHeight < finalBlockHeight &&
            currentNumbers <= limitPerReadOnly[network]
          ) {
            blocksToBeCalled.push(iterativeCurrentBlockHeight);
            iterativeCurrentBlockHeight++;
            currentNumbers++;
          }
          if (currentNumbers > 0) {
            const blocksWon =
              await readOnlyCheckWonBlockRewardsBatch(blocksToBeCalled);
            if (blocksWon.length > 0) {
              eventData(LogTypeMessage.Info, `blocks won: ${blocksWon}`);
              // TODO: remove the below comments after it gets the rewards accordingly from this flow
              // TODO: remove this in final release
              blocksToDistribute.push(...blocksWon);
              // TODO: uncomment this in final release
              // const localBlocksClaimable: number[] =
              //   await readOnlyCheckClaimedBlocksRewardsBatch(blocksWon);
              // eventData(LogTypeMessage.Info, `blocks claimable: ${blocksWon}`);
              // if (localBlocksClaimable.length > 0)
              // blocksToDistribute.push(...localBlocksClaimable);
            }
          }

          localJson.distribute_rewards_first_burn_block_height_to_check =
            iterativeCurrentBlockHeight + 1;
          writeJsonData(localJson);
          if (iterativeCurrentBlockHeight === finalBlockHeight - 1) break;
        }

        if (blocksToDistribute.length > 0) {
          const txDistribute: TxBroadcastResult =
            await contractCallFunctionDistributeRewards(blocksToDistribute);
          localJson.nonce_to_use++;
          if (txDistribute.reason === undefined) {
            eventData(
              LogTypeMessage.Info,
              `blocks rewards distributed: ${blocksToDistribute}`,
            );
          }
          logContractCallBroadcast(txDistribute, 'distribute-rewards');
        }
        localJson.distribute_rewards_first_burn_block_height_to_check =
          localJson.distribute_rewards_first_burn_block_height_to_check +
          blockSpanRewardDistribute[network];
        writeJsonData(localJson);
      }
      writeJsonData(localJson);
    }
  }
};

const main = async () => {
  try {
    await runtimeLogic();
  } catch (error) {
    console.log('Error:', error);
    saveErrorLog(error.message);
  }
};

main();

new CronJob(
  '0 */2 * * * *', // every minute
  () => {
    main();
  }, // onTick
  null, // onComplete
  true, // start
  'America/Los_Angeles', // timeZone
);

// new CronJob(
//   '*/10 * * * * *', // every minute
//   () => {
//     main();
//   }, // onTick
//   null, // onComplete
//   true, // start
//   'America/Los_Angeles', // timeZone
// );
