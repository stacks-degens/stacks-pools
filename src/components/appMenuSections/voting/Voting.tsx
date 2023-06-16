import colors from '../../../consts/colorPallete';
import { readOnlyGetNotifier, readOnlyGetNotifierElectionProcessData } from '../../../consts/readOnly';
import { ContractEndVoteNotifier } from '../../../consts/smartContractFunctions';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';
import { useState, useEffect } from 'react';

const Voting = () => {
  const { currentTheme } = useCurrentTheme();
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<string | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  useEffect(() => {
    const getNotifierStatus = async () => {
      const notifier = await readOnlyGetNotifierElectionProcessData();
      setNotifierVoteStatus(
        notifier['vote-status'].value === false
          ? 'Elections ended!'
          : parseInt(notifier['election-blocks-remaining'].value) > 0
          ? 'Elections on-going!'
          : 'Not really ended.'
      );
    };
    getNotifierStatus();
  }, [notifierVoteStatus]);

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
        <h2>Voting - Status</h2>
        <ul>
          <li>current notifier: {currentNotifier !== null ? currentNotifier : ''}</li>
          <li>
            notifier voting status: {notifierVoteStatus !== null ? notifierVoteStatus : ''}
            {notifierVoteStatus === 'Not really ended.' && (
              <div>
                <button onClick={ContractEndVoteNotifier}>End Notifier Vote</button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </Box>
  );
};

export default Voting;
