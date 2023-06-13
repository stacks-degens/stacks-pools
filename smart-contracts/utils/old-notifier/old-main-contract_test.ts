import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.4.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';
const CONTRACT_NAME = 'old-main-contract';
const ASK_TO_JOIN = 'ask-to-join';
const GET_MINERS_LIST = 'get-miners-list';
const GET_WAITING_LIST = 'get-waiting-list';
const GET_PENDING_LIST = `get-pending-accept-list`;
const ADD_PENDING_MINERS = 'add-pending-miners-to-pool';
const VOTE_POSITIVE_JOIN = 'vote-positive-join-request';
const VOTE_NEGATIVE_JOIN = 'vote-negative-join-request';
const VOTE_POSITIVE_REMOVE = 'vote-positive-remove-request';
const VOTE_NEGATIVE_REMOVE = 'vote-negative-remove-request';
const VOTE_POSITIVE_NOTIFIER = 'vote-positive-notifier';
const VOTE_NEGATIVE_NOTIFIER = 'vote-negative-notifier';

const LEAVE_POOL = 'leave-pool';
const TRY_ENTER_POOL = 'try-enter-pool';
const PROPOSE_REMOVAL = 'propose-removal';
const PROPOSE_NOTIFIER = 'propose-notifier';
const GET_PROPOSED_NOTIFIERS_LIST = 'get-proposed-notifiers-list';
const GET_K = 'get-k';
const GET_NOTIFIER = 'get-notifier';
const err_no_vote_permission = '(err u105)';
const err_more_blocks_to_pass = '(err u106)';
const err_no_pending_miners = '(err u107)';
const err_already_voted = '(err u108)';
const err_not_asked_to_join = '(err u109)';
const err_notifier = '(err u113)';
const err_not_proposed_removal = '(err u117)';
const err_cant_vote_himself = '(err u119)';
const err_already_proposed_for_notifier = '(err u121)';
const err_not_proposed_notifier = '(err u124)';
const err_already_notifier = '(err u125)';

