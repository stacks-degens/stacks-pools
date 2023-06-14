import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box, Button } from '@mui/material';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import { ContractTryEnterPool } from '../../../consts/smartContractFunctions';
import { ReadOnlyAllDataWaitingMiners } from '../../../consts/readOnly';
import { useState, useEffect } from 'react';
import { principalCV, ClarityValue, listCV } from '@stacks/transactions';

const WaitingMinerProfile = () => {
  const { currentTheme } = useCurrentTheme();
  const currentRole = useAppSelector(selectCurrentUserRole);
  const userSession = useAppSelector(selectUserSessionState);
  const userAddressAsCV: ClarityValue = listCV([principalCV(userSession.loadUserData().profile.stxAddress.testnet)]);
  const [positiveVotes, setPositiveVotes] = useState<number | null>(null);
  const [positiveVotesThreshold, setPositiveVotesThreshold] = useState<number | null>(null);
  const [negativeVotes, setNegativeVotes] = useState<number | null>(null);
  const [negativeVotesThreshold, setNegativeVotesThreshold] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const newWaitingList = await ReadOnlyAllDataWaitingMiners(userAddressAsCV);
      setPositiveVotes(newWaitingList[0].value[0].value.value['positive-votes'].value);
      setPositiveVotesThreshold(newWaitingList[0].value[0].value.value['positive-threshold'].value);
      setNegativeVotes(newWaitingList[0].value[0].value.value['negative-votes'].value);
      setNegativeVotesThreshold(newWaitingList[0].value[0].value.value['negative-threshold'].value);
    };
    fetchData();
  }, [positiveVotes, positiveVotesThreshold, negativeVotes, negativeVotesThreshold]);

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
          <li>
            <Button
              sx={{ border: 0.2 }}
              style={{
                backgroundColor: colors[currentTheme].accent2,
                color: colors[currentTheme].secondary,
              }}
              onClick={() => ContractTryEnterPool()}
            >
              Try Enter
            </Button>
          </li>
          <li>
            positive votes for me:{' '}
            {positiveVotes !== null && positiveVotesThreshold !== null
              ? positiveVotes + '/' + positiveVotesThreshold
              : '0'}
          </li>
          <li>
            negative votes for me:{' '}
            {negativeVotes !== null && negativeVotesThreshold !== null
              ? negativeVotes + '/' + negativeVotesThreshold
              : '0'}
          </li>
        </ul>
      </div>
    </Box>
  );
};

export default WaitingMinerProfile;
