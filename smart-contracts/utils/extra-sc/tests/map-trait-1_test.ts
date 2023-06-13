// import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.4.0/index.ts';
// import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';
// const ASK_TO_JOIN = 'ask-to-join';
// const VOTE_POSITIVE_JOIN='vote-positive-join-request';
// const VOTE_NEGATIVE_JOIN='vote-negative-join-request';
// const ADD_PENDING_MINERS ='add-pending-miners-to-pool';
// const GET_PENDING_LIST = `get-pending-accept-list`;
// const CONTRACT_NAME='map-trait-1';

// Clarinet.test({
//     name: "Ensure that <...>",
//     async fn(chain: Chain, accounts: Map<string, Account>) {
//         const deployer = accounts.get('deployer')!;
//         const user1 = accounts.get('wallet_1')!;
//         const user108 = accounts.get('wallet_108')!;
//         const user107 = accounts.get('wallet_107')!;
//         const user106 = accounts.get('wallet_106')!;
//         const user105 = accounts.get('wallet_105')!;
//         const user104 = accounts.get('wallet_104')!;
//         const user103 = accounts.get('wallet_103')!;
//         const user102 = accounts.get('wallet_102')!;
//         const user101 = accounts.get('wallet_101')!;
//         const user100 = accounts.get('wallet_100')!;
//         const user99 = accounts.get('wallet_99')!;
//         const user98 = accounts.get('wallet_98')!;
//         const user97 = accounts.get('wallet_97')!;
//         const user96 = accounts.get('wallet_96')!;
//         const user95 = accounts.get('wallet_95')!;
//         const user94 = accounts.get('wallet_94')!;

//         let block = chain.mineBlock([
//             Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
//         ]);
//         assertEquals(block.receipts[0].result,'(ok true)')
//         assertEquals(block.receipts.length, 1);
//         assertEquals(block.height, 2);

//         block = chain.mineBlock([
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user94.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user95.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user96.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user97.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user98.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user99.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user100.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user101.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_NEGATIVE_JOIN, [types.principal(user1.address)], user102.address),
//             Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user106.address),

//         ]);
//         assertEquals(block.receipts[0].result,'(ok true)')
//         assertEquals(block.receipts[1].result,'(ok true)')
//         assertEquals(block.receipts[2].result,'(ok true)')
//         assertEquals(block.receipts[3].result,'(ok true)')
//         assertEquals(block.receipts[4].result,'(ok true)')
//         assertEquals(block.receipts[5].result,'(ok true)')
//         assertEquals(block.receipts[6].result,'(ok true)')
//         assertEquals(block.receipts[7].result,'(ok true)')
//         assertEquals(block.receipts[8].result,'(ok true)')
//         assertEquals(block.receipts[9].result,'[]')
//         assertEquals(block.receipts.length, 10);
//         assertEquals(block.height, 3);

//         block = chain.mineBlock([
//             Tx.contractCall(CONTRACT_NAME, ASK_TO_JOIN, [types.principal(user1.address)], user1.address),
//         ]);
//         assertEquals(block.receipts[0].result,'(ok true)')
//         assertEquals(block.receipts.length, 1);
//         assertEquals(block.height, 4);

//         block = chain.mineBlock([
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user94.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user95.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user96.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user97.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user98.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user99.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user100.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user101.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user102.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user103.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user104.address),
//             Tx.contractCall(CONTRACT_NAME, VOTE_POSITIVE_JOIN, [types.principal(user1.address)], user105.address),
//             Tx.contractCall(CONTRACT_NAME, GET_PENDING_LIST, [], user106.address),
//         ]);
//         assertEquals(block.receipts[0].result,'(ok true)')
//         assertEquals(block.receipts[1].result,'(ok true)')
//         assertEquals(block.receipts[2].result,'(ok true)')
//         assertEquals(block.receipts[3].result,'(ok true)')
//         assertEquals(block.receipts[4].result,'(ok true)')
//         assertEquals(block.receipts[5].result,'(ok true)')
//         assertEquals(block.receipts[6].result,'(ok true)')
//         assertEquals(block.receipts[7].result,'(ok true)')
//         assertEquals(block.receipts[8].result,'(ok true)')
//         assertEquals(block.receipts[9].result,'(ok true)')
//         assertEquals(block.receipts[10].result,'(ok true)')
//         assertEquals(block.receipts[11].result,'(ok true)')
//         assertEquals(block.receipts[12].result,`[${user1.address}]`)
//         assertEquals(block.receipts.length, 13);
//         assertEquals(block.height, 5);
//     },
// });
