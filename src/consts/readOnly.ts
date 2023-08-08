import { StacksMocknet, StacksMainnet, StacksTestnet } from '@stacks/network';
import { apiUrl, network } from './network';
import { contractMapping, functionMapping } from './contract';
import {
  callReadOnlyFunction,
  ClarityValue,
  ListCV,
  listCV,
  cvToJSON,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { convertPrincipalToArg, convertPrincipalToList, fromResultToList, convertCVToValue } from './converter';
import { userSession } from '../redux/reducers/user-state';

const contractNetwork =
  network === 'mainnet'
    ? new StacksMainnet({ url: apiUrl[network] })
    : network === 'testnet'
    ? new StacksTestnet({ url: apiUrl[network] })
    : new StacksMocknet({ url: apiUrl[network] });

const localNetwork = network === 'devnet' ? 'testnet' : network;

const ReadOnlyFunctions = async (
  type: 'mining' | 'stacking' | 'pox',
  function_args: ClarityValue[],
  contractFunctionName: string
) => {
  const userAddress = !userSession.isUserSignedIn()
    ? contractMapping[type][network].owner
    : userSession.loadUserData().profile.stxAddress[localNetwork];

  const readOnlyResults = {
    contractAddress: contractMapping[type][network].contractAddress,
    contractName: contractMapping[type][network].contractName,
    functionName: contractFunctionName,
    network: contractNetwork,
    functionArgs: function_args,
    senderAddress: userAddress,
  };
  console.log(readOnlyResults);
  return callReadOnlyFunction(readOnlyResults);
};

const ReadOnlyFunctionsPox = async (contractFunctionName: string, function_args: ClarityValue[]) => {
  const type = 'pox';
  const userAddress =
    network === 'mainnet'
      ? userSession.loadUserData().profile.stxAddress.mainnet
      : userSession.isUserSignedIn()
      ? userSession.loadUserData().profile.stxAddress.testnet
      : contractMapping[type][network].owner;

  const readOnlyResults = {
    contractAddress: contractMapping[type][network].contractAddress,
    contractName: contractMapping[type][network].contractName,
    functionName: contractFunctionName,
    network: contractNetwork,
    functionArgs: function_args,
    senderAddress: userAddress,
  };

  return callReadOnlyFunction(readOnlyResults);
};

// get-address-status
// args: (address principal)
// what does it do: It returns the formatted status of the given address
// return: 'Miner', 'Waiting', 'Pending', or 'Not Asked to Join'

export const readOnlyAddressStatusMining = async (args: string) => {
  const type = 'mining';
  const statusArgs = convertPrincipalToArg(args);

  const status = await ReadOnlyFunctions(type, [statusArgs], functionMapping[type].readOnlyFunctions.getAddressStatus);

  const statusInfo = cvToJSON(status).value.value;

  return statusInfo === 'is-miner'
    ? 'Miner'
    : statusInfo === 'is-waiting'
    ? 'Waiting'
    : statusInfo === 'is-pending'
    ? 'Pending'
    : 'NormalUser';
};

// get-all-data-waiting-miners
// args: (waiting-miners-list (list 100 principal))
// what does it do: it returns the details for every miner in the waiting list passed as argument
// return: address, positive votes and threshold, negative votes and threshold, was blacklisted

export const ReadOnlyAllDataWaitingMiners = async (fullWaitingList: ClarityValue) => {
  const type = 'mining';
  const newResultList: ClarityValue[] = [];
  const newAddressList: ClarityValue[] = [];
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullWaitingList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newWaitingList = fromResultToList(fullWaitingList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions(
      type,
      [newWaitingList],
      functionMapping[type].readOnlyFunctions.getAllDataWaitingMiners
    );

    if (newResult) {
      newAddressList.push(newWaitingList);
      newResultList.push(newResult);
    }
  }
  return { newResultList, newAddressList };
};

// get-proposed-removal-list
// args: none
// what does it do: returns a list of miners that are proposed for removal
// return: proposed for removal miners list

export const ReadOnlyGetProposedRemovalListMining = async () => {
  const type = 'mining';
  const removalList: ClarityValue = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getProposedRemovalList
  );
  return removalList;
};

// get-all-data-miners-proposed-for-removal
// args: (removal-miners-list (list 100 principal))
// what does it do: it returns the details for every miner in the list for miners proposed for removal, passed as argument
// return: address, positive votes and threshold, negative votes and threshold

interface RemovalsListProps {
  value: {
    value: {
      value: {
        'neg-thr': { value: string };
        'pos-thr': { value: string };
        'vts-against': { value: string };
        'vts-for': { value: string };
      };
    };
  }[];
}

