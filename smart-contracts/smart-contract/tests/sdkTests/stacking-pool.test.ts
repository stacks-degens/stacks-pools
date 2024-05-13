import {
  Cl,
  ClarityType,
  ClarityValue,
  createStacksPrivateKey,
  cvToJSON,
  cvToValue,
  getAddressFromPrivateKey,
  getPublicKey,
  isClarityType,
  pubKeyfromPrivKey,
} from '@stacks/transactions';
import { assert, describe, expect, it } from 'vitest';
import { decodeBtcAddress, Pox4SignatureTopic, poxAddressToTuple, StackingClient } from '@stacks/stacking';
import { StacksTestnet } from '@stacks/network';
import { createPrivateKey } from 'crypto';
import { create } from 'domain';
import { tx } from '@hirosystems/clarinet-sdk';
import exp from 'constants';

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
const poxContract = 'ST000000000000000000002AMW42H.pox-4';
const testnet = new StacksTestnet();
const poxAddress = 'mtyytKMMrd8tEmkdBKGGtUvLxR3YTkMc51';
const walletsStackingMapping = {
  deployer: {
    stackingClient: new StackingClient(deployer, testnet),
    pubKey: pubKeyfromPrivKey('753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601'),
    privKey: createStacksPrivateKey('753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601'),
  },
  wallet_1: {
    stackingClient: new StackingClient(wallet_1, testnet),
    pubKey: pubKeyfromPrivKey('7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801'),
    privKey: createStacksPrivateKey('7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801'),
  },
  wallet_2: {
    stackingClinet: new StackingClient(wallet_2, testnet),
    pubKey: pubKeyfromPrivKey('530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101'),
    privKey: createStacksPrivateKey('530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101'),
  },
  wallet_3: {
    stackingClient: new StackingClient(wallet_3, testnet),
    pubKey: pubKeyfromPrivKey('d655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901'),
    privKey: createStacksPrivateKey('d655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901'),
  },
  wallet_4: {
    stackingClient: new StackingClient(wallet_4, testnet),
    pubKey: pubKeyfromPrivKey('f9d7206a47f14d2870c163ebab4bf3e70d18f5d14ce1031f3902fbbc894fe4c701'),
    privKey: createStacksPrivateKey('f9d7206a47f14d2870c163ebab4bf3e70d18f5d14ce1031f3902fbbc894fe4c701'),
  },
  wallet_5: {
    stackingClient: new StackingClient(wallet_5, testnet),
    pubKey: pubKeyfromPrivKey('3eccc5dac8056590432db6a35d52b9896876a3d5cbdea53b72400bc9c2099fe801'),
    privKey: createStacksPrivateKey('3eccc5dac8056590432db6a35d52b9896876a3d5cbdea53b72400bc9c2099fe801'),
  },
  wallet_6: {
    stackingClient: new StackingClient(wallet_6, testnet),
    pubKey: pubKeyfromPrivKey('7036b29cb5e235e5fd9b09ae3e8eec4404e44906814d5d01cbca968a60ed4bfb01'),
    privKey: createStacksPrivateKey('7036b29cb5e235e5fd9b09ae3e8eec4404e44906814d5d01cbca968a60ed4bfb01'),
  },
  wallet_7: {
    stackingClient: new StackingClient(wallet_7, testnet),
    pubKey: pubKeyfromPrivKey('b463f0df6c05d2f156393eee73f8016c5372caa0e9e29a901bb7171d90dc4f1401'),
    privKey: createStacksPrivateKey('b463f0df6c05d2f156393eee73f8016c5372caa0e9e29a901bb7171d90dc4f1401'),
  },
  wallet_8: {
    stackingClient: new StackingClient(wallet_8, testnet),
    pubKey: pubKeyfromPrivKey('6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e01'),
    privKey: createStacksPrivateKey('6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e01'),
  },
};

// Operator creates a signature and commits the previously locked amount.

