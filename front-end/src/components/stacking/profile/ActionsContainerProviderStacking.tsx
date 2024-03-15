import './styles.css';
import { useEffect, useState } from 'react';
import {
  ContractDepositSTXStacking,
  ContractReserveFundsFutureRewardsStacking,
  ContractSetNewBtcPoxAddress,
  ContractSetNewLiquidityProvider,
  ContractUnlockExtraReserveFundsStacking,
  ContractWithdrawSTXStacking,
} from '../../../consts/smartContractFunctions';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { Alert } from '@mui/material';
import MouseOverPopover from './MouseOverPopover';
import { network } from '../../../consts/network';
import {
  readOnlyGetMinimumDepositLiquidityProviderStacking,
  readOnlyGetSCOwnedBalance,
} from '../../../consts/readOnly';
import { convertDigits } from '../../../consts/converter';

interface IActionsContainerStackingProps {
  userAddress: string | null;
  currentBurnBlockHeight: number;
  currentCycle: number;
  preparePhaseStartBlockHeight: number;
  rewardPhaseStartBlockHeight: number;
}

const ActionsContainerProviderStacking = ({
  userAddress,
  currentBurnBlockHeight,
  currentCycle,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: IActionsContainerStackingProps) => {
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | null>(null);
  const [lockInPoolAmountInput, setLockInPoolAmountInput] = useState<number | null>(null);
  const [newLiquidityProvider, setNewLiquidityProvider] = useState<string | null>(null);
  const [newPoolPoxAddressPubKey, setNewPoolPoxAddressPubKey] = useState<string | null>(null);
  const [invalidNewProviderAddress, setInvalidNewProviderAddress] = useState<boolean>(false);
  const [invalidNewProviderAlertOpen, setInvalidNewProviderAlertOpen] = useState<boolean>(false);
  const [minimumDepositProvider, setMinimumDepositProvider] = useState<number | null>(null);
  const [ownedBalance, setOwnedBalance] = useState<number | null>(null);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const numberOfBlocksPreparePhase = (preparePhaseStartBlockHeight - rewardPhaseStartBlockHeight) / 20;
  const numberOfBlocksRewardPhase = numberOfBlocksPreparePhase * 20;
  const numberOfBlocksPerCycle = numberOfBlocksPreparePhase + numberOfBlocksRewardPhase;
  const unlockNumberOfBlocks = network === 'mainnet' ? 750 : 225;

  let messageReserve = '';
  if (ownedBalance !== null && minimumDepositProvider !== null) {
    if (!ownedBalance) {
      messageReserve = 'To reserve a given amount first you have to deposit it.';
    } else if (ownedBalance < minimumDepositProvider) {
      messageReserve = `You have to deposit ${
        minimumDepositProvider - ownedBalance
      } STX more in order to succesfully call the reserve function.`;
    } else {
      messageReserve = `You have deposited and can reserve up to ${ownedBalance}. The minimum amount for the tx to pass is ${minimumDepositProvider}`;
    }
  }

  let messageUnlock = '';
  let canCallUpdateBalances = false;
  // is in the first x blocks in reward phase
  if (currentBurnBlockHeight < rewardPhaseStartBlockHeight + unlockNumberOfBlocks) {
    const remaining = rewardPhaseStartBlockHeight + unlockNumberOfBlocks - currentBurnBlockHeight;
    messageUnlock = `Remaining blocks to unlock extra-locked liquidity for cycle: ${currentCycle}: ${remaining} blocks`;
    canCallUpdateBalances = true;
  } else {
    const remaining = rewardPhaseStartBlockHeight + numberOfBlocksPerCycle - currentBurnBlockHeight;
    messageUnlock = `You can call start calling unlock-extra-liqudity in ${remaining} blocks. It can be called for the next ${unlockNumberOfBlocks} blocks.`;
    canCallUpdateBalances = false;
  }

  let messageDeposit = `The deposit function is the first step to ensure the rewards for the pool. The amount deposited can then be reserved. For a smooth experience, deposit the required locked amount in one tx: ${minimumDepositProvider}.`;
  let messageWithdraw = `You have ${ownedBalance} STX that can be withdrawn from the smart contract.`;

  const handleUpdateLiquidityProvider = () => {
    if (newLiquidityProvider !== null) {
      try {
        ContractSetNewLiquidityProvider(newLiquidityProvider);
      } catch (e) {
        console.log(e);
        if (e instanceof Error && e.message.includes('Invalid c32 address')) {
          setInvalidNewProviderAddress(true);
          setInvalidNewProviderAlertOpen(true);
        }
      }
      // document.getElementById('inputNewLiqProv').value = null;
      const element = document.getElementById('inputNewLiqProv') as HTMLInputElement;
      if (element !== null) {
        element.value = '';
      }
    }
  };

  const depositAmount = () => {
    if (depositAmountInput !== null && !isNaN(depositAmountInput)) {
      if (depositAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        if (userAddress !== null) {
          ContractDepositSTXStacking(depositAmountInput, userAddress);
        }
      }
    }
  };

  const withdrawAmount = () => {
    if (withdrawAmountInput !== null && !isNaN(withdrawAmountInput)) {
      if (withdrawAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        if (userAddress !== null) {
          ContractWithdrawSTXStacking(withdrawAmountInput, userAddress);
        }
      }
    }
  };

  const lockInPool = () => {
    if (lockInPoolAmountInput !== null && !isNaN(lockInPoolAmountInput)) {
      if (lockInPoolAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        if (userAddress !== null) {
          ContractReserveFundsFutureRewardsStacking(lockInPoolAmountInput, userAddress);
        }
      }
    }
  };

  const unlockExtraStx = () => {
    ContractUnlockExtraReserveFundsStacking();
  };

  useEffect(() => {
    const getSCOwnedBalance = async () => {
      const stacks = await readOnlyGetSCOwnedBalance();
      setOwnedBalance(convertDigits(stacks));
    };
    getSCOwnedBalance();
  }, [ownedBalance]);

  useEffect(() => {
    const getMinimumDepositProvider = async () => {
      if (userAddress) {
        const minimum = await readOnlyGetMinimumDepositLiquidityProviderStacking();
        setMinimumDepositProvider(convertDigits(minimum));
      }
    };

    getMinimumDepositProvider();
  }, [userAddress]);

  return (
    <div>
      <div className="flex-container align-items-center input-line-actions-container-stacking">
        <div className="width-55 label-and-input-container-actions-container">
          <label className="custom-label">Insert amount of STX</label>
          <div className="bottom-margins">
            <input
              className="custom-input"
              type="number"
              onChange={(e) => {
                const inputAmount = e.target.value;
                const inputAmountToInt = parseFloat(inputAmount);
                setDepositAmountInput(inputAmountToInt);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
              <MouseOverPopover severityType="info" text={messageDeposit} />
            </span>
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={() => {
                depositAmount();
              }}
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      <div className="flex-container align-items-center input-line-actions-container-stacking">
        <div className="width-55 label-and-input-container-actions-container">
          <label className="custom-label">Insert amount of STX</label>
          <div className="bottom-margins">
            <input
              className="custom-input"
              type="number"
              onChange={(e) => {
                const inputAmount = e.target.value;
                const inputAmountToInt = parseFloat(inputAmount);
                setWithdrawAmountInput(inputAmountToInt);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
              <MouseOverPopover severityType="info" text={messageWithdraw} />
            </span>
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={() => {
                withdrawAmount();
              }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="flex-container align-items-center input-line-actions-container-stacking">
        <div className="width-55 label-and-input-container-actions-container">
          <label className="custom-label">Insert amount of STX</label>
          <div className="bottom-margins">
            <input
              className="custom-input"
              type="number"
              onChange={(e) => {
                const inputAmount = e.target.value;
                const inputAmountToInt = parseFloat(inputAmount);
                setLockInPoolAmountInput(inputAmountToInt);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
              <MouseOverPopover severityType="info" text={messageReserve} />
            </span>

            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={() => {
                lockInPool();
              }}
            >
              Reserve in pool
            </button>
          </div>
        </div>
      </div>

      <div className="content-sections-title-info-container leave-pool-button-action-container-stacking">
        <div className="flex-right">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
              <MouseOverPopover severityType="info" text={messageUnlock} />
            </span>
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={() => {
                unlockExtraStx();
              }}
              disabled={!canCallUpdateBalances}
            >
              Unlock extra STX reserved
            </button>
          </div>
        </div>
      </div>

      {invalidNewProviderAddress && invalidNewProviderAlertOpen && (
        <Alert
          severity="warning"
          onClose={() => {
            setInvalidNewProviderAlertOpen(false);
          }}
        >
          Please insert a valid STX address
        </Alert>
      )}
      <div className="flex-container align-items-center input-line-actions-container-stacking">
        <div className="width-55 label-and-input-container-actions-container">
          <label className="custom-label">Insert new Provider STX Address</label>
          <div className="bottom-margins">
            <input
              id="inputNewLiqProv"
              className="custom-input"
              type="text"
              onChange={(e) => {
                setNewLiquidityProvider(e.target.value);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              handleUpdateLiquidityProvider();
            }}
          >
            Set new provider
          </button>
        </div>
      </div>
      <div className="flex-container align-items-center input-line-actions-container-stacking">
        <div className="width-55 label-and-input-container-actions-container">
          <label className="custom-label">Insert the new Pool's PoX address' public key</label>
          <div className="bottom-margins">
            <input
              className="custom-input"
              type="text"
              placeholder="BTC Address P2PKH, P2SH, P2PWK Format Supported"
              onChange={(e) => {
                setNewPoolPoxAddressPubKey(e.target.value);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              if (newPoolPoxAddressPubKey !== null) ContractSetNewBtcPoxAddress(newPoolPoxAddressPubKey);
            }}
          >
            Set btc address pox rewards
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionsContainerProviderStacking;
