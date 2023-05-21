import { StacksMocknet, StacksMainnet, StacksTestnet } from '@stacks/network';
import { network } from './network';
import { contractMapping, functionMapping } from './contract';
import { callReadOnlyFunction, ClarityValue, ListCV, listCV, cvToJSON, uintCV } from '@stacks/transactions';
import { convertPrincipalToArg, convertPrincipalToList, fromResultToList, convertCVToValue } from './converter';
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
  const statusArgs = convertPrincipalToArg(args);

  const status = await ReadOnlyFunctions([statusArgs], functionMapping.readOnlyFunctions.getAddressStatus);

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
      [newWaitingList],
      functionMapping.readOnlyFunctions.getAllDataWaitingMiners
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

export const ReadOnlyGetProposedRemovalList = async () => {
  const removalList: ClarityValue = await ReadOnlyFunctions(
    [],
    functionMapping.readOnlyFunctions.getProposedRemovalList
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
  const newResultList: RemovalsListProps[] = [];
  const newAddressList: { value: { type: string; value: string }[] }[] = [];
  const fullRemovalsList: ClarityValue = await ReadOnlyGetProposedRemovalList();
  const step = 1;

  for (
    let currentIndex = 0;
    currentIndex < (fullRemovalsList as ListCV).list.length;
    currentIndex = currentIndex + step
  ) {
    const newRemovalsList = fromResultToList(fullRemovalsList, currentIndex, currentIndex + step);
    const newResult = await ReadOnlyFunctions(
      [newRemovalsList],
      functionMapping.readOnlyFunctions.getAllDataMinersProposedForRemoval
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
      [newWaitingList],
      functionMapping.readOnlyFunctions.getAllDataMinersPendingAccept
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
  const convertedArgs = [convertPrincipalToList(address)];
  const minerData = await ReadOnlyFunctions(convertedArgs, functionMapping.readOnlyFunctions.getAllDataMinersInPool);
  const withdraws = await readOnlyGetAllTotalWithdrawals(address);
  const rawBalance = await readOnlyGetBalance(address);

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

export const readOnlyGetRemainingBlocksJoin = async () => {
  const blocksLeft = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getRemainingBlocksUntilJoin);
  return Number(convertCVToValue(blocksLeft));
};

// get-data-notifier-election-process
// args: none
// what does it do: returns notifier voting status and the blocks remaining until the end
// return: vote status of the notifier, election blocks remaining

export const readOnlyGetNotifierElectionProcessData = async () => {
  const notifierData = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getDataNotifierElectionProcess);
  return cvToJSON(notifierData).value;
};

// get-all-data-notifier-voter-miners
// args: (voter-miners-list (list 100 principal))
// what does it do: returns the miner and which notifier it voted for each miner
// return: address, notifier which the users in arg list voted for

export const readOnlyGetAllDataNotifierVoterMiners = async (voterMinersList: ClarityValue) => {
  const votedNotifier = await ReadOnlyFunctions(
    [voterMinersList],
    functionMapping.readOnlyFunctions.getAllDataNotifierVoterMiners
  );
  return cvToJSON(votedNotifier).value[0].value.value === '133'
    ? "You haven't voted yet!"
    : cvToJSON(votedNotifier).value[0].value.value['voted-notifier'].value;
};

// was-block-claimed
// args: (given-block-height uint)
// what does it do: true/false if rewards on the block were claimed
// return: true or false

export const readOnlyClaimedBlockStatus = async (blockHeight: number) => {
  const convertedArgs = [uintCV(blockHeight)];
  const blockStatus = await ReadOnlyFunctions(convertedArgs, functionMapping.readOnlyFunctions.wasBlockClaimed);
  return cvToJSON(blockStatus).value;
};

// get-balance
// args: (address principal)
// what does it do: returns balance for given address
// return: balance

export const readOnlyGetBalance = async (principalAddress: string) => {
  const balanceArgs = convertPrincipalToArg(principalAddress);
  const balance = await ReadOnlyFunctions([balanceArgs], functionMapping.readOnlyFunctions.getBalance);
  return cvToJSON(balance).value !== null ? Number(cvToJSON(balance).value.value) : 0;
};

// get-k
// args: none
// what does it do: threshold for notifier votes
// return: number

export const readOnlyGetK = async () => {
  const k = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getK);
  return Number(cvToJSON(k).value);
};

// get-notifier
// args: none
// what does it do: returns the current notifier
// return: address

export const readOnlyGetNotifier = async () => {
  const currentNotifier = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getNotifier);
  return cvToJSON(currentNotifier).value;
};

