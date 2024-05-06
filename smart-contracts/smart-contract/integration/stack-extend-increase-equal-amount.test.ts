// /// Stackers call delegate-stx multiple times
// import {
//   buildDevnetNetworkOrchestrator,
//   FAST_FORWARD_TO_EPOCH_2_4,
//   getAccount,
//   getBlockPoxAddresses,
//   getBlockRewards,
//   getCheckDelegation,
//   getNetworkIdFromEnv,
//   getScLockedBalance,
//   getStackerWeight,
//   getPoxInfo,
//   readRewardCyclePoxAddressForAddress,
//   readRewardCyclePoxAddressListAtIndex,
//   waitForRewardCycleId,
//   waitForNextPreparePhase,
//   waitForNextRewardPhase,
//   getUserData,
// } from './helpers-stacking';
// import { Accounts, Contracts, Constants } from './constants-stacking';
// import { StacksTestnet } from '@stacks/network';
// import { DevnetNetworkOrchestrator, StacksBlockMetadata } from '@hirosystems/stacks-devnet-js';
// import { broadcastAllowContractCallerContracCall } from './allowContractCaller';
// import { afterAll, beforeAll, describe, it, expect } from 'vitest';
// import {
//   broadcastDelegateStackStx,
//   broadcastDelegateStackStxMany,
//   broadcastDelegateStx,
//   broadcastDepositStxOwner,
//   broadcastJoinPool,
//   broadcastReserveStxOwner,
//   broadcastRewardDistribution,
//   broadcastUpdateScBalances,
// } from './helper-fp';
// import { noneCV, uintCV } from '@stacks/transactions';
// import { mainContract } from './contracts';

// describe(
//   'testing stacking under epoch 2.4',
//   () => {
//     let orchestrator: DevnetNetworkOrchestrator;
//     let timeline = FAST_FORWARD_TO_EPOCH_2_4;

//     beforeAll(() => {
//       orchestrator = buildDevnetNetworkOrchestrator(getNetworkIdFromEnv(), timeline);
//       orchestrator.start(500000);
//     });

//     afterAll(() => {
//       orchestrator.terminate();
//     });

//     it('whole flow many cycles 4 stackers + liquidity provider', async () => {
//       const network = new StacksTestnet({ url: orchestrator.getStacksNodeUrl() });

//       let usersList = [Accounts.WALLET_1, Accounts.WALLET_2, Accounts.WALLET_3, Accounts.WALLET_4];

//       // Wait for Pox-3 activation

//       await orchestrator.waitForStacksBlockAnchoredOnBitcoinBlockOfHeight(timeline.epoch_2_4 + 1, 5, true);
//       console.log(await getPoxInfo(network));

//       // Wait for the contracts to be deployed

//       let chainUpdate, txs;
//       // chainUpdate = await orchestrator.waitForNextStacksBlock();
//       // txs = chainUpdate.new_blocks[0].block.transactions;

//       // Deposit STX Liquidity Provider

//       await broadcastDepositStxOwner({
//         amountUstx: 11_000_000_000,
//         nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
//         network: network,
//         user: Accounts.DEPLOYER,
//       });

//       // Check the deposit tx

//       let depositTxIndex = 0;
//       let blockIndex = 0;
//       while (depositTxIndex < 1) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         blockIndex++;
//         if (txs.length > 1) {
//           let txMetadata = txs[1].metadata;
//           let txData = txMetadata.kind.data;
//           let txSC = txData['contract_identifier'];
//           let txMethod = txData['method'];
//           if (txMethod == 'deposit-stx-liquidity-provider') {
//             expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//             expect(txMethod as any).toBe('deposit-stx-liquidity-provider');
//             expect((txMetadata as any)['success']).toBe(true);
//             expect((txMetadata as any)['result']).toBe(`(ok true)`);
//             depositTxIndex++;
//           }
//         }
//       }

//       // Allow pool in Pox-3

