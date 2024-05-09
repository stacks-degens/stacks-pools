import { Cl, ClarityType, cvToValue, isClarityType } from '@stacks/transactions';
import { assert, describe, expect, it } from 'vitest';
import { poxAddressToTuple } from '@stacks/stacking';

const accounts = simnet.getAccounts();
const deployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const wallet_1 = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
const wallet_2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const wallet_3 = 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC';
const wallet_4 = 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND';
const wallet_5 = 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB';
const wallet_6 = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
const wallet_7 = 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ';
const wallet_8 = 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP';
const wallet_299 = accounts.get('wallet_299')!;
const contract = `${accounts.get('deployer')}.stacking-pool-test`;
const poxContract = 'ST000000000000000000002AMW42H.pox-3';

function expectPartialStackedByCycle(poxAddr: string, cycle: number, amount: number, user: string) {
  const { result: expectPartialStackedByCycle } = simnet.callReadOnlyFn(
    poxContract,
    'get-partial-stacked-by-cycle',
    [poxAddressToTuple(poxAddr), Cl.uint(cycle), Cl.principal(deployer)],
    deployer
  );
  if (amount) {
    expect(expectPartialStackedByCycle).toBeSome(
      Cl.tuple({
        'expected-amount': Cl.uint(amount),
      })
    );
  } else {
    expect(expectPartialStackedByCycle).toBeNone();
  }
}
function AllowJoinAndDelegate(wallet: string, amount: number) {
  const { result: allowContractCaller } = simnet.callPublicFn(
    poxContract,
    'allow-contract-caller',
    [Cl.principal(contract), Cl.none()],
    wallet
  );
  expect(allowContractCaller).toBeOk(Cl.bool(true));

  const { result: joinStackingPoolW1 } = simnet.callPublicFn(contract, 'join-stacking-pool', [], wallet);
  expect(joinStackingPoolW1).toBeOk(Cl.bool(true));

  const { result: delegateStx } = simnet.callPublicFn(contract, 'delegate-stx', [Cl.uint(amount)], wallet);
  return delegateStx;
}
function expectTotalStackedByCycle(poxAddr: string, cycle: number, index: number, amountUstx: number, user: string) {
  const expectTotalStackedByCycle = simnet.callReadOnlyFn(
    poxContract,
    'get-reward-set-pox-address',
    [Cl.uint(cycle), Cl.uint(index)],
    user
  );

  if (amountUstx) {
    expect(expectTotalStackedByCycle.result).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddr),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(amountUstx),
      })
    );
  } else {
    expect(expectTotalStackedByCycle.result).toBeNone();
  }
}

function expectUserData(
  stacker: string,
  user: string,
  delegatedBalance: number,
  lockedBalance: number,
  untilBurnHt: number
) {
  const { result: getUserData } = simnet.callReadOnlyFn(contract, 'get-user-data', [Cl.principal(stacker)], user);
  if (delegatedBalance) {
    expect(getUserData).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(delegatedBalance),
        'locked-balance': Cl.uint(lockedBalance),
        // because we are in cycle 1 and lock-period is 1 cycle
        'until-burn-ht': Cl.some(Cl.uint(untilBurnHt)),
      })
    );
  } else {
    expect(getUserData).toBeNone();
  }
}

