// import { Chain, Tx, types, Account } from '../deps.ts';

// export function fpDelegationAllowContractCaller(
//   contractCaller: string,
//   untilBurnHt: number | undefined,
//   user: Account
// ) {
//   return Tx.contractCall(
//     'stacking-pool-test',
//     'allow-contract-caller',
//     [types.principal(contractCaller), untilBurnHt ? types.some(types.uint(untilBurnHt)) : types.none()],
//     user.address
//   );
// }

// export function delegateStx(amount: number, user: Account) {
//   return Tx.contractCall('stacking-pool-test', 'delegate-stx', [types.uint(amount)], user.address);
// }

// export function delegateStackStx(stacker: Account, user: Account) {
//   return Tx.contractCall('stacking-pool-test', 'delegate-stack-stx', [types.principal(stacker.address)], user.address);
// }

// export function joinStackingPool(user: Account) {
//   return Tx.contractCall('stacking-pool-test', 'join-stacking-pool', [], user.address);
// }

// export function quitStackingPool(user: Account) {
//   return Tx.contractCall('stacking-pool-test', 'quit-stacking-pool', [], user.address);
// }

// export function delegateStackStxMany(stackers: Account[], user: Account) {
//   return Tx.contractCall(
//     'stacking-pool-test',
//     'delegate-stack-stx-many',
//     [types.list(stackers.map((s) => types.principal(s.address)))],
//     user.address
//   );
// }

// export function getUserData(stacker: Account, user: Account) {
//   return Tx.contractCall('stacking-pool-test', 'get-user-data', [types.principal(stacker.address)], user.address);
// }

// export function getPoolMembers(user: Account) {
//   return Tx.callReadOnlyFn('stacking-pool-test', 'get-pool-members', [], user.address);
// }

// export function batchCheckRewards(burnBlocksList: Account[], user: Account) {
//   return Tx.contractCall(
//     'stacking-pool-test',
//     'check-won-block-rewards-batch',
//     [types.list(burnBlocksList.map((s) => types.uint(s)))],
//     user.address
//   );
// }

// export function batchRewardsDistribution(burnBlocksList: Account[], user: Account) {
//   return Tx.contractCall(
//     'stacking-pool-test',
//     'batch-reward-distribution',
//     [types.list(burnBlocksList.map((s) => types.uint(s)))],
//     user.address
//   );
// }

// export function batchStackStx(burnBlocksList: Account[], user: Account) {
//   return Tx.contractCall(
//     'stacking-pool-test',
//     'delegate-stack-stx-many',
//     [types.list(burnBlocksList.map((s) => types.principal(s)))],
//     user.address
//   );
// }

// export function stackStx(who: Account, user: Account) {
//   return Tx.contractCall('stacking-pool-test', 'delegate-stack-stx', [types.principal(who.address)], user.address);
// }

// // // admin functions

// // export function setActive(active: boolean, user: Account) {
// //   return Tx.contractCall(
// //     "stacking-pool",
// //     "set-active",
// //     [types.bool(active)],
// //     user.address
// //   );
// // }

// // export function setStxBuffer(amount: number, user: Account) {
// //   return Tx.contractCall(
// //     "stacking-pool",
// //     "set-stx-buffer",
// //     [types.uint(amount)],
// //     user.address
// //   );
// // }

// // export function setPoolPoxAddress(
// //   poxAddress: { hashbytes: string; version: string },
// //   user: Account
// // ) {
// //   return Tx.contractCall(
// //     "stacking-pool",
// //     "set-pool-pox-address",
// //     [types.tuple(poxAddress)],
// //     user.address
// //   );
// // }

// // export function setRewardAdmin(
// //   newAdmin: string,
// //   enable: boolean,
// //   user: Account
// // ) {
// //   return Tx.contractCall(
// //     "stacking-pool",
// //     "set-reward-admin",
// //     [types.principal(newAdmin), types.bool(enable)],
// //     user.address
// //   );
// // }