//       await broadcastAllowContractCallerContracCall({
//         network,
//         nonce: 0, // (await getAccount(network, usersList[0].stxAddress)).nonce,
//         senderKey: usersList[0].secretKey,
//       });
//       await broadcastAllowContractCallerContracCall({
//         network,
//         nonce: 0, //(await getAccount(network, usersList[1].stxAddress)).nonce,
//         senderKey: usersList[1].secretKey,
//       });
//       await broadcastAllowContractCallerContracCall({
//         network,
//         nonce: 0, // (await getAccount(network, usersList[2].stxAddress)).nonce,
//         senderKey: usersList[2].secretKey,
//       });

//       // Check the allow txs

//       let allowTxIndex = 0;
//       blockIndex = 0;

//       while (allowTxIndex < 3) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         blockIndex++;

//         if (txs.length > 1) {
//           for (let i = 1; i <= txs.length - 1; i++) {
//             let txMetadata = txs[i].metadata;
//             let txData = txMetadata.kind.data;
//             let txSC = txData['contract_identifier'];
//             let txMethod = txData['method'];

//             if (txMethod == 'allow-contract-caller') {
//               expect(txSC as any).toBe(`${Contracts.POX_3.address}.${Contracts.POX_3.name}`);
//               expect(txMethod as any).toBe('allow-contract-caller');
//               expect((txMetadata as any)['success']).toBe(true);
//               expect((txMetadata as any)['result']).toBe(`(ok true)`);
//               allowTxIndex++;
//               console.log(txMetadata);
//             }
//           }
//         }
//       }

//       // Reserve STX for future rewards Liquidity Provider

//       await broadcastReserveStxOwner({
//         amountUstx: 11_000_000_000,
//         nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
//         network: network,
//         user: Accounts.DEPLOYER,
//       });

//       // Check the Reserve STX tx

//       for (let i = 0; i <= 15; i++) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;

//         if (txs.length > 1) {
//           let txMetadata = txs[1].metadata;
//           let txData = txMetadata.kind.data;
//           let txSC = txData['contract_identifier'];
//           let txMethod = txData['method'];

//           expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//           expect(txMethod as any).toBe('reserve-funds-future-rewards');
//           expect((txMetadata as any)['success']).toBe(true);
//           expect((txMetadata as any)['result']).toBe(`(ok true)`);
//           i = 15;
//         }
//       }

//       // 3 Stackers Join Pool

//       for (let i = 0; i < usersList.length - 1; i++) {
//         await broadcastJoinPool({
//           nonce: 1, // (await getAccount(network, usersList[i].stxAddress)).nonce,
//           network,
//           user: usersList[i],
//         });
//       }

//       // Check the Join txs

//       let joinTxIndex = 0;
//       blockIndex = 0;
//       while (joinTxIndex < 3) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         blockIndex++;
//         if (txs.length > 1) {
//           for (let i = 1; i <= txs.length - 1; i++) {
//             let txMetadata = txs[i].metadata;
//             let txData = txMetadata.kind.data;
//             let txSC = txData['contract_identifier'];
//             let txMethod = txData['method'];

//             expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//             expect(txMethod as any).toBe('join-stacking-pool');
//             expect((txMetadata as any)['success']).toBe(true);
//             expect((txMetadata as any)['result']).toBe(`(ok true)`);
//             joinTxIndex++;
//           }
//         }
//       }
//       await waitForNextRewardPhase(network, orchestrator);
//       chainUpdate = await orchestrator.waitForNextStacksBlock();
//       console.log((await getAccount(network, usersList[0].stxAddress)).nonce);
//       console.log(
//         '** BEFORE DELEGATE STX ' +
//           (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
//       );

//       // 3 Stackers Delegate STX

//       await broadcastDelegateStx({
//         amountUstx: 125_000_000_000,
//         user: usersList[0],
//         nonce: 2, //(await getAccount(network, usersList[0].stxAddress)).nonce,
//         network,
//       });

