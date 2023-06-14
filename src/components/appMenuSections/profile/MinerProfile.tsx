import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import {
  readOnlyExchangeToggle,
  readOnlyGetBalance,
  readOnlyGetNotifier,
  readOnlyGetRemainingBlocksJoin,
} from '../../../consts/readOnly';
import { selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import '../style.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Alert, Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  ContractChangeBtcAddress,
  ContractClaimRewardsForBlock,
  ContractDepositSTX,
  ContractLeavePool,
  ContractWithdrawSTX,
} from '../../../consts/smartContractFunctions';
import { updateUserRoleAction } from '../../../redux/actions';
import { SelectChangeEvent } from '@mui/material/Select';

const MinerProfile = () => {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const { currentTheme } = useCurrentTheme();
  const currentRole = useAppSelector(selectCurrentUserRole);
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | null>(null);
  const [exchange, setExchange] = useState<boolean>(false);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [showAlertLeavePool, setShowAlertLeavePool] = useState<boolean>(false);
  const [leavePoolButtonClicked, setLeavePoolButtonClicked] = useState<boolean>(false);
  const [disableLeavePoolButton, setDisableLeavePoolButton] = useState<boolean>(false);
  const [claimRewardsInputAmount, setClaimRewardsInputAmount] = useState<number | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | ''>('');
  const userSession = useAppSelector(selectUserSessionState);
  const dispatch = useAppDispatch();

  const userAddress = userSession.loadUserData().profile.stxAddress.testnet;
  console.log('user address', userAddress);

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

  const handleChangeSelectInput = (event: SelectChangeEvent) => {
    console.log('select input value', exchange);
    if (event.target.value === 'yes') setExchange(true);
    else if (event.target.value === 'no') setExchange(false);
  };

  const leavePool = () => {
    setLeavePoolButtonClicked(true);
    if (currentNotifier !== null && currentNotifier !== userAddress) {
      ContractLeavePool();
      dispatch(updateUserRoleAction('NormalUser'));
    } else if (currentNotifier !== null && currentNotifier === userAddress) {
      console.log("you art the notifier, you can't leave pool");

      setShowAlertLeavePool(true);
      setDisableLeavePoolButton(true);
    }
  };

  const depositAmount = () => {
    if (depositAmountInput !== null) {
      ContractDepositSTX(depositAmountInput);
      setDepositAmountInput(null);
    }
  };

  const withdrawAmount = () => {
    if (withdrawAmountInput !== null) {
      ContractWithdrawSTX(withdrawAmountInput);
      setWithdrawAmountInput(null);
    }
  };

  useEffect(() => {
    if (leavePoolButtonClicked && showAlertLeavePool) setDisableLeavePoolButton(true);
  }, [leavePoolButtonClicked, showAlertLeavePool]);

  useEffect(() => {
    readOnlyExchangeToggle(userAddress);
  }, []);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  useEffect(() => {
    const getUserBalance = async () => {
      const principalAddress = userSession.loadUserData().profile.stxAddress.testnet;

      const balance = await readOnlyGetBalance(principalAddress);
      setCurrentBalance(balance);
    };

    getUserBalance();
  }, []);

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
          <li>balance SC: {currentBalance}</li>
          <li>total withdrawal of SC</li>
          <li>
            autoexchange stx to btc:
            <div>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">exchange</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={exchange === true ? 'yes' : 'no'}
                  label="Exchange"
                  onChange={handleChangeSelectInput}
                >
                  <MenuItem value="yes">yes</MenuItem>
                  <MenuItem value="no">no</MenuItem>
                </Select>
              </FormControl>
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
              const inputAmountToInt = parseInt(inputAmount);
              setDepositAmountInput(inputAmountToInt);
              console.log('deposit input', inputAmount);
            }}
          ></input>
          <Button
            variant="contained"
            className="minerProfileButtons"
            onClick={() => {
              depositAmount();
              alert('we need to implement this functionality');
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
              const inputAmountToInt = parseInt(inputAmount);
              setWithdrawAmountInput(inputAmountToInt);
              console.log('withdraw input', inputAmount);
            }}
          ></input>
          <Button
            variant="contained"
            className="minerProfileButtons"
            onClick={() => {
              withdrawAmount();
              alert('we need to implement this functionality');
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
