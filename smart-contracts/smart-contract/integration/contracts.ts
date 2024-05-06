// Code generated with the stacksjs-helper-generator extension
// Manual edits will be overwritten

import {
  ClarityValue,
  BooleanCV,
  IntCV,
  UIntCV,
  BufferCV,
  OptionalCV,
  ResponseCV,
  PrincipalCV,
  ListCV,
  TupleCV,
  StringAsciiCV,
  StringUtf8CV,
  NoneCV,
  StandardPrincipalCV,
} from '@stacks/transactions';

export namespace mainContract {
  export const address = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  export const name = 'stacking-pool-test';

  // Functions
  export namespace Functions {
    // delegate-stack-stx
    export namespace DelegateStackStx {
      export const name = 'delegate-stack-stx';

      export interface DelegateStackStxArgs {
        amountUstx: UIntCV;
        user: PrincipalCV;
      }

      export function args(args: DelegateStackStxArgs): ClarityValue[] {
        return [args.amountUstx, args.user];
      }
    }

    export namespace DelegateStackStxMany {
      export const name = 'delegate-stack-stx-many';

      export interface DelegateStackStxArgs {
        stackersLockList: ListCV<PrincipalCV>;
      }

      export function args(args: DelegateStackStxArgs): ClarityValue[] {
        return [args.stackersLockList];
      }
    }

    export namespace DepositStxOwner {
      export const name = 'deposit-stx-liquidity-provider';

      export interface DepositStxOwnerArgs {
        amountUstx: UIntCV;
      }

      export function args(args: DepositStxOwnerArgs): ClarityValue[] {
        return [args.amountUstx];
      }
    }

    export namespace ReserveFundsLiqProvider {
      export const name = 'reserve-funds-future-rewards';

      export interface ReserveFundsLiqProviderArgs {
        amountUstx: UIntCV;
      }

      export function args(args: ReserveFundsLiqProviderArgs): ClarityValue[] {
        return [args.amountUstx];
      }
    }

    export namespace JoinStackingPool {
      export const name = 'join-stacking-pool';

      export interface joinStackingPoolArgs {}

      export function args(args: joinStackingPoolArgs): ClarityValue[] {
        return [];
      }
    }

    export namespace UpdateScBalances {
      export const name = 'update-sc-balances';

      export interface DelegateStxArgs {}

      export function args(args: DelegateStxArgs): ClarityValue[] {
        return [];
      }
    }

    export namespace DelegateStx {
      export const name = 'delegate-stx';

      export interface DelegateStxArgs {
        amountUstx: UIntCV;
      }

      export function args(args: DelegateStxArgs): ClarityValue[] {
        return [args.amountUstx];
      }
    }

    export namespace RewardDistribution {
      export const name = 'reward-distribution';

      export interface RewardDistributionArgs {
        burnBlockHeight: UIntCV;
      }

      export function args(args: RewardDistributionArgs): ClarityValue[] {
        return [args.burnBlockHeight];
      }
    }

    // get-first-result
    export namespace GetFirstResult {
      export const name = 'get-first-result';

      export interface GetFirstResultArgs {
        results: ClarityValue;
      }

      export function args(args: GetFirstResultArgs): ClarityValue[] {
        return [args.results];
      }
    }
  }
}