export const ReadOnlyAllDataProposedRemovalMiners = async () => {
  const type = 'mining';
  const newResultList: RemovalsListProps[] = [];
  const newAddressList: { value: { type: string; value: string }[] }[] = [];
  const fullRemovalsList: ClarityValue = await ReadOnlyGetProposedRemovalListMining();
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullRemovalsList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newRemovalsList = fromResultToList(fullRemovalsList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions(
      type,
      [newRemovalsList],
      functionMapping[type].readOnlyFunctions.getAllDataMinersProposedForRemoval
    );

    if (newResult) {
      newAddressList.push(cvToJSON(newRemovalsList));
      newResultList.push(cvToJSON(newResult));
    }
  }
  return { newResultList, newAddressList };
};

// get-all-data-miners-pending-accept
// args: (pending-miners-list (list 100 principal))
// what does it do: it returns the details for every miner that is in the pending list (given as arg)
// return: address, remaining blocks until join

export const readOnlyGetAllDataMinersPendingAccept = async () => {
  const type = 'mining';
  const newResultList: ClarityValue[] = [];
  const fullPendingList: ClarityValue = await readOnlyGetPendingAcceptList();
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullPendingList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newWaitingList = fromResultToList(fullPendingList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions(
      type,
      [newWaitingList],
      functionMapping[type].readOnlyFunctions.getAllDataMinersPendingAccept
    );

    if (newResult) {
      newResultList.push(cvToJSON(newResult));
    }
  }
  return newResultList;
};

// get-all-data-miners-in-pool
// args: (local-miners-list (list 100 principal))
// what does it do: it returns the details for every miner from arg list
// return: address, blocks as miner, was blacklisted, warnings, balance, total withdrawals

export const readOnlyGetAllDataMinersInPool = async (address: string) => {
  const type = 'mining';
  const convertedArgs = [convertPrincipalToList(address)];
  const minerData = await ReadOnlyFunctions(
    type,
    convertedArgs,
    functionMapping[type].readOnlyFunctions.getAllDataMinersInPool
  );
  const withdraws = await readOnlyGetAllTotalWithdrawalsMining(address);
  const rawBalance = await readOnlyGetBalanceMining(address);

  if (cvToJSON(minerData).value[0].value.value === '104') {
    return 'not-a-miner';
  }

  if (cvToJSON(minerData).value[0].value.value === '132') {
    return 'block-height-error';
  }

  const totalWithdraw = Number(withdraws / 1000000) + ' STX';
  const balance = Number(rawBalance / 1000000) + ' STX';
  const minerBlocks = Number(cvToJSON(minerData).value[0].value.value['blocks-as-miner'].value);
  const warnings = Number(cvToJSON(minerData).value[0].value.value.warnings.value);
  const wasBlacklisted = cvToJSON(minerData).value[0].value.value['was-blacklist'].value;

  return { totalWithdraw, balance, minerBlocks, warnings, wasBlacklisted };
};

// get-remaining-blocks-until-join
// args: none
// what does it do: Gets the number of blocks left until a miner can accept the users that are in pending list
// return: Remaining blocks, number

export const readOnlyGetRemainingBlocksJoinMining = async () => {
  const type = 'mining';
  const blocksLeft = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getRemainingBlocksUntilJoin
  );
  return Number(convertCVToValue(blocksLeft));
};

// get-data-notifier-election-process
// args: none
// what does it do: returns notifier voting status and the blocks remaining until the end
// return: vote status of the notifier, election blocks remaining

export const readOnlyGetNotifierElectionProcessData = async () => {
  const type = 'mining';
  const notifierData = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getDataNotifierElectionProcess
  );
  return cvToJSON(notifierData).value;
};

// get-all-data-notifier-voter-miners
// args: (voter-miners-list (list 100 principal))
// what does it do: returns the miner and which notifier it voted for each miner
// return: address, notifier which the users in arg list voted for

export const readOnlyGetAllDataNotifierVoterMiners = async (voterMinersList: ClarityValue) => {
  const type = 'mining';
  const votedNotifier = await ReadOnlyFunctions(
    type,
    [voterMinersList],
    functionMapping[type].readOnlyFunctions.getAllDataNotifierVoterMiners
  );
  return cvToJSON(votedNotifier).value[0].value.value === '133'
    ? "You haven't voted yet!"
    : cvToJSON(votedNotifier).value[0].value.value['voted-notifier'].value;
};

// was-block-claimed
// args: (given-block-height uint)
// what does it do: true/false if rewards on the block were claimed
// return: true or false

export const readOnlyClaimedBlockStatusMining = async (blockHeight: number) => {
  const type = 'mining';
  const convertedArgs = [uintCV(blockHeight)];
  const blockStatus = await ReadOnlyFunctions(
    type,
    convertedArgs,
    functionMapping[type].readOnlyFunctions.wasBlockClaimed
  );
  return cvToJSON(blockStatus).value;
};

