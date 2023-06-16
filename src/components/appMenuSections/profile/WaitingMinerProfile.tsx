import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box, Button } from '@mui/material';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import { ContractTryEnterPool } from '../../../consts/smartContractFunctions';
import { ReadOnlyAllDataWaitingMiners } from '../../../consts/readOnly';
import { useState, useEffect } from 'react';
import { principalCV, ClarityValue, listCV, cvToJSON } from '@stacks/transactions';

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
      const waitingList = await ReadOnlyAllDataWaitingMiners(userAddressAsCV);
      const newWaitingList = cvToJSON(waitingList.newResultList[0]);
      setPositiveVotes(newWaitingList.value[0].value.value['pos-votes'].value);
      setPositiveVotesThreshold(newWaitingList.value[0].value.value['pos-thr'].value);
      setNegativeVotes(newWaitingList.value[0].value.value['neg-votes'].value);
      setNegativeVotesThreshold(newWaitingList.value[0].value.value['neg-thr'].value);
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