describe('Can delegate', () => {
  it('deleagte-stx should return (err 199) err-allow-pool-in-pox-3-first', () => {
    const { result: delegateStx } = simnet.callPublicFn(
      contract,
      'delegate-stx',
      [Cl.uint(20_000_000_000_000)],
      wallet_1
    );
    assert(isClarityType(delegateStx, ClarityType.ResponseErr));
    expect(delegateStx).toBeErr(Cl.uint(199));
  });

  it('liquidity provider can deposit STX into SC, no allowance', () => {
    const { result: depositStx } = simnet.callPublicFn(
      contract,
      'deposit-stx-liquidity-provider',
      [Cl.uint(10_000_000_000)],
      deployer
    );
    expect(depositStx).toBeOk(Cl.bool(true));

    const { result: amount } = simnet.callReadOnlyFn(contract, 'get-SC-total-balance', [], deployer);
    expect(amount).toBeUint(10_000_000_000);
  });

  it('cannot join pool with no allowance, (err 199) err-allow-pool-in-pox-3-first', () => {
    const { result: joinStackingPool } = simnet.callPublicFn(contract, 'join-stacking-pool', [], wallet_1);
    expect(joinStackingPool).toBeErr(Cl.uint(199));
  });

  it('can join pool with allowance', () => {
    const { result: allowContractCaller } = simnet.callPublicFn(
      poxContract,
      'allow-contract-caller',
      [Cl.principal(contract), Cl.none()],
      wallet_1
    );
    expect(allowContractCaller).toBeOk(Cl.bool(true));

    const { result: joinStackingPool } = simnet.callPublicFn(contract, 'join-stacking-pool', [], wallet_1);
    expect(joinStackingPool).toBeOk(Cl.bool(true));
  });

  it('can exit pool after disallow pool SC', () => {
    const { result: allowContractCaller } = simnet.callPublicFn(
      poxContract,
      'allow-contract-caller',
      [Cl.principal(contract), Cl.none()],
      wallet_1
    );
    expect(allowContractCaller).toBeOk(Cl.bool(true));

    const { result: joinStackingPool } = simnet.callPublicFn(contract, 'join-stacking-pool', [], wallet_1);
    expect(joinStackingPool).toBeOk(Cl.bool(true));

    const { result: disallowContractCaller } = simnet.callPublicFn(
      poxContract,
      'disallow-contract-caller',
      [Cl.principal(contract)],
      wallet_1
    );
    expect(disallowContractCaller).toBeOk(Cl.bool(true));

    const { result: quitStackingPool } = simnet.callPublicFn(contract, 'quit-stacking-pool', [], wallet_1);

    expect(quitStackingPool).toBeOk(Cl.bool(true));
  });

  it('can delegate only from an allowed contract and by joining pool', () => {
    // Should be (err 199) err-allow-pool-in-pox-3-first
    const { result: delegateStxNoAllowance } = simnet.callPublicFn(
      contract,
      'delegate-stx',
      [Cl.uint(20_000_000_000_000)],
      wallet_1
    );
    expect(delegateStxNoAllowance).toBeErr(Cl.uint(199));

    const { result: allowContractCaller } = simnet.callPublicFn(
      poxContract,
      'allow-contract-caller',
      [Cl.principal(contract), Cl.none()],
      wallet_1
    );
    expect(allowContractCaller).toBeOk(Cl.bool(true));

    // Should be (err 102) err-not-in-pool
    const { result: delegateStxBeforeJoin } = simnet.callPublicFn(
      contract,
      'delegate-stx',
      [Cl.uint(20_000_000_000_000)],
      wallet_1
    );
    expect(delegateStxBeforeJoin).toBeErr(Cl.uint(102));

    const { result: joinStackingPool } = simnet.callPublicFn(contract, 'join-stacking-pool', [], wallet_1);
    expect(joinStackingPool).toBeOk(Cl.bool(true));

    const { result: delegateStx } = simnet.callPublicFn(
      contract,
      'delegate-stx',
      [Cl.uint(20_000_000_000_000)],
      wallet_1
    );
    expect(delegateStx).toBeOk(Cl.bool(true));

    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 19_999_999_000_000, deployer);
  });

  it('can lock only funds he owns', () => {
    expect(AllowJoinAndDelegate(wallet_1, 200_000_000_000_000)).toBeOk(Cl.bool(true));

    // check if expected values
    expectUserData(wallet_1, wallet_1, 200_000_000_000_000, 99_999_999_000_000, 2100);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 99_999_999_000_000, deployer);

    expect(AllowJoinAndDelegate(wallet_2, 400_000_000_000_000)).toBeOk(Cl.bool(true));

    expectUserData(wallet_2, wallet_2, 400_000_000_000_000, 99_999_999_000_000, 2100);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 199_999_998_000_000, deployer);
  });

  it('can delegate any amount, it will be locked only when it meets the minimum amount', () => {
    expect(AllowJoinAndDelegate(wallet_1, 1_000_000_000)).toBeOk(Cl.bool(false));

    expectUserData(wallet_1, wallet_1, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_2, wallet_2, 0, 0, 0);

    // Check if values are as expected
    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('', 1, 0, 0, deployer);

    expect(AllowJoinAndDelegate(wallet_2, 10_000_000_000_000)).toBeOk(Cl.bool(true));

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 10_000_998_000_000, deployer);

    expectUserData(wallet_1, wallet_1, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_2, wallet_2, 10_000_000_000_000, 9_999_999_000_000, 2100);
  });

  it('after unlock, no locked amount, no update-sc-balances', () => {
    const { result: stackingMinimum } = simnet.callReadOnlyFn(poxContract, 'get-stacking-minimum', [], wallet_1);
    assert(isClarityType(stackingMinimum, ClarityType.UInt));

    expect(AllowJoinAndDelegate(wallet_1, Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)).toBeOk(Cl.bool(true));

    expectUserData(
      wallet_1,
      wallet_1,
      Number(cvToValue(stackingMinimum)) + 1 * 1_000_000,
      Number(cvToValue(stackingMinimum)),
      2100
    );
    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, Number(cvToValue(stackingMinimum)), deployer);

    simnet.mineEmptyBlocks(2100);

    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 2, 0, 0, deployer);
  });

  it('after unlock, no locked amount', () => {
    const { result: stackingMinimum } = simnet.callReadOnlyFn(poxContract, 'get-stacking-minimum', [], wallet_1);
    assert(isClarityType(stackingMinimum, ClarityType.UInt));

    expect(AllowJoinAndDelegate(wallet_1, Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)).toBeOk(Cl.bool(true));

    expectUserData(
      wallet_1,
      wallet_1,
      Number(cvToValue(stackingMinimum)) + 1 * 1_000_000,
      Number(cvToValue(stackingMinimum)),
      2100
    );
    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, Number(cvToValue(stackingMinimum)), deployer);

    // PREPARE_CYCLE_LENGTH 50
    simnet.mineEmptyBlocks(2051);

    const { result: updateSCBalances } = simnet.callPublicFn(contract, 'update-sc-balances', [], wallet_1);
    expect(updateSCBalances).toBeOk(Cl.bool(true));

    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 2, 0, 0, deployer);
  });

  it('ignore commit if multiple wallets delegate and total delegated < stackingMinimum', () => {
    expect(AllowJoinAndDelegate(wallet_1, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_2, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_3, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_4, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_5, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_6, 1_000_000_000)).toBeOk(Cl.bool(false));

    expectUserData(wallet_1, wallet_1, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_2, wallet_2, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_3, wallet_3, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_4, wallet_4, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_5, wallet_5, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_6, wallet_6, 1_000_000_000, 999_000_000, 2100);
  });

  it('stacker can delegate any amount, it will be locked only when treshold is met', () => {
    expect(AllowJoinAndDelegate(wallet_1, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_2, 1_000_000_000)).toBeOk(Cl.bool(false));
    expect(AllowJoinAndDelegate(wallet_3, 1_000_000_000)).toBeOk(Cl.bool(false));

    expectUserData(wallet_1, wallet_1, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_2, wallet_2, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_3, wallet_3, 1_000_000_000, 999_000_000, 2100);

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 0, deployer);

    expect(AllowJoinAndDelegate(wallet_4, 3_780_000_000_000)).toBeOk(Cl.bool(true));

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 3_782_996_000_000, deployer);

    expect(AllowJoinAndDelegate(wallet_5, 1_000_000_000)).toBeOk(Cl.bool(true));
    expect(AllowJoinAndDelegate(wallet_6, 1_000_000_000)).toBeOk(Cl.bool(true));
    expect(AllowJoinAndDelegate(wallet_7, 1_000_000_000)).toBeOk(Cl.bool(true));

    expectUserData(wallet_5, wallet_5, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_6, wallet_6, 1_000_000_000, 999_000_000, 2100);
    expectUserData(wallet_7, wallet_7, 1_000_000_000, 999_000_000, 2100);

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 3_785_993_000_000, deployer);

    expect(AllowJoinAndDelegate(wallet_8, 122_000_000_000)).toBeOk(Cl.bool(true));

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 3_907_992_000_000, deployer);

    expectUserData(wallet_8, wallet_8, 122_000_000_000, 121_999_000_000, 2100);
  });

  it('delegate stx many times', () => {
    // const batchCheckedBlocks: ClarityValue[] = [];

    // for (let i = 100; i < 115; i++) {
    //   batchCheckedBlocks.push(Cl.uint(i));
    // }
    // let stackersList = [deployer];
    // for (let i = 1; i <= 299; i++) stackersList.push(accounts.get(`wallet_${i}`)!);

    for (let i = 1; i <= 298; i++) {
      let stacker = accounts.get(`wallet_${i}`)!;
      expect(AllowJoinAndDelegate(stacker, 1_000_000_000)).toBeOk(Cl.bool(false));
      expectUserData(stacker, stacker, 1_000_000_000, 999_000_000, 2100);
    }

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 0, deployer);

    expect(AllowJoinAndDelegate(wallet_299, 3_780_000_000_000)).toBeOk(Cl.bool(true));

    expect(simnet.blockHeight).toEqual(898);

    expectPartialStackedByCycle('tb1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2g22aa2', 1, 0, deployer);
    expectTotalStackedByCycle('mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51', 1, 0, 4_077_701_000_000, deployer);

    // const { result: batchCheckRewards } = simnet.callReadOnlyFn(
    //   contract,
    //   'check-won-block-rewards-batch',
    //   [Cl.list(batchCheckedBlocks)],
    //   deployer
    // );
    // expect(batchCheckRewards).toBeOk(Cl.list([]));

    // const { result: batchRewardsDistribution } = simnet.callPublicFn(
    //   contract,
    //   'batch-reward-distribution',
    //   [Cl.list(batchCheckedBlocks)],
    //   deployer
    // );
    // expect(batchRewardsDistribution).toBeOk(Cl.list(batchCheckedBlocks));
  });

  it('can increase', () => {
    const { result: stackingMinimum } = simnet.callReadOnlyFn(poxContract, 'get-stacking-minimum', [], wallet_1);
    assert(isClarityType(stackingMinimum, ClarityType.UInt));

    AllowJoinAndDelegate(wallet_1, Number(cvToValue(stackingMinimum)) + 1 * 1_000_000);

    expectUserData(
      wallet_1,
      wallet_1,
      Number(cvToValue(stackingMinimum)) + 1 * 1_000_000,
      Number(cvToValue(stackingMinimum)),
      2100
    );

    simnet.mineEmptyBlocks(1050);

    const { result: delegateStx } = simnet.callPublicFn(
      contract,
      'delegate-stx',
      [Cl.uint(Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)],
      wallet_1
    );
    expect(delegateStx).toBeOk(Cl.bool(true));

    expectUserData(
      wallet_1,
      wallet_1,
      Number(cvToValue(stackingMinimum)) + 1 * 1_000_000,
      Number(cvToValue(stackingMinimum)),
      3150
    );
  });
});
