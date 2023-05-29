import { useEffect, useState } from 'react';
import {
  readOnlyGetBlocksWon,
  readOnlyGetCurrentBlock,
  readOnlyGetNotifier,
  readOnlyGetNotifierElectionProcessData,
} from '../../../consts/readOnly';
import MiningPoolStatusContainer from '../../reusableComponents/miningPool/MiningPoolStatusContainer';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

const MiningPoolStatus = () => {
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<string | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [blocksWon, setBlocksWon] = useState<number | null>(null);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  useEffect(() => {
    const getBlocksWon = async () => {
      const blocks = await readOnlyGetBlocksWon();
      setBlocksWon(blocks);
    };
    getBlocksWon();
  }, []);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, []);

  useEffect(() => {
    const getNotifierStatus = async () => {
      const notifier = await readOnlyGetNotifierElectionProcessData();
      setNotifierVoteStatus(
        notifier['vote-status'].value === false
          ? 'Elections ended!'
          : parseInt(notifier['election-blocks-remaining'].value) > 0
          ? 'Elections on-going!'
          : 'Ended by time!'
      );
    };
    getNotifierStatus();
  }, []);

  useEffect(() => {
    const getCurrentBlock = async () => {
      const block = await readOnlyGetCurrentBlock();
      setCurrentBlock(block);
    };
    getCurrentBlock();
  }, []);

  return (
    <div className="miningpool-status-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Mining Pool - Status</h2>
      </div>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <MiningPoolStatusContainer
            notifier={currentNotifier}
            currentBlock={currentBlock}
            blocksWon={blocksWon}
            votingStatus={notifierVoteStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default MiningPoolStatus;