Clarinet.test({
  name: 'Adding miners to pool, election process',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    const user8 = accounts.get('wallet_8')!;

    // 1 miner asks to join

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(deployer.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    assertEquals(block.receipts[1].result, `[${user1.address}]`);
    assertEquals(block.receipts[2].result, `[${deployer.address}]`);
    assertEquals(block.receipts[3].result, `[]`);
    assertEquals(block.receipts[4].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts.length, 5);
    assertEquals(block.height, 2);

    // deployer votes no, so it is rejected

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
    ]);
    assertEquals(block.receipts[0].result, `${err_no_vote_permission}`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[]`);
    assertEquals(block.receipts[3].result, `[${deployer.address}]`);
    assertEquals(block.receipts[4].result, `[]`);
    assertEquals(block.receipts[5].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 3);

    // 1 miner asks to join

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(deployer.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    assertEquals(block.receipts[1].result, `[${user1.address}]`);
    assertEquals(block.receipts[2].result, `[${deployer.address}]`);
    assertEquals(block.receipts[3].result, `[]`);
    assertEquals(block.receipts[4].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts.length, 5);
    assertEquals(block.height, 4);

    // 100 blocks pass

    for (let i = 1; i <= 96; i++) {
      block = chain.mineBlock([]);
    }

    // deployer votes yes, so it is pending

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    assertEquals(block.receipts[0].result, `${err_no_vote_permission}`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `[]`);
    assertEquals(block.receipts[4].result, `[${deployer.address}]`);
    assertEquals(block.receipts[5].result, `[${user1.address}]`);
    assertEquals(block.receipts[6].result, `${err_more_blocks_to_pass}`);
    assertEquals(block.receipts[7].result, `[${user1.address}]`);
    assertEquals(block.receipts[8].result, `[${deployer.address}]`);
    assertEquals(block.receipts.length, 9);
    assertEquals(block.height, 101);

    // deployer tries to vote yes, no vote permission. Add miner to pool (100 blocks passed)

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `${err_not_asked_to_join}`);
    assertEquals(block.receipts[1].result, `${err_not_asked_to_join}`);
    assertEquals(block.receipts[2].result, `[]`);
    assertEquals(block.receipts[3].result, `[${deployer.address}]`);
    assertEquals(block.receipts[4].result, `[${user1.address}]`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `[]`);
    assertEquals(block.receipts[7].result, `[${deployer.address}, ${user1.address}]`);
    assertEquals(block.receipts.length, 8);
    assertEquals(block.height, 102);

    // another user asks to join

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${user2.address}]`);
    assertEquals(block.receipts[2].result, `[${deployer.address}, ${user1.address}]`);
    assertEquals(block.receipts[3].result, `[]`);
    assertEquals(block.receipts[4].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts.length, 5);
    assertEquals(block.height, 103);

    let k = chain.callReadOnlyFn(CONTRACT_NAME, GET_K, [], deployer.address);
    k.result.expectUint(0); // check k==1

    // 1 negative vote, 1 negative vote

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user2.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${user2.address}]`);
    assertEquals(block.receipts[2].result, `[${deployer.address}, ${user1.address}]`);
    assertEquals(block.receipts[3].result, `[]`);
    assertEquals(block.receipts[4].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts[5].result, `${err_already_voted}`); // deployer tried to vote again
    assertEquals(block.receipts[6].result, `(ok true)`); // user 1 voted negative
    assertEquals(block.receipts[7].result, `[]`); // no adresses in waiting list, negative election completed
    assertEquals(block.receipts.length, 8);
    assertEquals(block.height, 104);

    // another user asks to join

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${user2.address}]`);
    assertEquals(block.receipts[2].result, `[${deployer.address}, ${user1.address}]`);
    assertEquals(block.receipts[3].result, `[]`);
    assertEquals(block.receipts[4].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts.length, 5);
    assertEquals(block.height, 105);

    k = chain.callReadOnlyFn(CONTRACT_NAME, GET_K, [], deployer.address);
    k.result.expectUint(0); // check k==0
    // 1 positive vote

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[]`);
    assertEquals(block.receipts[3].result, `[${deployer.address}, ${user1.address}]`);
    assertEquals(block.receipts[4].result, `[${user2.address}]`); // user 2 pending accept, positive election completed
    assertEquals(block.receipts[5].result, `${err_more_blocks_to_pass}`);
    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 106);

    for (let i = 1; i <= 96; i++) block = chain.mineBlock([]);

    // accept pending user in pool

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `[]`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${user1.address}]`);
    assertEquals(block.receipts[2].result, `[${user2.address}]`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `[]`);
    assertEquals(block.receipts[5].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 203);

    // two users asks to join

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user4.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[${user3.address}, ${user4.address}]`);
    assertEquals(block.receipts[3].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[4].result, `[]`);
    assertEquals(block.receipts[5].result, `${err_no_pending_miners}`);
    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 204);

    k = chain.callReadOnlyFn(CONTRACT_NAME, GET_K, [], deployer.address);
    k.result.expectUint(1); // check k==1 (3 users in pool)

    // reject 1, accept 1

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user3.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user3.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `[${user4.address}]`);
    assertEquals(block.receipts[4].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[5].result, `[]`);
    assertEquals(block.receipts[6].result, `(ok true)`); // deployer vote positive for user
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `[]`); // no adresses in waiting list, negative/positive election completed
    assertEquals(block.receipts[9].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`); // all miners in miners list
    assertEquals(block.receipts[10].result, `[${user4.address}]`); // user 4 in pending list, positive election completed
    assertEquals(block.receipts.length, 11);
    assertEquals(block.height, 205);

    // two users asks to join

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user5.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[${user3.address}, ${user5.address}]`);
    assertEquals(block.receipts[3].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[4].result, `[${user4.address}]`);
    assertEquals(block.receipts[5].result, `${err_more_blocks_to_pass}`);
    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 206);

    k = chain.callReadOnlyFn(CONTRACT_NAME, GET_K, [], deployer.address);
    k.result.expectUint(1); // check k==1 (3 users in pool)

    // accept both

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user5.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user5.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[${user5.address}]`);
    assertEquals(block.receipts[3].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[4].result, `[${user4.address}, ${user3.address}]`);
    assertEquals(block.receipts[5].result, `(ok true)`); // deployer vote positive for user
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `[]`); // no adresses in waiting list, negative/positive election completed
    assertEquals(block.receipts[8].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`); // all miners in miners list
    assertEquals(block.receipts[9].result, `[${user4.address}, ${user3.address}, ${user5.address}]`); // user 4 in pending list, positive election completed
    assertEquals(block.receipts.length, 10);
    assertEquals(block.height, 207);

    k = chain.callReadOnlyFn(CONTRACT_NAME, GET_K, [], deployer.address);
    console.log(k.result.expectUint(1)); // check k==1

    // 100 blocks pass

    for (let i = 1; i <= 96; i++) block = chain.mineBlock([]);

    // add pending miners to pool

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user1.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user4.address}, ${user3.address}, ${user5.address}]`
    ); // 6 miners in pool
    assertEquals(block.receipts[3].result, `[]`); // no more pending miners

    k = chain.callReadOnlyFn(CONTRACT_NAME, GET_K, [], deployer.address);
    console.log(k.result.expectUint(3)); // check k==3 (n=6)
  },
});

