import { networkType } from './network';

// type ContractMapping = Record<
//   networkType,
//   {
//     contractAddress: string;
//     contractName: string;
//     owner: string;
//   }
// >;

type NetworkTypeMiningAndStacking = Record<
  networkType,
  {
    contractAddress: string;
    contractName: string;
    owner: string;
  }
>;
type contractTypes = 'mining' | 'stacking' | 'pox';
type ContractMapping = Record<contractTypes, NetworkTypeMiningAndStacking>;

export const contractMapping: ContractMapping = {
  mining: {
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
      contractName: 'mining-pool-5-blocks',
      owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    },
  },

  stacking: {
    mainnet: {
      contractAddress: 'SP02D2KP0630FS1BCJ7YM4TYMDH6NS9QKTNCZR00',
      contractName: 'stacking-pool',
      owner: 'SP02D2KP0630FS1BCJ7YM4TYMDH6NS9QKTNCZR00',
    },
    testnet: {
      contractAddress: 'ST02D2KP0630FS1BCJ7YM4TYMDH6NS9QKR0B57R3',
      contractName: 'stacking-pool',
      owner: 'ST02D2KP0630FS1BCJ7YM4TYMDH6NS9QKR0B57R3',
    },
    devnet: {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'stacking-pool',
      owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    },
  },
  pox: {
    mainnet: {
      contractAddress: 'SP000000000000000000002Q6VF78',
      contractName: 'pox-3',
      owner: 'SP000000000000000000002Q6VF78',
    },
    testnet: {
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-3',
      owner: 'ST000000000000000000002AMW42H',
    },
    devnet: {
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-3',
      owner: 'ST000000000000000000002AMW42H',
    },
  },
};

interface IFunctionMapping {
  mining: {
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
  };
  stacking: {
    readOnlyFunctions: {
      getLiquidityProvider: string;
      getStackersList: string;
      getBlocksRewarded: string;
      getBitcoinRewards: string;
      getTotalStackedThisCycle: string;
      getAddressStatus: string;
      wasBlockClaimed: string;
      getReturnCovered: string;
      getMinimumDeposit: string;
      getUserData: string;
    };
    publicFunctions: {
      delegateStx: string;
      delegateStackStxMany: string;
      leavePool: string;
      rewardDistribution: string;
      depositStx: string;
      setLiquidityProvider: string;
      lockInPool: string;
      unlockExtraStxInPool: string;
      tryEnterPool: string;
      updateScBalances: string;
      setPoolPoxAddress: string;
    };
  };
  pox: {
    readOnlyFunctions: {
      getAllowanceStatus: string;
    };
    publicFunctions: {
      allowContractCaller: string;
      revokeDelegate: string;
      disallowContractCaller: string;
    };
  };
}

export const functionMapping: IFunctionMapping = {
  mining: {
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
  },
  stacking: {
    readOnlyFunctions: {
      getLiquidityProvider: 'get-liquidity-provider',
      getStackersList: 'get-pool-members',
      getBlocksRewarded: 'get-blocks-rewarded',
      getBitcoinRewards: 'get-amount-rewarded',
      getTotalStackedThisCycle: 'get-stacked-this-cycle',
      getAddressStatus: 'get-address-status',
      wasBlockClaimed: 'was-block-claimed',
      getReturnCovered: 'get-return',
      getMinimumDeposit: 'get-minimum-deposit-liquidity-provider',
      getUserData: 'get-user-data',
    },
    publicFunctions: {
      delegateStx: 'delegate-stx',
      delegateStackStxMany: 'delegate-stack-stx-many',
      leavePool: 'leave-pool',
      rewardDistribution: 'reward-distribution',
      depositStx: 'deposit-stx-liquidity-provider',
      setLiquidityProvider: 'set-liquidity-provider',
      lockInPool: 'reserve-funds-future-rewards',
      unlockExtraStxInPool: 'unlock-extra-reserved-funds',
      tryEnterPool: 'join-stacking-pool',
      updateScBalances: 'update-sc-balances',
      setPoolPoxAddress: 'set-pool-pox-address',
    },
  },
  pox: {
    readOnlyFunctions: {
      getAllowanceStatus: 'get-allowance-contract-callers',
    },
    publicFunctions: {
      allowContractCaller: 'allow-contract-caller',
      revokeDelegate: 'revoke-delegate-stx',
      disallowContractCaller: 'disallow-contract-caller',
    },
  },
};
