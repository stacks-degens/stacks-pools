import { networkType } from './network';

type ContractMapping = Record<
  networkType,
  {
    contractAddress: string;
    contractName: string;
    owner: string;
  }
>;

export const contractMapping: ContractMapping = {
  mainnet: {
    contractAddress: '', // TODO: complete when deployed
    contractName: '', // TODO: complete when deployed
    owner: '', // TODO: complete when deployed
  },
  testnet: {
    contractAddress: 'ST02D2KP0630FS1BCJ7YM4TYMDH6NS9QKR0B57R3',
    contractName: 'main-contract-5-blocks-v2',
    owner: 'ST02D2KP0630FS1BCJ7YM4TYMDH6NS9QKR0B57R3',
  },
  devnet: {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'main-contract-5-blocks',
    owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  },
};

interface IFunctionMapping {
  readOnlyFunctions: {
    getAddressStatus: string;
    getAllDataWaitingMiners: string;
    getProposedRemovalList: string;
    getAllDataMinersProposedForRemoval: string;
    getAllDataMinersPendingAccept: string;
    getAllDataMinersInPool: string;
    getRemainingBlocksUntilJoin: string;
    getDataNotifierElectionProcess: string;
    getAllDataNotifierVoterMiners: string;
    wasBlockClaimed: string;
    getBalance: string;
    getK: string;
    getNotifier: string;
    getWaitingList: string;
    getMinersList: string;
    getPendingAcceptList: string;
    getNotifierVoteNumber: string;
    getNotifierVoteStatus: string;
    getCurrentBlock: string;
    getCurrentExchange: string;
    getBlocksWon: string;
    getTotalRewardsDistributed: string;
    getAllDataTotalWithdrawals: string;
  };
  publicFunctions: {
    votePositiveJoinRequest: string;
    voteNegativeJoinRequest: string;
    tryEnterPool: string;
    askToJoin: string;
    depositStx: string;
    withdrawStx: string;
    rewardDistribution: string;
    addPendingMinersToPool: string;
    leavePool: string;
    proposeRemoval: string;
    votePositiveRemoveRequest: string;
    voteNegativeRemoveRequest: string;
    startVoteNotifier: string;
    endVoteNotifier: string;
    voteNotifier: string;
    warnMiner: string;
    setMyBtcAddress: string;
    setAutoExchange: string;
  };
}

export const functionMapping: IFunctionMapping = {
  readOnlyFunctions: {
    getAddressStatus: 'get-address-status',
    getAllDataWaitingMiners: 'get-all-data-waiting-miners',
    getProposedRemovalList: 'get-proposed-removal-list',
    getAllDataMinersProposedForRemoval: 'get-all-data-miners-proposed-for-removal',
    getAllDataMinersPendingAccept: 'get-all-data-miners-pending-accept',
    getAllDataMinersInPool: 'get-all-data-miners-in-pool',
    getRemainingBlocksUntilJoin: 'get-remaining-blocks-until-join',
    getDataNotifierElectionProcess: 'get-data-notifier-election-process',
    getAllDataNotifierVoterMiners: 'get-all-data-notifier-voter-miners',
    wasBlockClaimed: 'was-block-claimed',
    getBalance: 'get-balance',
    getK: 'get-k',
    getNotifier: 'get-notifier',
    getWaitingList: 'get-waiting-list',
    getMinersList: 'get-miners-list',
    getPendingAcceptList: 'get-pending-accept-list',
    getNotifierVoteNumber: 'get-notifier-vote-number',
    getNotifierVoteStatus: 'get-notifier-vote-status',
    getCurrentBlock: 'get-current-block',
    getCurrentExchange: 'get-auto-exchange',
    getBlocksWon: 'get-blocks-won',
    getTotalRewardsDistributed: 'get-total-rewards-distributed',
    getAllDataTotalWithdrawals: 'get-all-data-total-withdrawals',
  },
  publicFunctions: {
    votePositiveJoinRequest: 'vote-positive-join-request',
    voteNegativeJoinRequest: 'vote-negative-join-request',
    tryEnterPool: 'try-enter-pool',
    askToJoin: 'ask-to-join',
    depositStx: 'deposit-stx',
    withdrawStx: 'withdraw-stx',
    rewardDistribution: 'reward-distribution',
    addPendingMinersToPool: 'add-pending-miners-to-pool',
    leavePool: 'leave-pool',
    proposeRemoval: 'propose-removal',
    votePositiveRemoveRequest: 'vote-positive-remove-request',
    voteNegativeRemoveRequest: 'vote-negative-remove-request',
    startVoteNotifier: 'start-vote-notifier',
    endVoteNotifier: 'end-vote-notifier',
    voteNotifier: 'vote-notifier',
    warnMiner: 'warn-miner',
    setMyBtcAddress: 'set-my-btc-address',
    setAutoExchange: 'set-auto-exchange',
  },
};
