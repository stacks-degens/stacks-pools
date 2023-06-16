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
import { ContractEndVoteNotifier } from '../../../consts/smartContractFunctions';

const MiningPoolStatus = () => {
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<string | null>(null);
  const { currentTheme } = useCurrentTheme();
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
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
          <li>current notifier: {currentNotifier !== null ? currentNotifier : ''}</li>
          <li>ongoing block: {currentBlock !== null ? currentBlock : ''}</li>
          <li>
            notifier voting status: {notifierVoteStatus !== null ? notifierVoteStatus : ''}
            {notifierVoteStatus === 'Not really ended.' && (
              <div>
                <button onClick={ContractEndVoteNotifier}>End Notifier Vote</button>
              </div>
            )}
          </li>
          <li>number of blocks won: {blocksWon !== null ? blocksWon : ''}</li>
        </ul>
      </div>
    </Box>
  );
};

export default MiningPoolStatus;
