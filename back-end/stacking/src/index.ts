import { fetchPoxInfo } from './api-calls';
import { runConfigValidator } from './checks';
import {
  checkAndBroadcastTransactions,
  createTables,
  clearTables,
  getEvents,
  parseEvents,
  removeAnchoredTransactionsFromDatabase,
} from './helpers';
// import {
//   saveAcceptedDelegations,
//   saveCommittedDelegations,
//   saveDelegations,
//   savePreviousDelegations,
// } from './save-data';
import { computeBalances, getAreBalancesComputed, sleep } from './transactions';

const main = async () => {
  await runConfigValidator();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await createTables();
      const poxInfo = await fetchPoxInfo();

      if (poxInfo === null) {
        continue;
      }

      const currentCycle = poxInfo.current_cycle.id;
      const currentBlock = poxInfo.current_burnchain_block_height;
      const blocksUntilPreparePhase =
        poxInfo.next_cycle.blocks_until_prepare_phase;

      console.log('Current cycle:', currentCycle);

      if (blocksUntilPreparePhase > 0) {
        console.log(
          "Next cycle's prepare phase starts in",
          blocksUntilPreparePhase,
          'blocks.'
        );

        const dbEntries = await removeAnchoredTransactionsFromDatabase();
        const events = await getEvents();

        // const rewardIndexesMap = await getRewardIndexesMap(currentCycle);

        const {
          delegations,
          acceptedDelegations,
          committedDelegations,
          previousDelegations,
        } = await parseEvents(events);

        console.log('Delegations:', delegations);
        console.log('Accepted Delegations:', acceptedDelegations);
        console.log('Committed Delegations:', committedDelegations);
        console.log('Previous Delegations:', previousDelegations);

        await clearTables();

        // await saveDelegations(delegations);
        // await saveAcceptedDelegations(acceptedDelegations);
        // await saveCommittedDelegations(committedDelegations);
        // await savePreviousDelegations(previousDelegations);

        if (blocksUntilPreparePhase < 100) {
          await checkAndBroadcastTransactions(
            delegations,
            acceptedDelegations,
            committedDelegations,
            currentCycle,
            currentBlock,
            dbEntries
          );
        }
      } else {
        if (!(await getAreBalancesComputed(currentCycle + 1))) {
          await computeBalances();
          await sleep(60000);
        } else {
          console.log(
            "We're in the prepare phase for cycle",
            currentCycle + 1 + '.',
            'Waiting for the next cycle to start in order to resume the operations.'
          );
        }

        await sleep(60000);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

main();
