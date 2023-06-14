import { useEffect, useState } from 'react';
import {
  readOnlyGetBlocksWon,
  readOnlyGetCurrentBlock,
  readOnlyGetNotifier,
  readOnlyGetNotifierElectionProcessData,
} from '../../../consts/readOnly';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const MiningPoolStatus = () => {
  const [currentBlock, setCurrentBlock] = useState<number>();
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<any>();
  const [electionBlocksRemaining, setElectionBlocksRemaining] = useState<any>();
  const { currentTheme } = useCurrentTheme();
  const [currentNotifier, setCurrentNotifier] = useState<string>('');
  const [blocksWon, setBlocksWon] = useState<number | null>(null);

  useEffect(() => {
    const getBlocksWon = async () => {
      const blocks = await readOnlyGetBlocksWon();
      setBlocksWon(blocks);
    };
    getBlocksWon();
  }, [blocksWon]);

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
      setElectionBlocksRemaining(notifier['election-blocks-remaining'].value);
    };
    getNotifierStatus();
  }, [notifierVoteStatus, electionBlocksRemaining]);

  useEffect(() => {
    const getCurrentBlock = async () => {
      const block = await readOnlyGetCurrentBlock();
      setCurrentBlock(block);
    };
    getCurrentBlock();
  }, [currentBlock]);

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
        <h2>Mining Pool - Status</h2>
        <ul>
          <li>current notifier: {currentNotifier}</li>
          <li>ongoing block: {currentBlock}</li>
          <li>notifier voting status: {notifierVoteStatus}</li>
          <li>election remaining blocks: {electionBlocksRemaining}</li>
          {blocksWon !== null && <li>number of blocks won: {blocksWon} </li>}
        </ul>
      </div>
      <div style={{ marginTop: 100 }}>
        <h4>Detailed info about the mining pool (widgets/statistics for all existing blocks)</h4>
        <ul>
          <li>last winner bloack id</li>
          <li>mining performance</li>
          <li>voting history</li>
        </ul>
      </div>
    </Box>
  );
};

export default MiningPoolStatus;