function aggCommit(caller: string, authId: number = 0) {
  const operatorSigCommit = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
    // The signer key being authorized.
    signerPrivateKey: walletsStackingMapping.deployer.privKey,
    // The reward cycle for which the authorization is valid.
    // For stack-stx and stack-extend, this refers to the reward cycle
    // where the transaction is confirmed. For stack-aggregation-commit,
    // this refers to the reward cycle argument in that function.
    rewardCycle: 1,
    // For stack-stx, this refers to lock-period. For stack-extend,
    // this refers to extend-count. For stack-aggregation-commit, this is
    // u1.
    period: 1,
    // A string representing the function where this authorization is valid.
    // Either stack-stx, stack-extend, stack-increase or agg-commit.
    topic: Pox4SignatureTopic.AggregateCommit,
    // The PoX address that can be used with this signer key.
    poxAddress: poxAddress,
    // The unique auth-id for this authorization.
    authId: authId,
    // The maximum amount of uSTX that can be used (per tx) with this signer
    // key (we'll use an incredibly high amount :) ).
    maxAmount: Number.MAX_SAFE_INTEGER,
  });

  // (current-cycle uint)
  // (signer-sig (optional (buff 65)))
  // (signer-pubkey (buff 33))
  // (max-allowed-amount uint)
  // (auth-id uint)
  const { result: aggCommit } = simnet.callPublicFn(
    contract,
    'maybe-stack-aggregation-commit',
    [
      Cl.uint(0),
      Cl.some(Cl.bufferFromHex(operatorSigCommit)),
      Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      Cl.uint(Number.MAX_SAFE_INTEGER),
      Cl.uint(authId),
    ],
    caller
  );
  return aggCommit;
}
function aggIncrease(caller: string, authId: number = 0) {
  const operatorSigIncrease = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
    // The signer key being authorized.
    signerPrivateKey: walletsStackingMapping.deployer.privKey,
    // The reward cycle for which the authorization is valid.
    // For stack-stx and stack-extend, this refers to the reward cycle
    // where the transaction is confirmed. For stack-aggregation-commit,
    // this refers to the reward cycle argument in that function.
    rewardCycle: 1,
    // For stack-stx, this refers to lock-period. For stack-extend,
    // this refers to extend-count. For stack-aggregation-commit, this is
    // u1.
    period: 1,
    // A string representing the function where this authorization is valid.
    // Either stack-stx, stack-extend, stack-increase or agg-commit.
    topic: Pox4SignatureTopic.AggregateIncrease,
    // The PoX address that can be used with this signer key.
    poxAddress: poxAddress,
    // The unique auth-id for this authorization.
    authId: authId,
    // The maximum amount of uSTX that can be used (per tx) with this signer
    // key (we'll use an incredibly high amount :) ).
    maxAmount: Number.MAX_SAFE_INTEGER,
  });

  // (current-cycle uint)
  // (signer-sig (optional (buff 65)))
  // (signer-pubkey (buff 33))
  // (max-allowed-amount uint)
  // (auth-id uint)
  const { result: aggIncrease } = simnet.callPublicFn(
    contract,
    'maybe-stack-aggregation-commit',
    [
      Cl.uint(0),
      Cl.some(Cl.bufferFromHex(operatorSigIncrease)),
      Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      Cl.uint(Number.MAX_SAFE_INTEGER),
      Cl.uint(authId),
    ],
    caller
  );
  return aggIncrease;
}

function allowContractCaller(allowTo: string, caller: string) {
  const { result: allowContractCaller } = simnet.callPublicFn(
    poxContract,
    'allow-contract-caller',
    [Cl.principal(allowTo), Cl.none()],
    caller
  );
  return allowContractCaller;
}

function joinStackingPool(caller: string) {
  const { result: joinStackingPool } = simnet.callPublicFn(contract, 'join-stacking-pool', [], caller);
  return joinStackingPool;
}
function delegateStx(amount: number, caller: string) {
  const { result: delegateStx } = simnet.callPublicFn(contract, 'delegate-stx', [Cl.uint(amount)], caller);
  return delegateStx;
}
function AllowJoinAndDelegate(wallet: string, amount: number) {
  expect(allowContractCaller(contract, wallet)).toBeOk(Cl.bool(true));

  expect(joinStackingPool(wallet)).toBeOk(Cl.bool(true));

  return delegateStx(amount, wallet);
}

function getTotalStackedByCycle(cycle: number, index: number, user: string) {
  const { result: getTotalStackedByCycle } = simnet.callReadOnlyFn(
    poxContract,
    'get-reward-set-pox-address',
    [Cl.uint(cycle), Cl.uint(index)],
    user
  );
  return getTotalStackedByCycle;
}