Clarinet.test({
  name: '46 Miners ask to join',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 46; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 49);

    for (let i = 1; i <= 46; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 96);

    for (let i = 1; i <= 50; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 147);
  },
});

Clarinet.test({
  name: '100 Miners ask to join',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 103);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 204);

    for (let i = 1; i <= 50; i++) {
      block = chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 255);
  },
});

Clarinet.test({
  name: '300 Miners ask to join',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 302);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 602);

    for (let i = 1; i <= 50; i++) {
      block = chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 653);
  },
});

Clarinet.test({
  name: '100 Miners ask to join, vote NEGATIVE',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 103);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 204);
  },
});

Clarinet.test({
  name: '300 Miners ask to join, vote NEGATIVE',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 302);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 602);
  },
});

Clarinet.test({
  name: 'Leave pool 15 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 14; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 17);

    for (let i = 1; i <= 14; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 32);

    for (let i = 1; i <= 80; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    block.receipts[2].result.expectUint(9); // n=15, k=(15-1)*0.67=9
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 113);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    block.receipts[2].result.expectUint(8); // expecting k to be updated to u8 (9/(13-1)==0.75==k-critical) => k=[13*0.67]=8
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 114);
  },
});

Clarinet.test({
  name: 'Leave pool 20 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 19; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 22);

    for (let i = 1; i <= 19; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 42);

    for (let i = 1; i <= 80; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    block.receipts[2].result.expectUint(12); // n=20, k=(20-1)*0.67=12
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 123);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    block.receipts[3].result.expectUint(10); // expecting k to be updated to u10 (12/(17-1)==0.75==k-critical) => k=[16*0.67]=10
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 124);
  },
});

Clarinet.test({
  name: 'Leave pool 50 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    const user8 = accounts.get('wallet_8')!;
    const user9 = accounts.get('wallet_9')!;
    const user10 = accounts.get('wallet_10')!;
    const user11 = accounts.get('wallet_11')!;
    const user12 = accounts.get('wallet_12')!;
    const user13 = accounts.get('wallet_13')!;
    const user14 = accounts.get('wallet_14')!;
    const user15 = accounts.get('wallet_15')!;
    const user16 = accounts.get('wallet_16')!;
    const user17 = accounts.get('wallet_17')!;
    const user18 = accounts.get('wallet_18')!;
    const user19 = accounts.get('wallet_19')!;
    const user20 = accounts.get('wallet_20')!;
    const user21 = accounts.get('wallet_21')!;
    const user22 = accounts.get('wallet_22')!;
    const user23 = accounts.get('wallet_23')!;
    const user24 = accounts.get('wallet_24')!;
    const user25 = accounts.get('wallet_25')!;
    const user26 = accounts.get('wallet_26')!;
    const user27 = accounts.get('wallet_27')!;
    const user28 = accounts.get('wallet_28')!;
    const user29 = accounts.get('wallet_29')!;
    const user30 = accounts.get('wallet_30')!;
    const user31 = accounts.get('wallet_31')!;
    const user32 = accounts.get('wallet_32')!;
    const user33 = accounts.get('wallet_33')!;
    const user34 = accounts.get('wallet_34')!;
    const user35 = accounts.get('wallet_35')!;
    const user36 = accounts.get('wallet_36')!;
    const user37 = accounts.get('wallet_37')!;
    const user38 = accounts.get('wallet_38')!;
    const user39 = accounts.get('wallet_39')!;
    const user40 = accounts.get('wallet_40')!;
    const user41 = accounts.get('wallet_41')!;
    const user42 = accounts.get('wallet_42')!;
    const user43 = accounts.get('wallet_43')!;
    const user44 = accounts.get('wallet_44')!;
    const user45 = accounts.get('wallet_45')!;
    const user46 = accounts.get('wallet_46')!;
    const user47 = accounts.get('wallet_47')!;
    const user48 = accounts.get('wallet_48')!;
    const user49 = accounts.get('wallet_49')!;
    const user50 = accounts.get('wallet_50')!;
    const user51 = accounts.get('wallet_51')!;
    const user52 = accounts.get('wallet_52')!;
    const user53 = accounts.get('wallet_53')!;
    const user54 = accounts.get('wallet_54')!;
    const user55 = accounts.get('wallet_55')!;
    const user56 = accounts.get('wallet_56')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 49; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 52);

    for (let i = 1; i <= 49; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 102);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    // block.receipts[2].result.expectUint(12); // n=20, k=(20-1)*0.67=12
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 103);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user4.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user5.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user6.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user7.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user8.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user9.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user10.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user11.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user12.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user13.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user14.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user15.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user16.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user17.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user18.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user19.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user20.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user21.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user22.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user23.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user24.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user25.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user26.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user27.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user28.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user29.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user30.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user31.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user32.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user33.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user34.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user35.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user36.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user37.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user38.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user39.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user40.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user41.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user42.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user43.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user44.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user45.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user46.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user47.address),
      // Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], user48.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    block.receipts[4].result.expectUint(32); // expecting k to be updated to u10 (12/(17-1)==0.75==k-critical) => k=[16*0.67]=10
    assertEquals(block.receipts.length, 5);
    assertEquals(block.height, 104);
  },
});

