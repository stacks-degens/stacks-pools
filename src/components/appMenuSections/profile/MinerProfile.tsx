import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { readOnlyGetBalance, readOnlyGetRemainingBlocksJoin } from '../../../consts/readOnly';
import { selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import '../style.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';
import { useAppSelector } from '../../../redux/store';

const MinerProfile = () => {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const { currentTheme } = useCurrentTheme();
  const currentRole = useAppSelector(selectCurrentUserRole);
  const [depositAmountInput, setDepositAmountInput] = useState<number | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

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
          <li>autoexchange stx to btc: yes/no</li>
          <li>change btc address</li>
          <li>claim rewards for block (block_id)</li>
        </ul>

        <div>
          <input
            type="number"
            onChange={(e) => {
              const inputAmount = e.target.value;
              const inputAmountToInt = parseInt(inputAmount);
              setDepositAmountInput(inputAmountToInt);
              console.log('input', inputAmount);
            }}
          ></input>
          <Button
            variant="contained"
            className="minerProfileButtons"
            onClick={() => {
              alert('we need to implement this functionality');
            }}
          >
            Deposit
          </Button>
        </div>
        <Button
          variant="contained"
          className="minerProfileButtons"
          onClick={() => {
            alert('we need to implement this functionality');
          }}
        >
          Withdraw
        </Button>

        <Button
          variant="contained"
          className="minerProfileButtons"
          onClick={() => {
            alert('we need to implement this functionality');
          }}
        >
          Leave pool
        </Button>
      </div>
    </Box>
  );
};

export default MinerProfile;