function getPartialStackedByCycle(poxAddr: string, cycle: number) {
  const { result: getPartialStackedByCycle } = simnet.callReadOnlyFn(
    poxContract,
    'get-partial-stacked-by-cycle',
    [poxAddressToTuple(poxAddr), Cl.uint(cycle), Cl.principal(deployer)],
    deployer
  );
  return getPartialStackedByCycle;
}

function getUserData(stacker: string, user: string) {
  const { result: getUserData } = simnet.callReadOnlyFn(contract, 'get-user-data', [Cl.principal(stacker)], user);
  return getUserData;
}

describe('Can delegate', () => {
  it('deleagte-stx should return (err 199) err-allow-pool-in-pox-4-first', () => {
    expect(delegateStx(20_000_000_000_000, wallet_1)).toBeErr(Cl.uint(199));
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
    expect(joinStackingPool(wallet_1)).toBeErr(Cl.uint(199));
  });

  it('can join pool with allowance', () => {
    expect(allowContractCaller(contract, wallet_1)).toBeOk(Cl.bool(true));

    expect(joinStackingPool(wallet_1)).toBeOk(Cl.bool(true));
  });

  it('can exit pool after disallow pool SC', () => {
    expect(allowContractCaller(contract, wallet_1)).toBeOk(Cl.bool(true));

    expect(joinStackingPool(wallet_1)).toBeOk(Cl.bool(true));

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
    expect(delegateStx(20_000_000_000_000, wallet_1)).toBeErr(Cl.uint(199));

    expect(allowContractCaller(contract, wallet_1)).toBeOk(Cl.bool(true));

    // Should be (err 102) err-not-in-pool
    expect(delegateStx(20_000_000_000_000, wallet_1)).toBeErr(Cl.uint(102));

    expect(joinStackingPool(wallet_1)).toBeOk(Cl.bool(true));

    expect(delegateStx(20_000_000_000_000, wallet_1)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(19_999_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );

    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));

    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(19_999_999_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );
  });

  it('can lock only funds he owns', () => {
    expect(AllowJoinAndDelegate(wallet_1, 200_000_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(99_999_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));

    // check if expected values
    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(200_000_000_000_000),
        'locked-balance': Cl.uint(99_999_999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(99_999_999_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );

    expect(AllowJoinAndDelegate(wallet_2, 400_000_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_2),
        'lock-amount': Cl.uint(99_999_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggIncrease(deployer)).toBeOk(Cl.bool(true));

    expect(getUserData(wallet_2, wallet_2)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(400_000_000_000_000),
        'locked-balance': Cl.uint(99_999_999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(199_999_998_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );
  });

  it('can delegate any amount, it will be locked only when it meets the minimum amount', () => {
    expect(AllowJoinAndDelegate(wallet_1, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));
    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_2, wallet_2)).toBeNone();
    // Check if values are as expected
    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeNone();
    expect(AllowJoinAndDelegate(wallet_2, 10_000_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_2),
        'lock-amount': Cl.uint(9_999_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));
    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(10_000_998_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );
    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_2, wallet_2)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(10_000_000_000_000),
        'locked-balance': Cl.uint(9_999_999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
  });

  it('after unlock, no locked amount, no update-sc-balances', () => {
    const { result: stackingMinimum } = simnet.callReadOnlyFn(poxContract, 'get-stacking-minimum', [], wallet_1);
    console.log('stackingMinimum:::', stackingMinimum);
    assert(isClarityType(stackingMinimum, ClarityType.UInt));

    expect(AllowJoinAndDelegate(wallet_1, Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(Number(cvToValue(stackingMinimum))),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));
    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(Number(cvToValue(stackingMinimum)) + 1 * 1_000_000),
        'locked-balance': Cl.uint(Number(cvToValue(stackingMinimum))),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(Number(cvToValue(stackingMinimum))),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );

    simnet.mineEmptyBlocks(2100);

    expect(getTotalStackedByCycle(2, 0, deployer)).toBeNone();
  });

  it('after unlock, no locked amount', () => {
    const { result: stackingMinimum } = simnet.callReadOnlyFn(poxContract, 'get-stacking-minimum', [], wallet_1);
    assert(isClarityType(stackingMinimum, ClarityType.UInt));

    expect(AllowJoinAndDelegate(wallet_1, Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(Number(cvToValue(stackingMinimum))),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));

    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(Number(cvToValue(stackingMinimum)) + 1 * 1_000_000),
        'locked-balance': Cl.uint(Number(cvToValue(stackingMinimum))),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(Number(cvToValue(stackingMinimum))),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );
    // PREPARE_CYCLE_LENGTH 50
    simnet.mineEmptyBlocks(2051);

    const { result: updateSCBalances } = simnet.callPublicFn(contract, 'update-sc-balances', [], wallet_1);
    expect(updateSCBalances).toBeOk(Cl.bool(true));

    expect(getTotalStackedByCycle(2, 0, deployer)).toBeNone();
  });

  it('ignore commit if multiple wallets delegate and total delegated < stackingMinimum', () => {
    expect(AllowJoinAndDelegate(wallet_1, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_2, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_2),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_3, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_3),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_4, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_4),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_5, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_5),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_6, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_6),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_2, wallet_2)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_3, wallet_3)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_4, wallet_4)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_5, wallet_5)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_6, wallet_6)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
  });

  it('stacker can delegate any amount, it will be locked only when treshold is met', () => {
    let authId = 0;

    expect(AllowJoinAndDelegate(wallet_1, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_2, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_2),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(AllowJoinAndDelegate(wallet_3, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_3),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(false));

    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_2, wallet_2)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_3, wallet_3)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );

    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeNone();

    expect(AllowJoinAndDelegate(wallet_4, 3_780_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_4),
        'lock-amount': Cl.uint(3_779_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));

    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(3_782_996_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );

    expect(AllowJoinAndDelegate(wallet_5, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_5),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    // console.log(aggIncrease(deployer));
    expect(aggIncrease(deployer, authId)).toBeOk(Cl.bool(true));
    authId++;

    expect(AllowJoinAndDelegate(wallet_6, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_6),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggIncrease(deployer, authId)).toBeOk(Cl.bool(true));
    authId++;

    expect(AllowJoinAndDelegate(wallet_7, 1_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_7),
        'lock-amount': Cl.uint(999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggIncrease(deployer, authId)).toBeOk(Cl.bool(true));
    authId++;

    expect(getUserData(wallet_5, wallet_5)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_6, wallet_6)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
    expect(getUserData(wallet_7, wallet_7)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(1_000_000_000),
        'locked-balance': Cl.uint(999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );

    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(3_785_993_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );

    expect(AllowJoinAndDelegate(wallet_8, 122_000_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_8),
        'lock-amount': Cl.uint(121_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggIncrease(deployer, authId)).toBeOk(Cl.bool(true));
    authId++;

    expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
      Cl.tuple({
        'pox-addr': poxAddressToTuple(poxAddress),
        stacker: Cl.none(),
        'total-ustx': Cl.uint(3_907_992_000_000),
        signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
      })
    );

    expect(getUserData(wallet_8, wallet_8)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(122_000_000_000),
        'locked-balance': Cl.uint(121_999_000_000),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );
  });

  it('delegate stx many times', () => {
    // // const batchCheckedBlocks: ClarityValue[] = [];
    // // for (let i = 100; i < 115; i++) {
    // //   batchCheckedBlocks.push(Cl.uint(i));
    // // }
    // // let stackersList = [deployer];
    // // for (let i = 1; i <= 299; i++) stackersList.push(accounts.get(`wallet_${i}`)!);
    // const operatorSigCommit = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
    //   // The signer key being authorized.
    //   signerPrivateKey: walletsStackingMapping.deployer.privKey,
    //   // The reward cycle for which the authorization is valid.
    //   // For stack-stx and stack-extend, this refers to the reward cycle
    //   // where the transaction is confirmed. For stack-aggregation-commit,
    //   // this refers to the reward cycle argument in that function.
    //   rewardCycle: 1,
    //   // For stack-stx, this refers to lock-period. For stack-extend,
    //   // this refers to extend-count. For stack-aggregation-commit, this is
    //   // u1.
    //   period: 1,
    //   // A string representing the function where this authorization is valid.
    //   // Either stack-stx, stack-extend, stack-increase or agg-commit.
    //   topic: Pox4SignatureTopic.AggregateCommit,
    //   // The PoX address that can be used with this signer key.
    //   poxAddress: poxAddress,
    //   // The unique auth-id for this authorization.
    //   authId: 0,
    //   // The maximum amount of uSTX that can be used (per tx) with this signer
    //   // key (we'll use an incredibly high amount :) ).
    //   maxAmount: Number.MAX_SAFE_INTEGER,
    // });
    // for (let i = 1; i <= 298; i++) {
    //   let stacker = accounts.get(`wallet_${i}`)!;
    //   let txs = [
    //     tx.callPublicFn(poxContract, 'allow-contract-caller', [Cl.principal(contract), Cl.none()], stacker),
    //     tx.callPublicFn(contract, 'join-stacking-pool', [], stacker),
    //     tx.callPublicFn(contract, 'delegate-stx', [Cl.uint(1_000_000_000)], stacker),
    //     tx.callPublicFn(
    //       contract,
    //       'maybe-stack-aggregation-commit',
    //       [
    //         Cl.uint(0),
    //         Cl.some(Cl.bufferFromHex(operatorSigCommit)),
    //         Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
    //         Cl.uint(Number.MAX_SAFE_INTEGER),
    //         Cl.uint(0),
    //       ],
    //       stacker
    //     ),
    //   ];
    //   const block = simnet.mineBlock(txs);
    //   expect(block[0].result).toBeOk(Cl.bool(true));
    //   expect(block[1].result).toBeOk(Cl.bool(true));
    //   expect(block[2].result).toBeOk(
    //     Cl.tuple({
    //       stacker: Cl.principal(stacker),
    //       'lock-amount': Cl.uint(999_000_000),
    //       'unlock-burn-height': Cl.uint(2100),
    //     })
    //   );
    //   expect(block[3].result).toBeOk(Cl.bool(false));
    //   expect(getUserData(stacker, stacker)).toBeSome(
    //     Cl.tuple({
    //       'is-in-pool': Cl.bool(true),
    //       'delegated-balance': Cl.uint(1_000_000_000),
    //       'locked-balance': Cl.uint(999_000_000),
    //       'until-burn-ht': Cl.some(Cl.uint(2100)),
    //     })
    //   );
    // }
    // expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    // expect(getTotalStackedByCycle(1, 0, deployer)).toBeNone();
    // expect(AllowJoinAndDelegate(wallet_299, 3_780_000_000_000)).toBeOk(
    //   Cl.tuple({
    //     stacker: Cl.principal(wallet_299),
    //     'lock-amount': Cl.uint(3_779_999_000_000),
    //     'unlock-burn-height': Cl.uint(2100),
    //   })
    // );
    // expect(aggCommit(deployer)).toBeOk(Cl.bool(true));
    // expect(simnet.blockHeight).toEqual(303);
    // expect(getPartialStackedByCycle(poxAddress, 1)).toBeNone();
    // expect(getTotalStackedByCycle(1, 0, deployer)).toBeSome(
    //   Cl.tuple({
    //     'pox-addr': poxAddressToTuple(poxAddress),
    //     stacker: Cl.none(),
    //     'total-ustx': Cl.uint(4_077_701_000_000),
    //     signer: Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
    //   })
    // );
    // // const { result: batchCheckRewards } = simnet.callReadOnlyFn(
    // //   contract,
    // //   'check-won-block-rewards-batch',
    // //   [Cl.list(batchCheckedBlocks)],
    // //   deployer
    // // );
    // // expect(batchCheckRewards).toBeOk(Cl.list([]));
    // // const { result: batchRewardsDistribution } = simnet.callPublicFn(
    // //   contract,
    // //   'batch-reward-distribution',
    // //   [Cl.list(batchCheckedBlocks)],
    // //   deployer
    // // );
    // // expect(batchRewardsDistribution).toBeOk(Cl.list(batchCheckedBlocks));
  });

  it('can increase', () => {
    const { result: stackingMinimum } = simnet.callReadOnlyFn(poxContract, 'get-stacking-minimum', [], wallet_1);
    assert(isClarityType(stackingMinimum, ClarityType.UInt));

    expect(AllowJoinAndDelegate(wallet_1, Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(Number(cvToValue(stackingMinimum))),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(aggCommit(deployer)).toBeOk(Cl.bool(true));

    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(Number(cvToValue(stackingMinimum)) + 1 * 1_000_000),
        'locked-balance': Cl.uint(Number(cvToValue(stackingMinimum))),
        'until-burn-ht': Cl.some(Cl.uint(2100)),
      })
    );

    simnet.mineEmptyBlocks(1050);

    const { result: delegateStx } = simnet.callPublicFn(
      contract,
      'delegate-stx',
      [Cl.uint(Number(cvToValue(stackingMinimum)) + 1 * 1_000_000)],
      wallet_1
    );
    expect(delegateStx).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(Number(cvToValue(stackingMinimum))),
        'unlock-burn-height': Cl.uint(3150),
      })
    );

    const operatorSigCommitCycle2 = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
      // The signer key being authorized.
      signerPrivateKey: walletsStackingMapping.deployer.privKey,
      // The reward cycle for which the authorization is valid.
      // For stack-stx and stack-extend, this refers to the reward cycle
      // where the transaction is confirmed. For stack-aggregation-commit,
      // this refers to the reward cycle argument in that function.
      rewardCycle: 2,
      // For stack-stx, this refers to lock-period. For stack-extend,
      // this refers to extend-count. For stack-aggregation-commit, this is
      // u1.
      period: 1,
      // A string representing the function where this authorization is valid.
      // Either stack-stx, stack-extend, stack-increase or agg-commit.
      topic: Pox4SignatureTopic.AggregateCommit,
      // The PoX address that can be used with this signer key.
      poxAddress: poxAddress,
      // The unique auth-id for this authorization.
      authId: 0,
      // The maximum amount of uSTX that can be used (per tx) with this signer
      // key (we'll use an incredibly high amount :) ).
      maxAmount: Number.MAX_SAFE_INTEGER,
    });
    const { result: aggCommitCyc2 } = simnet.callPublicFn(
      contract,
      'maybe-stack-aggregation-commit',
      [
        Cl.uint(1),
        Cl.some(Cl.bufferFromHex(operatorSigCommitCycle2)),
        Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
        Cl.uint(Number.MAX_SAFE_INTEGER),
        Cl.uint(0),
      ],
      deployer
    );
    expect(aggCommitCyc2).toBeOk(Cl.bool(true));

    expect(getUserData(wallet_1, wallet_1)).toBeSome(
      Cl.tuple({
        'is-in-pool': Cl.bool(true),
        'delegated-balance': Cl.uint(Number(cvToValue(stackingMinimum)) + 1 * 1_000_000),
        'locked-balance': Cl.uint(Number(cvToValue(stackingMinimum))),
        'until-burn-ht': Cl.some(Cl.uint(3150)),
      })
    );
  });

  it('check won blocks', () => {
    // total to be stacked ::: 1_000_000_000_000
    // wallet_1 stacking 85% ::: 850_000_000_000
    // wallet_2 stacking 10% ::: 100_000_000_000
    // wallet_3 stacking 5% ::: 50_000_000_000
    const operatorSigCommit = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
      // The signer key being authorized.
      signerPrivateKey: walletsStackingMapping.deployer.privKey,
      // The reward cycle for which the authorization is valid.
      // For stack-stx and stack-extend, this refers to the reward cycle
      // where the transaction is confirmed. For stack-aggregation-commit,
      // this refers to the reward cycle argument in that function.
      rewardCycle: 1,
      // For stack-stx, this refers to lock-period. For stack-extend,
      // this refers to extend-count. For stack-aggregation-commit, this is
      // u1.
      period: 1,
      // A string representing the function where this authorization is valid.
      // Either stack-stx, stack-extend, stack-increase or agg-commit.
      topic: Pox4SignatureTopic.AggregateCommit,
      // The PoX address that can be used with this signer key.
      poxAddress: poxAddress,
      // The unique auth-id for this authorization.
      authId: 0,
      // The maximum amount of uSTX that can be used (per tx) with this signer
      // key (we'll use an incredibly high amount :) ).
      maxAmount: Number.MAX_SAFE_INTEGER,
    });
    const operatorSigIncrease1 = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
      // The signer key being authorized.
      signerPrivateKey: walletsStackingMapping.deployer.privKey,
      // The reward cycle for which the authorization is valid.
      // For stack-stx and stack-extend, this refers to the reward cycle
      // where the transaction is confirmed. For stack-aggregation-commit,
      // this refers to the reward cycle argument in that function.
      rewardCycle: 1,
      // For stack-stx, this refers to lock-period. For stack-extend,
      // this refers to extend-count. For stack-aggregation-commit, this is
      // u1.
      period: 1,
      // A string representing the function where this authorization is valid.
      // Either stack-stx, stack-extend, stack-increase or agg-commit.
      topic: Pox4SignatureTopic.AggregateIncrease,
      // The PoX address that can be used with this signer key.
      poxAddress: poxAddress,
      // The unique auth-id for this authorization.
      authId: 0,
      // The maximum amount of uSTX that can be used (per tx) with this signer
      // key (we'll use an incredibly high amount :) ).
      maxAmount: Number.MAX_SAFE_INTEGER,
    });
    const operatorSigIncrease2 = walletsStackingMapping.deployer.stackingClient.signPoxSignature({
      // The signer key being authorized.
      signerPrivateKey: walletsStackingMapping.deployer.privKey,
      // The reward cycle for which the authorization is valid.
      // For stack-stx and stack-extend, this refers to the reward cycle
      // where the transaction is confirmed. For stack-aggregation-commit,
      // this refers to the reward cycle argument in that function.
      rewardCycle: 1,
      // For stack-stx, this refers to lock-period. For stack-extend,
      // this refers to extend-count. For stack-aggregation-commit, this is
      // u1.
      period: 1,
      // A string representing the function where this authorization is valid.
      // Either stack-stx, stack-extend, stack-increase or agg-commit.
      topic: Pox4SignatureTopic.AggregateIncrease,
      // The PoX address that can be used with this signer key.
      poxAddress: poxAddress,
      // The unique auth-id for this authorization.
      authId: 1,
      // The maximum amount of uSTX that can be used (per tx) with this signer
      // key (we'll use an incredibly high amount :) ).
      maxAmount: Number.MAX_SAFE_INTEGER,
    });

    // wallet_1 delegating block 1
    let txs = [
      tx.callPublicFn(poxContract, 'allow-contract-caller', [Cl.principal(contract), Cl.none()], wallet_1),
      tx.callPublicFn(contract, 'join-stacking-pool', [], wallet_1),
      tx.callPublicFn(contract, 'delegate-stx', [Cl.uint(850_000_000_000)], wallet_1),
      tx.callPublicFn(
        contract,
        'maybe-stack-aggregation-commit',
        [
          Cl.uint(0),
          Cl.some(Cl.bufferFromHex(operatorSigCommit)),
          Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
          Cl.uint(Number.MAX_SAFE_INTEGER),
          Cl.uint(0),
        ],
        wallet_1
      ),
    ];
    const block1 = simnet.mineBlock(txs);
    expect(block1[0].result).toBeOk(Cl.bool(true));
    expect(block1[1].result).toBeOk(Cl.bool(true));
    expect(block1[2].result).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_1),
        'lock-amount': Cl.uint(849_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(block1[3].result).toBeOk(Cl.bool(true));

    // wallet_2 delegating block 2
    txs = [
      tx.callPublicFn(poxContract, 'allow-contract-caller', [Cl.principal(contract), Cl.none()], wallet_2),
      tx.callPublicFn(contract, 'join-stacking-pool', [], wallet_2),
      tx.callPublicFn(contract, 'delegate-stx', [Cl.uint(100_000_000_000)], wallet_2),
      tx.callPublicFn(
        contract,
        'maybe-stack-aggregation-commit',
        [
          Cl.uint(0),
          Cl.some(Cl.bufferFromHex(operatorSigIncrease1)),
          Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
          Cl.uint(Number.MAX_SAFE_INTEGER),
          Cl.uint(0),
        ],
        wallet_2
      ),
    ];
    const block2 = simnet.mineBlock(txs);
    expect(block2[0].result).toBeOk(Cl.bool(true));
    expect(block2[1].result).toBeOk(Cl.bool(true));
    expect(block2[2].result).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_2),
        'lock-amount': Cl.uint(99_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );

    // wallet_3 delegating block 3
    txs = [
      tx.callPublicFn(poxContract, 'allow-contract-caller', [Cl.principal(contract), Cl.none()], wallet_3),
      tx.callPublicFn(contract, 'join-stacking-pool', [], wallet_3),
      tx.callPublicFn(contract, 'delegate-stx', [Cl.uint(50_000_000_000)], wallet_3),
      tx.callPublicFn(
        contract,
        'maybe-stack-aggregation-commit',
        [
          Cl.uint(0),
          Cl.some(Cl.bufferFromHex(operatorSigIncrease2)),
          Cl.buffer(walletsStackingMapping.deployer.pubKey.data),
          Cl.uint(Number.MAX_SAFE_INTEGER),
          Cl.uint(1),
        ],
        wallet_3
      ),
    ];
    const block3 = simnet.mineBlock(txs);
    expect(block3[0].result).toBeOk(Cl.bool(true));
    expect(block3[1].result).toBeOk(Cl.bool(true));
    expect(block3[2].result).toBeOk(
      Cl.tuple({
        stacker: Cl.principal(wallet_3),
        'lock-amount': Cl.uint(49_999_000_000),
        'unlock-burn-height': Cl.uint(2100),
      })
    );
    expect(block3[3].result).toBeOk(Cl.bool(true));

    simnet.mineEmptyBlocks(1000);

    const { result: updateSCBalances } = simnet.callPublicFn(contract, 'update-sc-balances', [], deployer);
    expect(updateSCBalances).toBeOk(Cl.bool(true));

    simnet.mineEmptyBlocks(1047);
    console.log(getTotalStackedByCycle(1, 0, deployer).value);
    // console.log(simnet.getMapEntry(poxContract, 'reward-cycle-total-stacked', Cl.uint(1)));
    // console.log(simnet.getMapEntry(contract, 'user-data', Cl.principal(wallet_1)));

    // check blocks
    console.log(simnet.blockHeight);

    let blockList: ClarityValue[] = [];
    for (let i = 1; i <= 999; i++) {
      blockList.push(Cl.uint(i + 1050));
    }
    // let testlist: ClarityValue[] = [];
    // for (let i = 1051; i <= 1063; i++) {
    //   testlist.push(Cl.uint(i));
    // }
    // const { result: batchCheckedBlocks } = simnet.callReadOnlyFn(
    //   contract,
    //   'check-won-block-rewards-batch',
    //   [Cl.list(testlist)],
    //   deployer
    // );
    // console.log(batchCheckedBlocks.value);
    let checkBlocksList: ClarityValue[] = [];
    let rewardBlockList: any[] = [];
    for (let blocks12 = 0; blocks12 <= 600; blocks12 += 300) {
      for (let blocks = 1; blocks <= 300; blocks++) {
        checkBlocksList.push(blockList.at(blocks + blocks12)!);
        // console.log(blocks + blocks12 + 1050);
      }
      const { result: check } = simnet.callReadOnlyFn(
        contract,
        'check-addr-won-block-rewards-batch',
        [Cl.list(checkBlocksList)],
        deployer
      );
      console.log(check.value.list);
      Object.entries(check.value.list).forEach(([, value]) => {
        // const blockheight = parseInt((value as any).value);
        rewardBlockList.push([
          Buffer.from(value.data.addrs.data.hashbytes.buffer, 'hex'),
          value.data.addrs.data.version.buffer,
        ]);
      });

      const { result: batchCheckedBlocks } = simnet.callReadOnlyFn(
        contract,
        'check-won-block-rewards-batch',
        [Cl.list(checkBlocksList)],
        deployer
      );
      // console.log(batchCheckedBlocks.value);
      console.log('data ', Buffer.from(simnet.getDataVar(contract, 'pool-pox-address').data.hashbytes.buffer, 'hex'));
      // console.log('data ', simnet.getDataVar(contract, 'pool-pox-address').data.hashbytes);
      checkBlocksList = [];
      // Object.entries(batchCheckedBlocks.value).forEach(([, value]) => {
      //   const blockheight = parseInt((value as any).value);
      //   if (blockheight) rewardBlockList.push(blockheight);
      // });
    }
    console.log(rewardBlockList);
    // 4 blocks left
  });
});