// get-balance
// args: (address principal)
// what does it do: returns balance for given address
// return: balance

export const readOnlyGetBalanceMining = async (principalAddress: string) => {
  const type = 'mining';
  const balanceArgs = convertPrincipalToArg(principalAddress);
  const balance = await ReadOnlyFunctions(type, [balanceArgs], functionMapping[type].readOnlyFunctions.getBalance);
  return cvToJSON(balance).value !== null ? Number(cvToJSON(balance).value.value) : 0;
};

// get-k
// args: none
// what does it do: threshold for notifier votes
// return: number

export const readOnlyGetKMining = async () => {
  const type = 'mining';
  const k = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getK);
  return Number(cvToJSON(k).value);
};

// get-notifier
// args: none
// what does it do: returns the current notifier
// return: address

export const readOnlyGetNotifier = async () => {
  const type = 'mining';
  const currentNotifier = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getNotifier);
  return cvToJSON(currentNotifier).value;
};

// get-waiting-list
// args: none
// what does it do: returns a list of miners that are in waiting list
// return: waiting miners list

export const ReadOnlyGetWaitingList = async () => {
  const type = 'mining';
  const waitingList: ClarityValue = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getWaitingList
  );
  return waitingList;
};

// get-miners-list
// args: none
// what does it do: returns a list of miners that are in pool
// return: miners in pool list

export const ReadOnlyGetMinersList = async () => {
  const type = 'mining';
  const minersList = cvToJSON(await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getMinersList));
  return minersList;
};

// get-pending-accept-list
// args: none
// what does it do: returns the list of users that are pending
// return: list

export const readOnlyGetPendingAcceptList = async () => {
  const type = 'mining';
  const pendingAccept = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getPendingAcceptList);
  return pendingAccept;
};

// get-notifier-vote-number
// args: (voted-notifier principal)
// what does it do: get the votes for a given notifier
// return: votes, number

export const readOnlyGetNotifierVoteNumber = async (address: string) => {
  const type = 'mining';
  const principal = [convertPrincipalToArg(address)];
  const votes = await ReadOnlyFunctions(type, principal, functionMapping[type].readOnlyFunctions.getNotifierVoteNumber);
  return cvToJSON(votes).value === null ? 0 : Number(cvToJSON(votes).value.value);
};

// get-notifier-vote-status
// args: none
// what does it do: get if the notifier election process has started
// return: false or true, boolean

export const readOnlyGetNotifierVoteStatus = async () => {
  const type = 'mining';
  const notifierVoteStatus = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getNotifierVoteStatus
  );
  return notifierVoteStatus;
};

// get-current-block
// args: none
// what does it do: get the current block height of the Stacks blockchain
// returns: current block

export const readOnlyGetCurrentBlockMining = async () => {
  const type = 'mining';
  const currentBlock = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getCurrentBlock);
  return cvToJSON(currentBlock).value.value;
};

//exchange toggle for miners
// get-auto-exchange
// args: (address principal)
// what does it do: get the state of auto-exchange function
// returns: boolean

export const readOnlyExchangeToggleMining = async (args: string) => {
  const type = 'mining';
  const exchangeArgs = convertPrincipalToArg(args);
  const exchange = await ReadOnlyFunctions(
    type,
    [exchangeArgs],
    functionMapping[type].readOnlyFunctions.getCurrentExchange
  );

  return cvToJSON(exchange).value === null ? cvToJSON(exchange).value : cvToJSON(exchange).value.value.value.value;
};

// get-blocks-won
// args: none
// what does it do: number of blocks won
// returns: number

export const readOnlyGetBlocksWonMining = async () => {
  const type = 'mining';
  const wonBlocks = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getBlocksWon);
  return cvToJSON(wonBlocks).value;
};

//get-total-rewards-distributed
// args: none
// what does it do: stacks rewards
// returns: number

export const readOnlyGetStacksRewardsMining = async () => {
  const type = 'mining';
  const stacksRewards = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getTotalRewardsDistributed
  );
  return cvToJSON(stacksRewards).value;
};

// get-all-data-total-withdrawals
// args: list of addresses
// what does it do: gets how much each address in the list has withdrawn from the sc
// returns: number, amount

export const readOnlyGetAllTotalWithdrawalsMining = async (address: string) => {
  const type = 'mining';
  const convertedArgs: ClarityValue = listCV([convertPrincipalToArg(address)]);
  const totalWithdrawals = await ReadOnlyFunctions(
    type,
    [convertedArgs],
    functionMapping[type].readOnlyFunctions.getAllDataTotalWithdrawals
  );

  return cvToJSON(totalWithdrawals).value[0].value.value;
};

// get-liquidity-provider
// args: none
// what does it do: returns the current liquidity provider
// return: address

