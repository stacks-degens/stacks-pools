import colors from '../../../consts/colorPallete';
import { readOnlyGetNotifier, readOnlyGetNotifierElectionProcessData } from '../../../consts/readOnly';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';
import { useState, useEffect } from 'react';

const Voting = () => {
  const { currentTheme } = useCurrentTheme();
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<any>();
  const [currentNotifier, setCurrentNotifier] = useState<string>('');

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
      setNotifierVoteStatus(notifier['vote-status'].value ? 'Vote ongoing!' : "Elections haven't started yet!");
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
          <li>current notifier: {currentNotifier}</li>
          <li>notifier voting status: {notifierVoteStatus}</li>
        </ul>
        <h4>notifier results from last round</h4>
      </div>
    </Box>
  );
};

export default Voting;
