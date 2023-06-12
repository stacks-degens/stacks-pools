import './styles.css';
import colors from '../../../consts/colorPallete';
import { useEffect, useState } from 'react';
import { ContractDelegateSTXStacking, ContractLeavePoolStacking } from '../../../consts/smartContractFunctions';
import { readOnlyGetLiquidityProvider } from '../../../consts/readOnly';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme, selectUserSessionState } from '../../../redux/reducers/user-state';
import { Alert } from '@mui/material';
import { ElectricBolt } from '@mui/icons-material';

interface IActionsContainerStackingProps {
  userAddress: string | null;
}

const ActionsContainerStacking = ({ userAddress }: IActionsContainerStackingProps) => {
  // const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | null>(null);
  // const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);
  const [showAlertLeavePool, setShowAlertLeavePool] = useState<boolean>(false);
  const [leavePoolButtonClicked, setLeavePoolButtonClicked] = useState<boolean>(false);
  const [disableLeavePoolButton, setDisableLeavePoolButton] = useState<boolean>(false);
  const [delegateAmountInput, setDelegateAmountInput] = useState<number | null>(null);
  const [extendDelegateAmountInput, setExtendDelegateAmountInput] = useState<number | null>(null);
  const [claimRewardsInputAmount, setClaimRewardsInputAmount] = useState<number | null>(null);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const claimRewards = async () => {
    // if (claimRewardsInputAmount !== null) {
    //   const wasBlockClaimed = await readOnlyClaimedBlockStatusMining(claimRewardsInputAmount);
    //   if (wasBlockClaimed === false) {
    //     ContractRewardDistributionMining(claimRewardsInputAmount);
    //   } else {
    //     alert('Block already claimed');
    //   }
    // }
  };

  // const withdrawAmount = () => {
  //   if (withdrawAmountInput !== null && !isNaN(withdrawAmountInput)) {
  //     if (withdrawAmountInput < 0.000001) {
  //       alert('You need to input more');
  //     } else {
  //       ContractWithdrawSTXMining(withdrawAmountInput);
  //     }
  //   }
  // };

  const delegateAmount = () => {
    if (delegateAmountInput !== null && !isNaN(delegateAmountInput)) {
      if (delegateAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        console.log(delegateAmountInput);
        if (userAddress !== null) {
          ContractDelegateSTXStacking(delegateAmountInput);
        }
      }
    }
  };

  const extendDelegateAmount = () => {
    if (extendDelegateAmountInput !== null && !isNaN(extendDelegateAmountInput)) {
      if (extendDelegateAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        console.log(extendDelegateAmountInput);
        if (userAddress !== null) {
          // ContractExtendDelegate(depositAmountInput, userAddress);
        }
      }
    }
  };

  useEffect(() => {
    const getCurrentLiquidityProvider = async () => {
      const liquidityProvider = await readOnlyGetLiquidityProvider();
      setCurrentLiquidityProvider(liquidityProvider);
    };

    getCurrentLiquidityProvider();
  }, [currentLiquidityProvider]);

  const leavePool = () => {
    setLeavePoolButtonClicked(true);
    if (currentLiquidityProvider !== null && currentLiquidityProvider !== userAddress) {
      console.log('test');
      ContractLeavePoolStacking();
    } else if (currentLiquidityProvider !== null && currentLiquidityProvider === userAddress) {
      console.log("you art the provider, you can't leave pool");

      setShowAlertLeavePool(true);
      setDisableLeavePoolButton(true);
    }
  };

  // useEffect(() => {
  //   const getUserTotalWithdrawls = async () => {
  //     const principalAddress = userSession.loadUserData().profile.stxAddress.testnet;
  //     const getTotalWithdrawals = await readOnlyGetAllTotalWithdrawalsMining(principalAddress);
  //     setTotalWithdrawals(getTotalWithdrawals);
  //   };

  //   getUserTotalWithdrawls();
  // }, [totalWithdrawals]);

  useEffect(() => {
    if (leavePoolButtonClicked && showAlertLeavePool) setDisableLeavePoolButton(true);
  }, [leavePoolButtonClicked, showAlertLeavePool]);

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-profile-page actions-container-profile-page"
    >
      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
            <ElectricBolt className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container bold-font">ACTIONS</div>
        </div>
      </div>

      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container justify-content-between"
      >
        <div>
          <div className="flex-container align-items-center input-line-actions-container">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert amount of STX to delegate</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseInt(inputAmount);
                    setDelegateAmountInput(inputAmountToInt);
                    console.log('delegate input', inputAmount);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={() => {
                  delegateAmount();
                }}
              >
                Delegate
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
                // onClick={leavePool}

                disabled={disableLeavePoolButton}
              >
                Revoke delegate
              </button>
            </div>
          </div>
          <div className="flex-container align-items-center input-line-actions-container">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert amount of STX</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseFloat(inputAmount);
                    setExtendDelegateAmountInput(inputAmountToInt);
                    console.log('extend deposit input', inputAmount);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={extendDelegateAmount}
              >
                Extend delegate
              </button>
            </div>
          </div>
          <div className="flex-container align-items-center input-line-actions-container">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert block height</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseFloat(inputAmount);
                    setClaimRewardsInputAmount(inputAmountToInt);
                    console.log('claim rewards input', inputAmount);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={claimRewards}
              >
                Claim rewards
              </button>
            </div>
          </div>
        </div>
        {leavePoolButtonClicked && showAlertLeavePool && (
          <div className="block-margins-auto alert-container-actions-container">
            <Alert
              severity="warning"
              onClose={() => {
                setLeavePoolButtonClicked(false);
                setShowAlertLeavePool(false);
                setDisableLeavePoolButton(false);
              }}
            >
              You are currently the provider and you can not leave pool. Only a simple stacker can leave the pool.
            </Alert>
          </div>
        )}

        <div className="content-sections-title-info-container leave-pool-button-action-container">
          <div className="flex-right">
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={leavePool}
              disabled={disableLeavePoolButton}
            >
              Leave Pool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionsContainerStacking;