Clarinet.test({
  name: 'Leave pool 100 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 103);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 204);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 205);

    for (let i = 1; i <= 98; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], miner.address)]);
    }
    assertEquals(block.height, 303);
  },
});

Clarinet.test({
  name: 'Leave pool 300 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 302);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 602);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 603);

    for (let i = 1; i <= 297; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], miner.address)]);
    }
    assertEquals(block.height, 900);
  },
});

Clarinet.test({
  name: 'Leave pool notifier',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, LEAVE_POOL, [], deployer.address)]);

    assertEquals(block.receipts[0].result, `${err_notifier}`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
  },
});

Clarinet.test({
  name: 'Remove case 3 miners in pool',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[]`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `[${user1.address}]`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `[${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts.length, 7);
    assertEquals(block.height, 3);

    for (let i = 0; i <= 101; i++) block = chain.mineBlock([]);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(block.receipts[2].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 106);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 107);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `[${deployer.address}, ${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[3].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 108);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 109);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${user2.address}]`);
    assertEquals(block.receipts[2].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 110);
  },
});

Clarinet.test({
  name: 'Remove case 5 miners in pool',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user4.address)], user4.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `[]`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `[${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}]`);
    assertEquals(block.receipts.length, 11);
    assertEquals(block.height, 3);

    for (let i = 0; i <= 101; i++) block = chain.mineBlock([]);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}]`
    );
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 106);

    // 5 miners in pool NOW
    // propose removal 1 user

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 107);

    // reject removal

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user4.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}]`
    );
    assertEquals(block.receipts[3].result, `${err_already_voted}`);
    assertEquals(block.receipts[4].result, `${err_cant_vote_himself}`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts.length, 7);
    assertEquals(block.height, 108);

    // still 5 users NOW
    // propose removal 1 user

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 109);

    // accept removal

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user2.address}, ${user3.address}, ${user4.address}]`
    );
    assertEquals(block.receipts[3].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 110);

    // 4 users NOW
    // propose removal 2 users (same block! so same k for voting)

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user3.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 111);

    // accept removal both users

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user2.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user3.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `[${deployer.address}, ${user4.address}]`);
    assertEquals(block.receipts[5].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 112);
  },
});

Clarinet.test({
  name: 'Remove case 9 miners in pool',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    const user8 = accounts.get('wallet_8')!;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user4.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user5.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user6.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user7.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user8.address)], user8.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts.length, 8);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user5.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user6.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user7.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user8.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user5.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user6.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user7.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user8.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `[]`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `(ok true)`);
    assertEquals(block.receipts[11].result, `(ok true)`);
    assertEquals(block.receipts[12].result, `(ok true)`);
    assertEquals(block.receipts[13].result, `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}]`);
    assertEquals(block.receipts[14].result, `(ok true)`);
    assertEquals(block.receipts[15].result, `(ok true)`);
    assertEquals(block.receipts[16].result, `(ok true)`);
    assertEquals(block.receipts[17].result, `(ok true)`);
    assertEquals(
      block.receipts[18].result,
      `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}]`
    );
    assertEquals(block.receipts.length, 19);
    assertEquals(block.height, 3);

    for (let i = 0; i <= 101; i++) block = chain.mineBlock([]);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}]`
    );
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 106);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 107);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user5.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}]`
    );
    assertEquals(block.receipts[3].result, `${err_already_voted}`);
    assertEquals(block.receipts[4].result, `${err_cant_vote_himself}`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts.length, 8);
    assertEquals(block.height, 108);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 109);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(
      block.receipts[5].result,
      `[${deployer.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}]`
    );
    assertEquals(block.receipts[6].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 7);
    assertEquals(block.height, 110);
  },
});

Clarinet.test({
  name: 'Remove case 20 miners in pool',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    const user8 = accounts.get('wallet_8')!;
    const user9 = accounts.get('wallet_9')!;
    const user10 = accounts.get('wallet_10')!;
    const user11 = accounts.get('wallet_11')!;
    const user12 = accounts.get('wallet_12')!;
    const user13 = accounts.get('wallet_13')!;
    const user14 = accounts.get('wallet_14')!;
    const user15 = accounts.get('wallet_15')!;
    const user16 = accounts.get('wallet_16')!;
    const user17 = accounts.get('wallet_17')!;
    const user18 = accounts.get('wallet_18')!;
    const user19 = accounts.get('wallet_19')!;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user4.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user5.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user6.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user7.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user8.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user9.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user10.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user11.address)], user11.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user12.address)], user12.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user13.address)], user13.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user14.address)], user14.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user15.address)], user15.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user16.address)], user16.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user17.address)], user17.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user18.address)], user18.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user19.address)], user19.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `(ok true)`);
    assertEquals(block.receipts[11].result, `(ok true)`);
    assertEquals(block.receipts[12].result, `(ok true)`);
    assertEquals(block.receipts[13].result, `(ok true)`);
    assertEquals(block.receipts[14].result, `(ok true)`);
    assertEquals(block.receipts[15].result, `(ok true)`);
    assertEquals(block.receipts[16].result, `(ok true)`);
    assertEquals(block.receipts[17].result, `(ok true)`);
    assertEquals(block.receipts[18].result, `(ok true)`);
    assertEquals(block.receipts.length, 19);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user5.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user6.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user7.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user8.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user9.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user10.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user11.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user12.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user13.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user14.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user15.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user16.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user17.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user18.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user19.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user4.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user5.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user6.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user7.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user8.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user9.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user10.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user11.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user12.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user13.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user14.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user15.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user16.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user17.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user18.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user19.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[19].result, `[]`);
    assertEquals(
      block.receipts[39].result,
      `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}, ${user17.address}, ${user18.address}, ${user19.address}]`
    );
    assertEquals(block.receipts.length, 40);
    assertEquals(block.height, 3);

    for (let i = 0; i <= 101; i++) block = chain.mineBlock([]);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}, ${user17.address}, ${user18.address}, ${user19.address}]`
    );
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 106);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 107);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user10.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}, ${user17.address}, ${user18.address}, ${user19.address}]`
    );
    assertEquals(block.receipts[3].result, `${err_already_voted}`);
    assertEquals(block.receipts[4].result, `${err_cant_vote_himself}`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `(ok true)`);
    assertEquals(block.receipts[11].result, `(ok true)`);
    assertEquals(block.receipts[12].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 13);
    assertEquals(block.height, 108);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 109);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user11.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user12.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], user13.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `(ok true)`);
    assertEquals(block.receipts[11].result, `(ok true)`);
    assertEquals(block.receipts[12].result, `${err_not_proposed_removal}`);
    assertEquals(
      block.receipts[13].result,
      `[${deployer.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}, ${user17.address}, ${user18.address}, ${user19.address}]`
    );
    assertEquals(block.receipts[14].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 15);
    assertEquals(block.height, 110);
  },
});

Clarinet.test({
  name: 'Remove case 300 miners in pool',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 302);

    for (let i = 1; i <= 299; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 602);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 603);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 604);

    for (let i = 2; i <= 102; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], miner.address),
      ]);
      assertEquals(block.receipts[0].result, `(ok true)`);
    }
    assertEquals(block.height, 705);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_REMOVAL, [types.principal(user1.address)], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 706);

    for (let i = 2; i <= 201; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_REMOVE, [types.principal(user1.address)], miner.address),
      ]);
      assertEquals(block.receipts[0].result, `(ok true)`);
    }
    assertEquals(block.height, 906);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_REMOVE, [types.principal(user1.address)], user2.address),
    ]);

    console.log('getting miners list');
    assertEquals(block.receipts[0].result, `[${deployer.address},${waiting_list.slice(1)}]`);
    assertEquals(block.receipts[1].result, `${err_not_proposed_removal}`);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 907);
  },
});

Clarinet.test({
  name: 'Update notifier 5 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user4.address)], user4.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `[]`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `[${user1.address}, ${user2.address}]`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}]`);
    assertEquals(block.receipts.length, 11);
    assertEquals(block.height, 3);

    for (let i = 0; i <= 101; i++) block = chain.mineBlock([]);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}]`
    );
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 106);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 107);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `${err_already_proposed_for_notifier}`);
    assertEquals(block.receipts[2].result, `[${user1.address}]`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `[${user1.address}, ${user2.address}, ${user3.address}]`);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_NOTIFIER, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user4.address),
    ]);

    assertEquals(block.receipts.length, 8);
    assertEquals(block.height, 108);
    assertEquals(block.receipts[0].result, `${err_cant_vote_himself}`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `[]`);
    assertEquals(block.receipts[6].result, `${user1.address}`);
    assertEquals(block.receipts[7].result, `${err_not_proposed_notifier}`);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user4.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(deployer.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 109);
    assertEquals(block.receipts[0].result, `${err_already_notifier}`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(
      block.receipts[5].result,
      `[${user2.address}, ${user3.address}, ${user4.address}, ${deployer.address}]`
    );

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(deployer.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(deployer.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_NOTIFIER, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user4.address),
    ]);

    assertEquals(block.receipts.length, 8);
    assertEquals(block.height, 110);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `[]`);
    assertEquals(block.receipts[6].result, `${deployer.address}`);
    assertEquals(block.receipts[7].result, `${err_not_proposed_notifier}`);
  },
});

Clarinet.test({
  name: 'Update notifier 21 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    const user8 = accounts.get('wallet_8')!;
    const user9 = accounts.get('wallet_9')!;
    const user10 = accounts.get('wallet_10')!;
    const user11 = accounts.get('wallet_11')!;
    const user12 = accounts.get('wallet_12')!;
    const user13 = accounts.get('wallet_13')!;
    const user14 = accounts.get('wallet_14')!;
    const user15 = accounts.get('wallet_15')!;
    const user16 = accounts.get('wallet_16')!;
    const user17 = accounts.get('wallet_17')!;
    const user18 = accounts.get('wallet_18')!;
    const user19 = accounts.get('wallet_19')!;
    const user20 = accounts.get('wallet_20')!;

    let block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user3.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user4.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user5.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user6.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user7.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user8.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user9.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user10.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user11.address)], user11.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user12.address)], user12.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user13.address)], user13.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user14.address)], user14.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user15.address)], user15.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user16.address)], user16.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user17.address)], user17.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user18.address)], user18.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user19.address)], user19.address),
      Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user20.address)], user20.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `(ok true)`);
    assertEquals(block.receipts[11].result, `(ok true)`);
    assertEquals(block.receipts[12].result, `(ok true)`);
    assertEquals(block.receipts[13].result, `(ok true)`);
    assertEquals(block.receipts[14].result, `(ok true)`);
    assertEquals(block.receipts[15].result, `(ok true)`);
    assertEquals(block.receipts[16].result, `(ok true)`);
    assertEquals(block.receipts[17].result, `(ok true)`);
    assertEquals(block.receipts[18].result, `(ok true)`);
    assertEquals(block.receipts[19].result, `(ok true)`);
    assertEquals(block.receipts.length, 20);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user5.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user6.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user7.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user8.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user9.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user10.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user11.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user12.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user13.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user14.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user15.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user16.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user17.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user18.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user19.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user20.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user1.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user2.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user3.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user4.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user5.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user6.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user7.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user8.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user9.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user10.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user11.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user12.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user13.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user14.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user15.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user16.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user17.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user18.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user19.address),
      Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], user20.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[20].result, `[]`);
    assertEquals(
      block.receipts[41].result,
      `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}, ${user17.address}, ${user18.address}, ${user19.address}, ${user20.address}]`
    );
    assertEquals(block.receipts.length, 42);
    assertEquals(block.height, 3);

    for (let i = 0; i <= 101; i++) block = chain.mineBlock([]);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(
      block.receipts[2].result,
      `[${deployer.address}, ${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}, ${user17.address}, ${user18.address}, ${user19.address}, ${user20.address}]`
    );
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 106);

    // 16 proposed notifiers, ?? votes each, last one ?? votes

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user2.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user3.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user4.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user5.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user6.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user7.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user8.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user9.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user10.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user11.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user12.address)], user11.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user13.address)], user12.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user14.address)], user13.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user15.address)], user14.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user16.address)], user15.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts.length, 17);
    assertEquals(block.height, 107);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(block.receipts[5].result, `(ok true)`);
    assertEquals(block.receipts[6].result, `(ok true)`);
    assertEquals(block.receipts[7].result, `(ok true)`);
    assertEquals(block.receipts[8].result, `(ok true)`);
    assertEquals(block.receipts[9].result, `(ok true)`);
    assertEquals(block.receipts[10].result, `(ok true)`);
    assertEquals(block.receipts[11].result, `(ok true)`);
    assertEquals(block.receipts[12].result, `(ok true)`);
    assertEquals(block.receipts[13].result, `(ok true)`);
    assertEquals(block.receipts[14].result, `(ok true)`);
    assertEquals(block.receipts[15].result, `(ok true)`);
    assertEquals(
      block.receipts[16].result,
      `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}, ${user6.address}, ${user7.address}, ${user8.address}, ${user9.address}, ${user10.address}, ${user11.address}, ${user12.address}, ${user13.address}, ${user14.address}, ${user15.address}, ${user16.address}]`
    );

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user6.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user7.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user8.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user9.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user10.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user11.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user12.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user13.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user14.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user15.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user6.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user7.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user8.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user9.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user10.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user11.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user12.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user13.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user14.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user15.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user6.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user7.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user8.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user9.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user10.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user11.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user12.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user13.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user14.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user15.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user11.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user16.address)], user12.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_NOTIFIER, [], deployer.address),
    ]);

    assertEquals(block.receipts.length, 61);
    assertEquals(block.height, 108);
    assertEquals(block.receipts[58].result, `${err_not_proposed_notifier}`);
    assertEquals(block.receipts[59].result, `[]`);
    assertEquals(block.receipts[60].result, `${user16.address}`);

    // 5 proposed notifiers, 10 votes each, last one 13 votes

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user4.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user5.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
    ]);

    assertEquals(block.receipts.length, 6);
    assertEquals(block.height, 109);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `(ok true)`);
    assertEquals(block.receipts[2].result, `(ok true)`);
    assertEquals(block.receipts[3].result, `(ok true)`);
    assertEquals(block.receipts[4].result, `(ok true)`);
    assertEquals(
      block.receipts[5].result,
      `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}]`
    );

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user4.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user1.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user2.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user3.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user5.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user6.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user7.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user8.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user9.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user10.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user11.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user12.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user13.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user14.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_NOTIFIER, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user4.address),
    ]);

    assertEquals(block.receipts.length, 57);
    assertEquals(block.height, 110);
    assertEquals(block.receipts[54].result, `[]`);
    assertEquals(block.receipts[55].result, `${user5.address}`);
    assertEquals(block.receipts[56].result, `${err_not_proposed_notifier}`);
  },
});

Clarinet.test({
  name: 'Update notifier 50 users',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    const user3 = accounts.get('wallet_3')!;
    const user4 = accounts.get('wallet_4')!;
    const user5 = accounts.get('wallet_5')!;
    const user6 = accounts.get('wallet_6')!;
    const user7 = accounts.get('wallet_7')!;
    const user8 = accounts.get('wallet_8')!;
    const user9 = accounts.get('wallet_9')!;
    const user10 = accounts.get('wallet_10')!;
    const user11 = accounts.get('wallet_11')!;
    const user12 = accounts.get('wallet_12')!;
    const user13 = accounts.get('wallet_13')!;
    const user14 = accounts.get('wallet_14')!;
    const user15 = accounts.get('wallet_15')!;
    const user16 = accounts.get('wallet_16')!;
    const user17 = accounts.get('wallet_17')!;
    const user18 = accounts.get('wallet_18')!;
    const user19 = accounts.get('wallet_19')!;
    const user20 = accounts.get('wallet_20')!;
    const user21 = accounts.get('wallet_21')!;
    const user22 = accounts.get('wallet_22')!;
    const user23 = accounts.get('wallet_23')!;
    const user24 = accounts.get('wallet_24')!;
    const user25 = accounts.get('wallet_25')!;
    const user26 = accounts.get('wallet_26')!;
    const user27 = accounts.get('wallet_27')!;
    const user28 = accounts.get('wallet_28')!;
    const user29 = accounts.get('wallet_29')!;
    const user30 = accounts.get('wallet_30')!;
    const user31 = accounts.get('wallet_31')!;
    const user32 = accounts.get('wallet_32')!;
    const user33 = accounts.get('wallet_33')!;
    const user34 = accounts.get('wallet_34')!;
    const user35 = accounts.get('wallet_35')!;
    const user36 = accounts.get('wallet_36')!;
    const user37 = accounts.get('wallet_37')!;
    const user38 = accounts.get('wallet_38')!;
    const user39 = accounts.get('wallet_39')!;
    const user40 = accounts.get('wallet_40')!;
    const user41 = accounts.get('wallet_41')!;
    const user42 = accounts.get('wallet_42')!;
    const user43 = accounts.get('wallet_43')!;
    const user44 = accounts.get('wallet_44')!;
    const user45 = accounts.get('wallet_45')!;
    const user46 = accounts.get('wallet_46')!;
    const user47 = accounts.get('wallet_47')!;
    const user48 = accounts.get('wallet_48')!;
    const user49 = accounts.get('wallet_49')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    for (let i = 1; i <= 49; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(miner.address)], miner.address),
      ]);
      if (i == 1) waiting_list.push(`${miner.address}`);
      else waiting_list.push(` ${miner.address}`);
    }
    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_WAITING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 52);

    for (let i = 1; i <= 49; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(miner.address)], deployer.address),
        Tx.contractCall(CONTRACT_NAME, TRY_ENTER_POOL, [], miner.address),
      ]);
    }

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], deployer.address)]);
    assertEquals(block.receipts[0].result, `[${waiting_list}]`);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 102);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, ADD_PENDING_MINERS, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_MINERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_K, [], user3.address),
    ]);
    console.log(block.receipts, waiting_list.length);
    assertEquals(block.receipts[0].result, `(ok true)`);
    assertEquals(block.receipts[1].result, `[${deployer.address}, ${waiting_list}]`);
    // block.receipts[2].result.expectUint(12); // n=20, k=(20-1)*0.67=12
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 103);

    // 45 proposed notifiers, 1 votes each, last one 32 votes
    let proposed_list = [];

    for (let i = 1; i <= 45; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(miner.address)], deployer.address),
      ]);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, `(ok true)`);
      if (i == 1) proposed_list.push(`${miner.address}`);
      else proposed_list.push(` ${miner.address}`);
    }
    assertEquals(block.height, 148);

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address)]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 149);
    assertEquals(block.receipts[0].result, `[${proposed_list}]`);

    // 32 votes needed
    for (let i = 1; i <= 45; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(miner.address)], deployer.address),
      ]);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, `(ok true)`);
    }
    assertEquals(block.height, 194);

    for (let i = 2; i <= 32; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], miner.address),
      ]);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, `(ok true)`);
    }
    assertEquals(block.height, 225);

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_NOTIFIER, [], deployer.address),
    ]);

    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 226);
    assertEquals(block.receipts[0].result, `${err_not_proposed_notifier}`);
    assertEquals(block.receipts[1].result, `[]`);
    assertEquals(block.receipts[2].result, `${user1.address}`);

    // // 5 proposed notifiers, 10 votes each, last one 13 votes

    // block = chain.mineBlock([
    //   Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user1.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user2.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user3.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user4.address)], user3.address),
    //   Tx.contractCall(CONTRACT_NAME, PROPOSE_NOTIFIER, [types.principal(user5.address)], user3.address),
    //   Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
    // ]);

    // assertEquals(block.receipts.length, 6);
    // assertEquals(block.height, 109);
    // assertEquals(block.receipts[0].result, `(ok true)`);
    // assertEquals(block.receipts[1].result, `(ok true)`);
    // assertEquals(block.receipts[2].result, `(ok true)`);
    // assertEquals(block.receipts[3].result, `(ok true)`);
    // assertEquals(block.receipts[4].result, `(ok true)`);
    // assertEquals(
    //   block.receipts[5].result,
    //   `[${user1.address}, ${user2.address}, ${user3.address}, ${user4.address}, ${user5.address}]`
    // );

    // block = chain.mineBlock([
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user2.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user3.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user4.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user5.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user6.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user7.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user8.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user9.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user1.address)], user10.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user1.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user3.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user4.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user5.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user6.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user7.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user8.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user9.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user10.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user1.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user2.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user4.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user5.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user6.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user7.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user8.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user9.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user3.address)], user10.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user1.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user2.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user3.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user5.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user6.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user7.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user8.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user9.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user4.address)], user10.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user1.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user2.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user3.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user5.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user6.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user7.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user8.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user9.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user10.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user11.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user12.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user13.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user5.address)], user14.address),
    //   Tx.contractCall(CONTRACT_NAME, GET_PROPOSED_NOTIFIERS_LIST, [], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, GET_NOTIFIER, [], deployer.address),
    //   Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_NOTIFIER, [types.principal(user2.address)], user4.address),
    // ]);

    // assertEquals(block.receipts.length, 57);
    // assertEquals(block.height, 110);
    // assertEquals(block.receipts[54].result, `[]`);
    // assertEquals(block.receipts[55].result, `${user5.address}`);
    // assertEquals(block.receipts[56].result, `${err_not_proposed_notifier}`);
  },
});
