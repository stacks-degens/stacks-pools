import './styles.css';
import { useEffect, useState } from 'react';
import {
  ContractDepositSTXStacking,
  ContractReserveFundsFutureRewardsStacking,
  ContractSetNewBtcPoxAddress,
  ContractSetNewLiquidityProvider,
  ContractUnlockExtraReserveFundsStacking,
} from '../../../consts/smartContractFunctions';
import { readOnlyGetLiquidityProvider } from '../../../consts/readOnly';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

interface IActionsContainerStackingProps {
  userAddress: string | null;
}

const ActionsContainerProviderStacking = ({ userAddress }: IActionsContainerStackingProps) => {
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const [lockInPoolAmountInput, setLockInPoolAmountInput] = useState<number | null>(null);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [newPoolPoxAddressPubKey, setNewPoolPoxAddressPubKey] = useState<string | null>(null);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

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

  useEffect(() => {
    const getCurrentLiquidityProvider = async () => {
      const liquidityProvider = await readOnlyGetLiquidityProvider();
      setCurrentLiquidityProvider(liquidityProvider);
    };

    getCurrentLiquidityProvider();
  }, [currentLiquidityProvider]);

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
      <div
        id="revoke-delegate-button"
        className="content-sections-title-info-container leave-pool-button-action-container"
      >
        <div className="flex-center">
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
      <div className="flex-container align-items-center input-line-actions-container-stacking">
        <div className="width-55 label-and-input-container-actions-container">
          <label className="custom-label">Insert your new btc address</label>
          <div className="bottom-margins">
            <input
              className="custom-input"
              type="text"
              onChange={(e) => setCurrentLiquidityProvider(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="button-container-stacking-action-container-stacking">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              if (currentLiquidityProvider !== null) ContractSetNewLiquidityProvider(currentLiquidityProvider);
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