// get-waiting-list
// args: none
// what does it do: returns a list of miners that are in waiting list
// return: waiting miners list

export const ReadOnlyGetWaitingList = async () => {
  const waitingList: ClarityValue = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getWaitingList);
  return waitingList;
};

// get-miners-list
// args: none
// what does it do: returns a list of miners that are in pool
// return: miners in pool list

export const ReadOnlyGetMinersList = async () => {
  const minersList = cvToJSON(await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getMinersList));
  return minersList;
};

// get-pending-accept-list
// args: none
// what does it do: returns the list of users that are pending
// return: list

export const readOnlyGetPendingAcceptList = async () => {
  const pendingAccept = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getPendingAcceptList);
  return pendingAccept;
};

// get-notifier-vote-number
// args: (voted-notifier principal)
// what does it do: get the votes for a given notifier
// return: votes, number

export const readOnlyGetNotifierVoteNumber = async (address: string) => {
  const principal = [convertPrincipalToArg(address)];
  const votes = await ReadOnlyFunctions(principal, functionMapping.readOnlyFunctions.getNotifierVoteNumber);
  return cvToJSON(votes).value === null ? 0 : Number(cvToJSON(votes).value.value);
};

// get-notifier-vote-status
// args: none
// what does it do: get if the notifier election process has started
// return: false or true, boolean

export const readOnlyGetNotifierVoteStatus = async () => {
  const notifierVoteStatus = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getNotifierVoteStatus);
  return notifierVoteStatus;
};

// get-current-block
// args: none
// what does it do: get the current block height of the Stacks blockchain
// returns: current block

export const readOnlyGetCurrentBlock = async () => {
  const currentBlock = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getCurrentBlock);
  return cvToJSON(currentBlock).value.value;
};

// get-auto-exchange
// args: (address principal)
// what does it do: get the state of auto-exchange function
// returns: boolean

export const readOnlyExchangeToggle = async (args: string) => {
  const exchangeArgs = convertPrincipalToArg(args);
  const exchange = await ReadOnlyFunctions([exchangeArgs], functionMapping.readOnlyFunctions.getCurrentExchange);

  return cvToJSON(exchange).value === null ? cvToJSON(exchange).value : cvToJSON(exchange).value.value.value.value;
};

// get-blocks-won
// args: none
// what does it do: number of blocks won
// returns: number

export const readOnlyGetBlocksWon = async () => {
  const wonBlocks = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getBlocksWon);
  return cvToJSON(wonBlocks).value;
};

//get-total-rewards-distributed
// args: none
// what does it do: stacks rewards
// returns: number

export const readOnlyGetStacksRewards = async () => {
  const stacksRewards = await ReadOnlyFunctions([], functionMapping.readOnlyFunctions.getTotalRewardsDistributed);
  return cvToJSON(stacksRewards).value;
};

// get-all-data-total-withdrawals
// args: list of addresses
// what does it do: gets how much each address in the list has withdrawn from the sc
// returns: number, amount

export const readOnlyGetAllTotalWithdrawals = async (address: string) => {
  const convertedArgs: ClarityValue = listCV([convertPrincipalToArg(address)]);
  const totalWithdrawals = await ReadOnlyFunctions(
    [convertedArgs],
    functionMapping.readOnlyFunctions.getAllDataTotalWithdrawals
  );

  return cvToJSON(totalWithdrawals).value[0].value.value;
};