//       await broadcastDelegateStx({
//         amountUstx: 125_000_000_000,
//         user: usersList[1],
//         nonce: 2, //(await getAccount(network, usersList[1].stxAddress)).nonce,
//         network,
//       });

//       await broadcastDelegateStx({
//         amountUstx: 50_286_942_145_278, // pox activation threshold
//         user: usersList[2],
//         nonce: 2, //(await getAccount(network, usersList[2].stxAddress)).nonce,
//         network,
//       });

//       // Check the Delegate txs

//       let delegateTxIndex = 0;
//       blockIndex = 0;
//       while (delegateTxIndex < 3) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         blockIndex++;
//         if (txs.length > 1) {
//           for (let i = 1; i <= txs.length - 1; i++) {
//             let txMetadata = txs[i].metadata;
//             let txData = txMetadata.kind.data;
//             let txSC = txData['contract_identifier'];
//             let txMethod = txData['method'];

//             expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//             expect(txMethod as any).toBe('delegate-stx');
//             expect((txMetadata as any)['success']).toBe(true);
//             // expect((txMetadata as any)['result']).toBe(`(ok true)`);
//             delegateTxIndex++;
//             console.log(`Delegate STX Metadata ${delegateTxIndex}, block index ${blockIndex}`, txMetadata);
//           }
//         }
//       }
//       console.log((await getAccount(network, usersList[0].stxAddress)).nonce);

//       console.log(
//         'Bitcoin block after the 3 delegations: ' +
//           (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
//       );

//       // chainUpdate = orchestrator.waitForNextStacksBlock();
//       // chainUpdate = orchestrator.waitForNextStacksBlock();

//       await broadcastDelegateStx({
//         amountUstx: 99_999_999_998_028,
//         user: usersList[0],
//         nonce: 3, //(await getAccount(network, usersList[0].stxAddress)).nonce,
//         network,
//       });

//       delegateTxIndex = 0;
//       blockIndex = 0;
//       while (delegateTxIndex < 1) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         console.log('transactions: ', txs);
//         console.log('index: ', blockIndex);
//         blockIndex++;
//         if (txs.length > 1) {
//           for (let i = 1; i <= txs.length - 1; i++) {
//             let txMetadata = txs[i].metadata;
//             let txData = txMetadata.kind.data;
//             let txSC = txData['contract_identifier'];
//             let txMethod = txData['method'];

//             console.log(txMetadata);

//             expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//             expect(txMethod as any).toBe('delegate-stx');
//             expect((txMetadata as any)['success']).toBe(true);
//             delegateTxIndex++;
//             console.log(`Delegate STX Metadata ${delegateTxIndex}, block index ${blockIndex}`, txMetadata);
//             console.log(`Delegate STX events: ${txMetadata.receipt.events} `);
//           }
//         }
//       }

//       console.log(
//         'Bitcoin block after the extend-increase (2nd delegation using the same address): ' +
//           (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
//       );

//       await orchestrator.waitForNextStacksBlock();

//       // Check pool SC balances

//       // Map each user to a getUserData promise
//       const userDataPromises = usersList.slice(0, 3).map((user) => getUserData(network, user.stxAddress));

//       // Wait for all promises to resolve
//       const allUserData = await Promise.all(userDataPromises);

//       // Process each user data
//       allUserData.forEach((userData, i) => {
//         console.log('USER DATA VALUE: ', userData);
//         let userDelegatedInPool = userData['delegated-balance'].value;
//         let userLockedInPool = userData['locked-balance'].value;
//         let userUntilBurnHt = userData['until-burn-ht'].value;
//         console.log(`USER ${i} DELEGATED BALANCE: `, userDelegatedInPool);
//         console.log(`USER ${i} LOCKED BALANCE: `, userLockedInPool);
//         console.log(`USER ${i} until: `, userUntilBurnHt);

//         expect(userDelegatedInPool).toBe(i === 0 ? '99999999998028' : i === 1 ? '125000000000' : '50286942145278');
//         // 1st user's amount owned is less than what he delegated
//         expect(userLockedInPool).toBe(i === 0 ? '99999998998028' : i === 1 ? '124999000000' : '50286941145278');
//       });

