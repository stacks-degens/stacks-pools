import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import {
  readOnlyExchangeToggle,
  readOnlyGetBalance,
  readOnlyGetNotifier,
  readOnlyGetAllTotalWithdrawals,
} from '../../../consts/readOnly';
import { selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import '../style.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Alert, Box, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  ContractChangeBtcAddress,
  ContractClaimRewardsForBlock,
  ContractDepositSTX,
  ContractLeavePool,
  ContractWithdrawSTX,
  ContractSetAutoExchange,
} from '../../../consts/smartContractFunctions';

const MinerProfile = () => {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const { currentTheme } = useCurrentTheme();
  const currentRole = useAppSelector(selectCurrentUserRole);
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | null>(null);
  const [exchange, setExchange] = useState<boolean | null>(false);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [showAlertLeavePool, setShowAlertLeavePool] = useState<boolean>(false);
  const [leavePoolButtonClicked, setLeavePoolButtonClicked] = useState<boolean>(false);
  const [disableLeavePoolButton, setDisableLeavePoolButton] = useState<boolean>(false);
  const [claimRewardsInputAmount, setClaimRewardsInputAmount] = useState<number | null>(null);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);
  const [btcAddress, setBtcAddress] = useState<string>('');
  const userSession = useAppSelector(selectUserSessionState);

  const userAddress = userSession.loadUserData().profile.stxAddress.testnet;
  console.log('user address', userAddress);

  const setAutoExchange = () => {
    if (userAddress !== null) {
      ContractSetAutoExchange(!exchange);
    }
  };

  const changeBtcAddress = () => {
    if (btcAddress !== '') {
      ContractChangeBtcAddress(btcAddress);
      setBtcAddress('');
    }
  };

  const claimRewards = () => {
    if (claimRewardsInputAmount !== null) {
      ContractClaimRewardsForBlock(claimRewardsInputAmount);
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

  const depositAmount = () => {
    if (depositAmountInput !== null && !isNaN(depositAmountInput)) {
      if (depositAmountInput < 0.000001) {
        alert('You need to input more');
      } else {
        console.log(depositAmountInput);
        ContractDepositSTX(depositAmountInput, userAddress);
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

  useEffect(() => {
    if (leavePoolButtonClicked && showAlertLeavePool) setDisableLeavePoolButton(true);
  }, [leavePoolButtonClicked, showAlertLeavePool]);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  useEffect(() => {
    const getExchangeState = async () => {
      if (userAddress !== null) {
        const newExchange = await readOnlyExchangeToggle(userAddress);
        setExchange(newExchange);
      }
    };

    getExchangeState();
  }, [userAddress]);

  useEffect(() => {
    const getUserBalance = async () => {
      const principalAddress = userSession.loadUserData().profile.stxAddress.testnet;

      const getTotalWithdrawals = await readOnlyGetAllTotalWithdrawals(principalAddress);
      const balance = await readOnlyGetBalance(principalAddress);
      setTotalWithdrawals(getTotalWithdrawals);
      setCurrentBalance(balance);
    };

    getUserBalance();
  }, [currentBalance, totalWithdrawals]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: colors[currentTheme].accent2,
        color: colors[currentTheme].secondary,
        marginTop: -2.5,
      }}
    >
      <div>
        <ul>
          <li>
            current role: <div>{currentRole}</div>
          </li>
          <li>balance SC: {currentBalance / 1000000 + ' STX'}</li>
          <li>total withdrawal of SC: {totalWithdrawals !== null ? totalWithdrawals / 1000000 + ' STX' : '0 STX'}</li>
          <li>
            autoexchange stx to btc: {exchange === null || exchange === false ? 'No' : 'Yes'}
            <div>
              <button onClick={setAutoExchange}>
                {exchange === null || exchange === false ? 'Change to yes' : 'Change to no'}
              </button>
            </div>
          </li>
          <li>
            change btc address
            <div>
              <TextField
                id="outlined-basic"
                label="btc-address"
                variant="outlined"
                onChange={(e) => setBtcAddress(e.target.value)}
              />
            </div>
            <div>
              <button onClick={changeBtcAddress}>change btc address</button>
            </div>
          </li>

          <li>
            claim rewards for block (block_id)
            <div>
              <input
                type="number"
                onChange={(e) => {
                  const inputAmount = e.target.value;
                  const inputAmountToInt = parseInt(inputAmount);
                  setClaimRewardsInputAmount(inputAmountToInt);
                  console.log('claim rewards input', inputAmount);
                }}
              ></input>
            </div>
            <div>
              <button
                onClick={() => {
                  claimRewards();
                  setClaimRewardsInputAmount(null);
                }}
              >
                claim rewards
              </button>
            </div>
          </li>
        </ul>

        <div>
          <input
            type="number"
            onChange={(e) => {
              const inputAmount = e.target.value;
              const inputAmountToInt = parseFloat(inputAmount);
              setDepositAmountInput(inputAmountToInt);
              console.log('deposit input', inputAmount);
            }}
          ></input>
          <Button
            variant="contained"
            className="minerProfileButtons"
            onClick={() => {
              depositAmount();
            }}
          >
            Deposit
          </Button>
        </div>
        <div>
          <input
            type="number"
            onChange={(e) => {
              const inputAmount = e.target.value;
              const inputAmountToInt = parseFloat(inputAmount);
              setWithdrawAmountInput(inputAmountToInt);
              console.log('withdraw input', inputAmount);
            }}
          ></input>
          <Button
            variant="contained"
            className="minerProfileButtons"
            onClick={() => {
              withdrawAmount();
            }}
          >
            Withdraw
          </Button>
        </div>
        <div>
          <Button
            disabled={disableLeavePoolButton}
            variant="contained"
            className="minerProfileButtons"
            onClick={leavePool}
          >
            Leave pool
          </Button>
        </div>
      </div>
      {leavePoolButtonClicked && showAlertLeavePool && (
        <div>
          <Alert
            severity="warning"
            onClose={() => {
              setLeavePoolButtonClicked(false);
              setShowAlertLeavePool(false);
              setDisableLeavePoolButton(false);
            }}
          >
            You are currently the notifier and you can not leave pool. Just a simple miner can leave the pool.
          </Alert>
        </div>
      )}
    </Box>
  );
};

export default MinerProfile;
