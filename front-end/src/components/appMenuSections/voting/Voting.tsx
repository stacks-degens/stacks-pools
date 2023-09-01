import { readOnlyGetNotifier, readOnlyGetNotifierElectionProcessData } from '../../../consts/readOnly';
import { useState, useEffect } from 'react';
import VotingStatusContainer from '../../reusableComponents/voting/VotingStatusContainer';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import './styles.css';

const Voting = () => {
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<string | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

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

  return (
    <div className="voting-status-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Voting - Status</h2>
      </div>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <VotingStatusContainer notifier={currentNotifier} votingStatus={notifierVoteStatus} />
        </div>
      </div>
    </div>
  );
};

export default Voting;