//       // Friedger check table entry:

//       let poxInfo = await getPoxInfo(network);
//       console.log('pox info CURRENT CYCLE:', poxInfo.current_cycle);
//       console.log('pox info NEXT CYCLE:', poxInfo.next_cycle);

//       let poxAddrInfo0 = await readRewardCyclePoxAddressForAddress(
//         network,
//         poxInfo.current_cycle.id,
//         Accounts.DEPLOYER.stxAddress
//       );

//       expect(poxAddrInfo0).toBeNull();

//       let poxAddrInfo1 = await readRewardCyclePoxAddressListAtIndex(network, await poxInfo.next_cycle.id, 0);
//       let poxAddrInfo2 = await readRewardCyclePoxAddressListAtIndex(network, await poxInfo.next_cycle.id, 1);
//       let poxAddrInfo;

//       if (poxAddrInfo2) {
//         poxAddrInfo = poxAddrInfo2;
//       } else {
//         poxAddrInfo = poxAddrInfo1;
//       }

//       // Check the Total Stacked STX

//       expect(poxAddrInfo?.['total-ustx']).toEqual(uintCV(150_411_939_143_306));

//       // Check balances

//       let userAccount1 = await getAccount(network, usersList[0].stxAddress);
//       console.log('first user:', userAccount1);
//       expect(userAccount1.balance).toBe(1000000n);

//       let userAccount2 = await getAccount(network, usersList[1].stxAddress);
//       console.log('second user:', userAccount2);

//       let userAccount3 = await getAccount(network, usersList[2].stxAddress);
//       console.log('third user:', userAccount3);

//       let userAccount4 = await getAccount(network, usersList[3].stxAddress);
//       console.log('fourth user:', userAccount4);

//       // Update SC balances

//       await waitForNextPreparePhase(network, orchestrator);
//       chainUpdate = await orchestrator.waitForNextStacksBlock();

//       await broadcastUpdateScBalances({
//         user: Accounts.DEPLOYER,
//         nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
//         network,
//       });

//       let updateBalancesTxIndex = 0;
//       blockIndex = 0;

//       while (updateBalancesTxIndex < 1) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         blockIndex++;

//         if (txs.length > 1) {
//           for (let i = 1; i <= txs.length - 1; i++) {
//             let txMetadata = txs[i].metadata;
//             let txData = txMetadata.kind.data;
//             let txSC = txData['contract_identifier'];
//             let txMethod = txData['method'];
//             let updateBalancesBlock = (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata)
//               .bitcoin_anchor_block_identifier.index;
//             console.log('** UPDATE BALANCES BLOCK ' + updateBalancesBlock);
//             if (updateBalancesBlock % 10 > 8 || updateBalancesBlock % 10 < 6)
//               expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//             expect(txMethod as any).toBe('update-sc-balances');
//             expect((txMetadata as any)['success']).toBe(true);
//             expect((txMetadata as any)['result']).toBe(`(ok true)`);
//             updateBalancesTxIndex++;
//             console.log(`Update Balances Metadata ${updateBalancesTxIndex}, block index ${blockIndex}`, txMetadata);
//           }
//         }
//       }
//       await orchestrator.waitForNextStacksBlock();
//       let scLockedBalance = await getScLockedBalance(network);
//       expect(scLockedBalance.value as any).toBe('150411939143306');

//       // Check weights

//       let deployerWeight = await getStackerWeight(network, Accounts.DEPLOYER.stxAddress, poxInfo.next_cycle.id);
//       expect(deployerWeight as any).toBe('73');

//       // Prepare a list of promises for each user weight retrieval
//       const weightPromises = usersList.map((user, index) =>
//         getStackerWeight(network, user.stxAddress, poxInfo.next_cycle.id).then((weight) => ({
//           weight,
//           index,
//         }))
//       );

//       // Wait for all promises to resolve
//       const allUserWeights = await Promise.all(weightPromises);

