import './styles.css';
import { useState } from 'react';
import {
  ContractDepositSTXStacking,
  ContractReserveFundsFutureRewardsStacking,
  ContractSetNewBtcPoxAddress,
  ContractSetNewLiquidityProvider,
  ContractUnlockExtraReserveFundsStacking,
} from '../../../consts/smartContractFunctions';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { Alert } from '@mui/material';

interface IActionsContainerStackingProps {
  userAddress: string | null;
}

const ActionsContainerProviderStacking = ({ userAddress }: IActionsContainerStackingProps) => {
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const [lockInPoolAmountInput, setLockInPoolAmountInput] = useState<number | null>(null);
  const [newLiquidityProvider, setNewLiquidityProvider] = useState<string | null>(null);
  const [newPoolPoxAddressPubKey, setNewPoolPoxAddressPubKey] = useState<string | null>(null);
  const [invalidNewProviderAddress, setInvalidNewProviderAddress] = useState<boolean>(false);
  const [invalidNewProviderAlertOpen, setInvalidNewProviderAlertOpen] = useState<boolean>(false);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

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
        console.log('you need to input more');
      } else {
        console.log(depositAmountInput);
        if (userAddress !== null) {
          ContractDepositSTXStacking(depositAmountInput, userAddress);
        }
      }
    }
  };

  const lockInPool = () => {
    if (lockInPoolAmountInput !== null && !isNaN(lockInPoolAmountInput)) {
      if (lockInPoolAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        console.log(lockInPoolAmountInput);
        if (userAddress !== null) {
          ContractReserveFundsFutureRewardsStacking(lockInPoolAmountInput, userAddress);
        }
      }
    }
  };

  const unlockExtraStx = () => {
    ContractUnlockExtraReserveFundsStacking();
  };

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
                console.log('deposit input', inputAmount);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
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
                console.log('lock in pool input', inputAmount);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              lockInPool();
            }}
          >
            Lock in pool
          </button>
        </div>
      </div>
      <div className="content-sections-title-info-container leave-pool-button-action-container-stacking">
        <div className="flex-right">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              unlockExtraStx();
            }}
          >
            Unlock extra STX locked
          </button>
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
              placeholder="0 versioned (legacy P2PKH) btc address' public key"
              onChange={(e) => {
                console.log(e);
                setNewPoolPoxAddressPubKey(e.target.value);
              }}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              console.log(newPoolPoxAddressPubKey);
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
