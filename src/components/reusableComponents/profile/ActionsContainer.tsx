import './styles.css';
import colors from '../../../consts/colorPallete';
import { useEffect, useState } from 'react';
import {
  ContractWithdrawSTX,
  ContractLeavePool,
  ContractDepositSTX,
  ContractRewardDistribution,
  ContractChangeBtcAddress,
} from '../../../consts/smartContractFunctions';
import { readOnlyClaimedBlockStatus, readOnlyGetAllTotalWithdrawals } from '../../../consts/readOnly';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme, selectUserSessionState } from '../../../redux/reducers/user-state';
import { Alert } from '@mui/material';
import { ElectricBolt } from '@mui/icons-material';

interface IActionsContainerProps {
  currentNotifier: string | null;
  userAddress: string | null;
}

const ActionsContainer = ({ currentNotifier, userAddress }: IActionsContainerProps) => {
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | null>(null);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);
  const [showAlertLeavePool, setShowAlertLeavePool] = useState<boolean>(false);
  const [leavePoolButtonClicked, setLeavePoolButtonClicked] = useState<boolean>(false);
  const [disableLeavePoolButton, setDisableLeavePoolButton] = useState<boolean>(false);
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const [claimRewardsInputAmount, setClaimRewardsInputAmount] = useState<number | null>(null);
  const [btcAddress, setBtcAddress] = useState<string>('');
  const userSession = useAppSelector(selectUserSessionState);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const changeBtcAddress = () => {
    if (btcAddress !== '') {
      ContractChangeBtcAddress(btcAddress);
    }
  };

  const claimRewards = async () => {
    if (claimRewardsInputAmount !== null) {
      const wasBlockClaimed = await readOnlyClaimedBlockStatus(claimRewardsInputAmount);
      if (wasBlockClaimed === false) {
        ContractRewardDistribution(claimRewardsInputAmount);
      } else {
        alert('Block already claimed');
      }
    }
  };

  const withdrawAmount = () => {
    if (withdrawAmountInput !== null && !isNaN(withdrawAmountInput)) {
      if (withdrawAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        ContractWithdrawSTX(withdrawAmountInput);
      }
    }
  };

  const depositAmount = () => {
    if (depositAmountInput !== null && !isNaN(depositAmountInput)) {
      if (depositAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        console.log(depositAmountInput);
        if (userAddress !== null) ContractDepositSTX(depositAmountInput, userAddress);
      }
    }
  };

  const leavePool = () => {
    setLeavePoolButtonClicked(true);
    if (currentNotifier !== null && currentNotifier !== userAddress) {
      ContractLeavePool();
    } else if (currentNotifier !== null && currentNotifier === userAddress) {
      console.log("you art the notifier, you can't leave pool");

      setShowAlertLeavePool(true);
      setDisableLeavePoolButton(true);
    }
  };

  useEffect(() => {
    const getUserTotalWithdrawls = async () => {
      const principalAddress = userSession.loadUserData().profile.stxAddress.testnet;
      const getTotalWithdrawals = await readOnlyGetAllTotalWithdrawals(principalAddress);
      setTotalWithdrawals(getTotalWithdrawals);
    };

    getUserTotalWithdrawls();
  }, [totalWithdrawals]);

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
              <label className="custom-label">Insert stacks block height to be claimed</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseInt(inputAmount);
                    setClaimRewardsInputAmount(inputAmountToInt);
                    console.log('claim rewards input', inputAmount);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={() => {
                  claimRewards();
                }}
              >
                Claim rewards
              </button>
            </div>
          </div>
          <div className="flex-container align-items-center input-line-actions-container">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert your new btc address</label>
              <div className="bottom-margins">
                <input className="custom-input" type="text" onChange={(e) => setBtcAddress(e.target.value)}></input>
              </div>
            </div>
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={changeBtcAddress}
              >
                Change address
              </button>
            </div>
          </div>
          <div className="flex-container align-items-center input-line-actions-container">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert STX amount</label>
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
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={depositAmount}
              >
                Deposit
              </button>
            </div>
          </div>
          <div className="flex-container align-items-center input-line-actions-container">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert STX amount</label>
              <div className="bottom-margins">
                <input
                  className="custom-input width-100"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseFloat(inputAmount);
                    setWithdrawAmountInput(inputAmountToInt);
                    console.log('withdraw input', inputAmount);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-action-container">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={withdrawAmount}
              >
                Withdraw
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
              You are currently the notifier and you can not leave pool. Only a simple miner can leave the pool.
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

export default ActionsContainer;
