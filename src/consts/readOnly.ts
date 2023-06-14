import { StacksMocknet, StacksMainnet, StacksTestnet } from '@stacks/network';
import { network } from './network';
import { contractMapping } from './contract';
import { callReadOnlyFunction, ClarityValue, ListCV, cvToJSON } from '@stacks/transactions';
import { convertPrincipalToArg, fromResultToList, convertCVToValue } from './converter';
import { userSession } from '../redux/reducers/user-state';

const contractNetwork =
  network === 'mainnet' ? new StacksMainnet() : network === 'testnet' ? new StacksTestnet() : new StacksMocknet();

const ReadOnlyFunctions = async (function_args: ClarityValue[], contractFunctionName: string) => {
  const userAddress =
    network === 'mainnet'
      ? userSession.loadUserData().profile.stxAddress.mainnet
      : userSession.isUserSignedIn()
      ? userSession.loadUserData().profile.stxAddress.testnet
      : contractMapping[network].owner;

  const readOnlyResults = {
    contractAddress: contractMapping[network].contractAddress,
    contractName: contractMapping[network].contractName,
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

export const readOnlyAddressStatus = async (args: string) => {
  // const isUserLogged = userSession.isUserSignedIn() ? 'yes' : 'no';
  const statusArgs = convertPrincipalToArg(args);

  const status = await ReadOnlyFunctions([statusArgs], 'get-address-status');
  // isUserLogged === 'yes'
  //   ? await ReadOnlyFunctions([statusArgs], 'get-address-status')
  //   : { value: { data: 'is-none' } };

  const statusInfo = (status as any).value.data;
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

export const ReadOnlyAllDataWaitingMiners = async () => {
  const newResultList: ClarityValue[] = [];
  const fullWaitingList: ClarityValue = await ReadOnlyGetWaitingList();
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullWaitingList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newWaitingList = fromResultToList(fullWaitingList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions([newWaitingList], 'get-all-data-waiting-miners');

    if (newResult) {
      newResultList.push(cvToJSON(newResult));
    }
  }
  return newResultList;
};

// get-proposed-removal-list
// args: none
// what does it do: returns a list of miners that are proposed for removal
// return: proposed for removal miners list

export const ReadOnlyGetProposedRemovalList = async () => {
  const removalList: ClarityValue = await ReadOnlyFunctions([], 'get-proposed-removal-list');
  return removalList;
};

// get-all-data-miners-proposed-for-removal
// args: (removal-miners-list (list 100 principal))
// what does it do: it returns the details for every miner in the list for miners proposed for removal, passed as argument
// return: address, positive votes and threshold, negative votes and threshold

export const ReadOnlyAllDataProposedRemovalMiners = async () => {
  const newResultList: ClarityValue[] = [];
  const fullRemovalsList: ClarityValue = await ReadOnlyGetProposedRemovalList();
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullRemovalsList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newRemovalsList = fromResultToList(fullRemovalsList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions([newRemovalsList], 'get-all-data-miners-proposed-for-removal');

    if (newResult) {
      newResultList.push(cvToJSON(newResult));
    }
  }
  return newResultList;
};

// get-all-data-miners-pending-accept
// args: (pending-miners-list (list 100 principal))
// what does it do: it returns the details for every miner that is in the pending list (given as arg)
// return: address, remaining blocks until join
export const readOnlyGetAllDataMinersPendingAccept = async () => {
  const newResultList: ClarityValue[] = [];
  const fullPendingList: ClarityValue = await readOnlyGetPendingAcceptList();
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullPendingList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newWaitingList = fromResultToList(fullPendingList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions([newWaitingList], 'get-all-data-miners-pending-accept');

    if (newResult) {
      newResultList.push(cvToJSON(newResult));
    }
  }
  console.log('TEST', newResultList);
  return newResultList;

  // const test = await ReadOnlyFunctions([], 'get-all-data-miners-pending-accept');
  // console.log('TEST', test);
};

// get-all-data-miners-in-pool
// args: (local-miners-list (list 100 principal))
// what does it do: it returns the details for every miner from arg list
// return: address, blocks as miner, was blacklisted, warnings, balance, total withdrawals
export const readOnlyGetAllDataMinersInPool = async (localMinersList: any) => {
  const test = await ReadOnlyFunctions([], 'get-all-data-miners-in-pool');
  console.log('TEST', test);
};

// get-remaining-blocks-until-join
// args: none
// what does it do: Gets the number of blocks left until a miner can accept the users that are in pending list
// return: Remaining blocks, number
export const readOnlyGetRemainingBlocksJoin = async () => {
  const blocksLeft = await ReadOnlyFunctions([], 'get-remaining-blocks-until-join');
  return Number(convertCVToValue(blocksLeft));
};

// get-data-notifier-election-process
// args: none
// what does it do: returns notifier voting status and the blocks remaining until the end
// return: vote status of the notifier, election blocks remaining
export const readOnlyGetNotifierElectionProcessData = async () => {
  const notifierData = await ReadOnlyFunctions([], 'get-data-notifier-election-process');
  return cvToJSON(notifierData).value;
};

// get-all-data-notifier-voter-miners
// args: (voter-miners-list (list 100 principal))
// what does it do: returns the miner and which notifier it voted for each miner
// return: address, notifier which the users in arg list voted for
export const readOnlyGetAllDataNotifierVoterMiners = async (voterMinersList: any) => {
  const test = await ReadOnlyFunctions([], 'get-all-data-notifier-voter-miners');
  console.log('TEST', test);
};

// was-block-claimed
// args: (given-block-height uint)
// what does it do: true/false if rewards on the block were claimed
// return: true or false
export const readOnlyClaimedBlockStatus = async (blockHeight: any) => {
  const test = await ReadOnlyFunctions([], 'was-block-claimed');
  console.log('TEST', test);
};

// get-all-data-balance-miners
// args: (local-miners-list (list 100 principal))
// what does it do: returns the stx balance for every miner in the arg list
// return: address, balance for the address
export const readOnlyGetMinersBalanceData = async (localMinersList: any) => {
  const test = await ReadOnlyFunctions([], 'get-all-data-balance-miners');
  console.log('TEST', test);
};

// get-balance
// args: (address principal)
// what does it do: returns balance for given address
// return: balance
export const readOnlyGetBalance = async (principalAddress: string) => {
  const balanceArgs = convertPrincipalToArg(principalAddress);
  const balance = await ReadOnlyFunctions([balanceArgs], 'get-balance');
  return Number(convertCVToValue(balance).value);
};

// get-principals-list
// args: (address principal)
// what does it do: ?
// return: ?
export const readOnlyGetPrincipalsList = async (principalAddress: any) => {
  const test = await ReadOnlyFunctions([], 'get-principals-list');
  console.log('TEST', test);
};

// get-k
// args: none
// what does it do: threshold for notifier votes
// return: number
export const readOnlyGetK = async () => {
  const test = await ReadOnlyFunctions([], 'get-k');
  console.log('TEST', test);
};

// get-notifier
// args: none
// what does it do: returns the current notifier
// return: address
export const readOnlyGetNotifier = async () => {
  const currentNotifier = await ReadOnlyFunctions([], 'get-notifier');
  return cvToJSON(currentNotifier).value;
};

// get-waiting-list
// args: none
// what does it do: returns a list of miners that are in waiting list
// return: waiting miners list
export const ReadOnlyGetWaitingList = async () => {
  const waitingList: ClarityValue = await ReadOnlyFunctions([], 'get-waiting-list');
  return waitingList;
};

// get-miners-list
// args: none
// what does it do: returns a list of miners that are in pool
// return: miners in pool list
export const ReadOnlyGetMinersList = async () => {
  const minersList = cvToJSON(await ReadOnlyFunctions([], 'get-miners-list'));
  return minersList;
};

// get-pending-accept-list
// args: none
// what does it do: returns the list of users that are pending
// return: list
export const readOnlyGetPendingAcceptList = async () => {
  const test = await ReadOnlyFunctions([], 'get-pending-accept-list');
  return test;
  console.log('TEST', test);
};

// get-notifier-vote-number
// args: (voted-notifier principal)
// what does it do: get the votes for a given notifier
// return: votes, number
export const readOnlyGetNotifierVoteNumber = async (votedNotifierPrincipal: any) => {
  const test = await ReadOnlyFunctions([], 'get-notifier-vote-number');
  console.log('TEST', test);
};

// get-max-voted-notifier
// args: none
// what does it do: get the notifier with the most votes
// return: address
export const readOnlyGetNotifierMaxVoted = async () => {
  const test = await ReadOnlyFunctions([], 'get-max-voted-notifier');
  console.log('TEST', test);
};

// get-max-votes-notifier
// args: none
// what does it do: get the votes of the most voted notifier
// return: votes, number
export const readOnlyGetMaxVotesNotifier = async () => {
  const test = await ReadOnlyFunctions([], 'get-max-votes-notifier');
  console.log('TEST', test);
};

// get-notifier-vote-status
// args: none
// what does it do: get if the notifier election process has started
// return: false or true, boolean
export const readOnlyGetNotifierVoteStatus = async () => {
  const test = await ReadOnlyFunctions([], 'get-notifier-vote-status');
  console.log('TEST', test);
};

// get-current-block
// args: none
// what does it do: get the current block height of the Stacks blockchain
// returns: current block
export const readOnlyGetCurrentBlock = async () => {
  const currentBlock = await ReadOnlyFunctions([], 'get-current-block');
  return cvToJSON(currentBlock).value.value;
};