//       // Process each user weight
//       allUserWeights.forEach(({ weight, index }) => {
//         console.log(weight, index);
//         const expectedWeight = index === 3 ? null : index === 2 ? '334303' : index === 1 ? '830' : '664792';
//         expect(weight).toBe(expectedWeight);
//       });
//       chainUpdate = await waitForRewardCycleId(network, orchestrator, poxInfo.next_cycle.id);
//       let firstBurnBlockPastRewardCycle = (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata)
//         .bitcoin_anchor_block_identifier.index;
//       console.log('** First burn block to check rewards: ' + firstBurnBlockPastRewardCycle);

//       for (let i = 1; i <= 7; i++) chainUpdate = await orchestrator.waitForNextStacksBlock();

//       console.log(
//         'Burn block when checking rewards: ' +
//           (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
//       );

//       // Print Pox Addresses for the blocks from 130 to 133

//       for (
//         let i = firstBurnBlockPastRewardCycle;
//         i <= firstBurnBlockPastRewardCycle + Constants.REWARD_CYCLE_LENGTH;
//         i++
//       )
//         await getBlockPoxAddresses(network, Accounts.DEPLOYER.stxAddress, i);

//       // Print Block Rewards for the blocks from 130 to 133

//       for (
//         let i = firstBurnBlockPastRewardCycle;
//         i <= firstBurnBlockPastRewardCycle + Constants.REWARD_CYCLE_LENGTH;
//         i++
//       )
//         await getBlockRewards(network, Accounts.DEPLOYER.stxAddress, i);

//       // Distribute Rewards For The Previously Verified Blocks (even if won or not)

//       let userIndex = 0;
//       let repeatedUsers = false;
//       for (
//         let i = firstBurnBlockPastRewardCycle;
//         i <= firstBurnBlockPastRewardCycle + Constants.REWARD_CYCLE_LENGTH;
//         i++
//       ) {
//         if (userIndex == 4) {
//           userIndex = 0;
//           repeatedUsers = true;
//         }
//         userIndex == 4 ? (userIndex = 0) : (userIndex = userIndex);

//         await broadcastRewardDistribution({
//           burnBlockHeight: i,
//           network,
//           user: usersList[userIndex],
//           nonce: repeatedUsers
//             ? (await getAccount(network, usersList[userIndex].stxAddress)).nonce + 1
//             : (
//                 await getAccount(network, usersList[userIndex].stxAddress)
//               ).nonce,
//         });
//         userIndex++;
//       }

//       let rewardDistributionTxIndex = 0;
//       blockIndex = 0;

//       while (rewardDistributionTxIndex < 6) {
//         chainUpdate = await orchestrator.waitForNextStacksBlock();
//         txs = chainUpdate.new_blocks[0].block.transactions;
//         blockIndex++;

//         if (txs.length > 1) {
//           for (let i = 1; i <= txs.length - 1; i++) {
//             let txMetadata = txs[i].metadata;
//             let txData = txMetadata.kind.data;
//             let txSC = txData['contract_identifier'];
//             let txMethod = txData['method'];
//             expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
//             expect(txMethod as any).toBe('reward-distribution');
//             console.log('Reward distribution result: ', (txMetadata as any)['result']);
//             rewardDistributionTxIndex++;
//             console.log(
//               `Reward Distribution Metadata ${rewardDistributionTxIndex}, block index ${blockIndex}`,
//               txMetadata
//             );
//           }
//         }
//       }

//       // Check Balances

//       console.log('deployer:', await getAccount(network, Accounts.DEPLOYER.stxAddress));
//       console.log('first user:', await getAccount(network, usersList[0].stxAddress));
//       console.log('second user:', await getAccount(network, usersList[1].stxAddress));
//       console.log('third user:', await getAccount(network, usersList[2].stxAddress));
//       console.log('fourth user:', await getAccount(network, usersList[3].stxAddress));
//     });
//   },
//   { timeout: 100_000_000 }
// );
