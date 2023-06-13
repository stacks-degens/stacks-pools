import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
  ExpectSTXTransferEvent,
} from 'https://deno.land/x/clarinet@v1.4.2/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

const CONTRACT_NAME = 'balance';
const DEPOSIT = 'deposit-stx';
const WITHDRAW = 'withdraw-stx';
const GET_BALANCE = 'get-balance';
const REWARD_DISTRIBUTION = 'reward-distribution';
const err_insufficient_balance = '(err u1001)';
const err_missing_balance = '(err u1002)';

const CONVERT_TO_STX = (amount) => {
  return amount * 1000000;
};

// test for 100 users
// each deposits his index amount
// check with events emitted

Clarinet.test({
  name: 'Ensure 100 users deposits their amount succesfully',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    let txs = [];
    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, DEPOSIT, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);
      block.receipts[0].result.expectOk();
      //amount: bigint; sender: string; recipient: string; }
      //   block.receipts[0].events.ExpectSTXTransferEvent(i, miner.address, CONTRACT_NAME);
      assertEquals(block.receipts[0].events[0].type, 'stx_transfer_event');
      assertEquals(block.receipts[0].events[0].stx_transfer_event.sender, miner.address);
      assertEquals(block.receipts[0].events[0].stx_transfer_event.recipient, deployer.address + '.' + CONTRACT_NAME);
      assertEquals(block.receipts[0].events[0].stx_transfer_event.amount, `${CONVERT_TO_STX(i)}`);
    }
  },
});

// test 2
// check each has that using read only call
Clarinet.test({
  name: 'Ensure 100 users deposits their amount succesfully',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    // read only call
    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      let balance = chain.callReadOnlyFn(
        CONTRACT_NAME,
        GET_BALANCE,
        [types.principal(miner.address)],
        deployer.address
      );
      balance.result.expectNone();
    }

    let txs = [];
    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, DEPOSIT, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);

      block.receipts[0].result.expectOk();
      block.receipts[0].events.expectSTXTransferEvent(
        CONVERT_TO_STX(i),
        miner.address,
        deployer.address + '.' + CONTRACT_NAME
      );
    }

    // read only call
    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      let balance = chain.callReadOnlyFn(
        CONTRACT_NAME,
        GET_BALANCE,
        [types.principal(miner.address)],
        deployer.address
      );
      balance.result.expectSome().expectUint(CONVERT_TO_STX(i)); // check k==1
    }
  },
});

// test 3
// check no one can withdraw without depositing first and neither can withdraw more than deposited
Clarinet.test({
  name: 'Ensure 100 users cannot withdraw without depositing first and neither cannot withdraw more than deposited',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, WITHDRAW, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);
      block.receipts[0].result.expectErr(err_insufficient_balance);
    }

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, DEPOSIT, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);

      block.receipts[0].result.expectOk();
      block.receipts[0].events.expectSTXTransferEvent(
        CONVERT_TO_STX(i),
        miner.address,
        deployer.address + '.' + CONTRACT_NAME
      );
    }

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, WITHDRAW, [types.uint(CONVERT_TO_STX(i) + 1)], miner.address),
      ]);
      block.receipts[0].result.expectErr(err_insufficient_balance);
    }
  },
});

// test 4
// chech each can withdraw his amount
Clarinet.test({
  name: 'Ensure 100 users can withdraw their amount',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let waiting_list = [];
    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, DEPOSIT, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);

      block.receipts[0].result.expectOk();
      block.receipts[0].events.expectSTXTransferEvent(
        CONVERT_TO_STX(i),
        miner.address,
        deployer.address + '.' + CONTRACT_NAME
      );
    }

    for (let i = 1; i <= 5; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, WITHDRAW, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);

      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, GET_BALANCE, [types.principal(miner.address)], miner.address),
      ]);
      block.receipts[0].result.expectSome().expectUint(0);
    }
  },
});

Clarinet.test({
  name: 'Rewards distribution test',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    let block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 2);

    for (let i = 1; i <= 100; i++) {
      const miner = accounts.get(`wallet_${i}`)!;
      block = chain.mineBlock([
        Tx.contractCall(CONTRACT_NAME, DEPOSIT, [types.uint(CONVERT_TO_STX(i))], miner.address),
      ]);

      block.receipts[0].result.expectOk();
      block.receipts[0].events.expectSTXTransferEvent(
        CONVERT_TO_STX(i),
        miner.address,
        deployer.address + '.' + CONTRACT_NAME
      );
    }

    block = chain.mineBlock([
      Tx.contractCall(CONTRACT_NAME, REWARD_DISTRIBUTION, [types.uint(5)], deployer.address),
      Tx.contractCall(CONTRACT_NAME, GET_BALANCE, [types.principal(deployer.address)], deployer.address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectSome().expectUint(CONVERT_TO_STX(1000));

    block = chain.mineBlock([Tx.contractCall(CONTRACT_NAME, REWARD_DISTRIBUTION, [types.uint(5)], deployer.address)]);

    block.receipts[0].result.expectErr().expectUint(1003);
  },
});
// test 5
// chech each can withdraw less amount, multiple times
