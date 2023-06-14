import { useEffect, useState } from "react";
import { readOnlyGetCurrentBlock, readOnlyGetNotifierElectionProcessData } from "../../../consts/readOnly";
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const MiningPoolStatus = () => {
  const [currentBlock, setCurrentBlock] = useState<number>()
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<any>()
  const [electionBlocksRemaining, setElectionBlocksRemaining] = useState<any>()
  const { currentTheme } = useCurrentTheme();

  useEffect(() => {
    const getNotifierStatus = async () => {
      const notifier = await readOnlyGetNotifierElectionProcessData();
      setNotifierVoteStatus(notifier['vote-status'].value ? "Vote ongoing!" : "Elections haven't started yet!")
      setElectionBlocksRemaining(notifier['election-blocks-remaining'].value)
    };
    getNotifierStatus();
  }, [setNotifierVoteStatus, setElectionBlocksRemaining],);
  
  useEffect(() => {
    const getCurrentBlock = async () => {
      const block = await readOnlyGetCurrentBlock();
      setCurrentBlock(block);
    };
    getCurrentBlock();
  }, [setCurrentBlock]);

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', 
      backgroundColor: colors[currentTheme].accent2, 
      color: colors[currentTheme].secondary,
      marginTop: -2.5 }}>
    <div>
      <h2>Mining Pool - Status</h2>
      <ul>
        <li>current notifier</li>
        <li>current miners</li>
        <li>stacks rewards</li>
        <li>ongoing block: {currentBlock}</li>
        <li>notifier voting status: {notifierVoteStatus}</li>
        <li>election remaining blocks: {electionBlocksRemaining}</li>
      </ul>
    </div>
    </Box>
  );
};

export default MiningPoolStatus;