export const readOnlyGetLiquidityProvider = async () => {
  const type = 'stacking';
  const currentLiquidityProvider = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getLiquidityProvider
  );
  return cvToJSON(currentLiquidityProvider).value;
  // return currentLiquidityProvider;
};

// get-pool-members
// args: none
// what does it do: returns a list of stackers that are in pool
// return: stackers in pool list

export const ReadOnlyGetStackersList = async () => {
  const type = 'stacking';
  const stackersList = cvToJSON(
    await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getStackersList)
  );
  return stackersList;
};

// get-blocks-rewarded
// args: none
// what does it do: number of blocks rewarded
// returns: number

export const readOnlyGetBlocksRewardedStacking = async () => {
  const type = 'stacking';
  const rewardedBlocks = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getBlocksRewarded);
  return cvToJSON(rewardedBlocks).value;
};

//get-amount-rewarded
// args: none
// what does it do: bitcoin rewards
// returns: number

export const readOnlyGetBitcoinRewardsStacking = async () => {
  const type = 'stacking';
  const bitcoinRewards = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getBitcoinRewards);
  return cvToJSON(bitcoinRewards).value;
};

//get-stacked-this-cycle
// args: none
// what does it do: amound stacked this cycle
// returns: number

export const readOnlyGetStackAmounThisCycleStacking = async () => {
  const type = 'stacking';
  const stacksRewards = await ReadOnlyFunctions(
    type,
    [],
    functionMapping[type].readOnlyFunctions.getTotalStackedThisCycle
  );
  return cvToJSON(stacksRewards).value;
};

// get-address-status
// args: (principal: address)
// what does it do: It returns the formatted status of the logged in user
// return:

export const readOnlyAddressStatusStacking = async (args: string) => {
  const type = 'stacking';
  const statusArgs = convertPrincipalToArg(args);
  const status = await ReadOnlyFunctions(type, [statusArgs], functionMapping[type].readOnlyFunctions.getAddressStatus);
  const statusInfo = cvToJSON(status).value.value;
  return statusInfo === 'is-provider' ? 'Provider' : statusInfo === 'is-stacker' ? 'Stacker' : 'NormalUserStacking';
};

export const readOnlyLockedBalanceUser = async (
  userAddress: string,
  parameter: 'locked-balance' | 'delegated-balance' | 'until-burn-ht'
) => {
  const type = 'stacking';
  const userDataArgs = convertPrincipalToArg(userAddress);
  const userData = await ReadOnlyFunctions(type, [userDataArgs], functionMapping[type].readOnlyFunctions.getUserData);

  return ['locked-balance', 'delegated-balance'].indexOf(parameter) > -1
    ? parseInt(cvToJSON(userData).value.value[parameter].value)
    : parameter === 'until-burn-ht'
    ? cvToJSON(userData).value.value[parameter].value
      ? cvToJSON(userData).value.value[parameter].value.value
      : null
    : null;
};

// was-block-claimed
// args: (given-block-height uint)
// what does it do: true/false if rewards on the block were claimed
// return: true or false

export const readOnlyClaimedBlockStatusStacking = async (blockHeight: number) => {
  const type = 'stacking';
  const convertedArgs = [uintCV(blockHeight)];
  const blockStatus = await ReadOnlyFunctions(
    type,
    convertedArgs,
    functionMapping[type].readOnlyFunctions.wasBlockClaimed
  );
  return cvToJSON(blockStatus).value;
};

//get-return
// args: none
// what does it do: return the return covered
// returns: number

export const readOnlyGetReturnStacking = async () => {
  const type = 'stacking';
  const returnCovered = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getReturnCovered);
  return cvToJSON(returnCovered).value;
};

//get-minimum-deposit-liquidity-provider
// args: none
// what does it do: return the minimum deposit for liquidity provider
// returns: number

export const readOnlyGetMinimumDepositLiquidityProviderStacking = async () => {
  const type = 'stacking';
  const minimumDeposit = await ReadOnlyFunctions(type, [], functionMapping[type].readOnlyFunctions.getMinimumDeposit);
  return cvToJSON(minimumDeposit).value;
};

//get-allowance-contract-callers
//args (sender:principal, callingContract: principal)
//what does it do: returns null -> false or some value -> true

export const readOnlyGetAllowanceStacking = async (senderAddress: string) => {
  const type = 'pox';
  const convertedArgs = [principalCV(senderAddress), principalCV(contractMapping.stacking[network].contractAddress)];
  const getAllowance = await ReadOnlyFunctions(
    type,
    convertedArgs,
    functionMapping[type].readOnlyFunctions.getAllowanceStatus
  );
  console.log('allowance: ', cvToJSON(getAllowance));
  return cvToJSON(getAllowance).value;
};
