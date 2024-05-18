import { Cl, getAddressFromPrivateKey } from '@stacks/transactions';
import { NetworkType, privateKey } from './network';
import { poxAddressToTuple } from '@stacks/stacking';

type NetworkTypeMiningAndStacking = Record<
  NetworkType,
  {
    contractAddress: string;
    contractName: string;
    owner: string;
  }
>;
type ContractTypes = 'stacking' | 'pox';
type ContractMapping = Record<ContractTypes, NetworkTypeMiningAndStacking>;

export const contractMapping: ContractMapping = {
  // TODO: complete the rest
  stacking: {
    mainnet: {
      contractAddress: '',
      contractName: '',
      owner: '',
    },
    testnet: {
      contractAddress: '',
      contractName: '',
      owner: '',
    },
    devnet: {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'stacking-pool-test',
      owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    }, 
    nakamotoTestnet: {
      contractAddress: 'ST2D033K08AW2TPRTCFP3QD5VHZB7494TY0QXERJ1',
      contractName: 'stacking-pool-v1',
      owner: 'ST2D033K08AW2TPRTCFP3QD5VHZB7494TY0QXERJ1',
    },
  },
  pox: {
    mainnet: {
      contractAddress: '',
      contractName: '',
      owner: '',
    },
    testnet: {
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-4',
      owner: 'ST000000000000000000002AMW42H',
    },
    devnet: {
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-4',
      owner: 'ST000000000000000000002AMW42H',
    },
    nakamotoTestnet: {
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox-4',
      owner: 'ST000000000000000000002AMW42H',
    },
  },
};

interface IFunctionMapping {
  stacking: {
    readOnlyFunctions: {
      updatedBalancesGivenCycle: string;
      checkWonBlockRewardsBatch: string;
      checkClaimedBlocksRewardsBatch: string;
      // calculateExtraReservedFunds: string;
      // canWithdrawExtraReservedNow: string;
      isPreparePhaseNow: string;
      getPoxAddrIndices: string;
    };
    publicFunctions: {
      updateSCBalances: string;
      maybeStackAggregationCommit: string;
      batchRewardDistribution: string;
      // TODO: increase amount stacked when given threshold is met
      // unlockExtraReservedFunds: string; // if worthy, unlock extra amount
    };
  };
  pox: {
    readOnlyFunctions: {
      getPartialStackedByCycle: string;
      getStackingMinimum: string;
      getPoxInfo: string;
    };
    publicFunctions: {
      allowContractCaller: string;
      revokeDelegate: string;
      disallowContractCaller: string;
    };
  };
}

export const functionMapping: IFunctionMapping = {
  stacking: {
    readOnlyFunctions: {
      updatedBalancesGivenCycle: 'updated-balances-given-cycle',
      checkClaimedBlocksRewardsBatch: 'check-claimed-blocks-rewards-batch',
      checkWonBlockRewardsBatch: 'check-won-block-rewards-batch', // maximum 12 blocks
      isPreparePhaseNow: 'is-prepare-phase-now',
      // calculateExtraReservedFunds: 'calculate-extra-reserved-funds',
      // canWithdrawExtraReservedNow: 'can-withdraw-extra-reserved-now',
      getPoxAddrIndices: 'get-pox-addr-indices',
    },
    publicFunctions: {
      updateSCBalances: 'update-sc-balances',
      maybeStackAggregationCommit: 'maybe-stack-aggregation-commit',
      // unlockExtraReservedFunds: 'unlock-extra-reserved-funds',
      batchRewardDistribution: 'batch-reward-distribution',
    },
  },
  pox: {
    readOnlyFunctions: {
      getPartialStackedByCycle: 'get-partial-stacked-by-cycle',
      getStackingMinimum: 'get-stacking-minimum',
      getPoxInfo: 'get-pox-info',
    },
    publicFunctions: {
      allowContractCaller: 'allow-contract-caller',
      revokeDelegate: 'revoke-delegate-stx',
      disallowContractCaller: 'disallow-contract-caller',
    },
  },
};
