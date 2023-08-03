import { useEffect, useState } from 'react';
import {
  readOnlyGetAllTotalWithdrawalsMining,
  ReadOnlyAllDataWaitingMiners,
  readOnlyGetRemainingBlocksJoinMining,
} from '../../../consts/readOnly';
import { selectCurrentUserRoleMining, selectUserSessionState } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import AboutContainer from '../../reusableComponents/profile/AboutContainer';
import ActionsContainer from '../../reusableComponents/profile/ActionsContainer';
import RoleIntro from '../../reusableComponents/profile/RoleIntro';
import { principalCV, ClarityValue, listCV, cvToJSON } from '@stacks/transactions';
import './styles.css';
import { network } from '../../../consts/network';

interface IMinerProfileProps {
  connectedWallet: string | null;
  explorerLink: string | undefined;
  currentBalance: number;
  currentNotifier: string | null;
  userAddress: string | null;
}

const MinerProfile = ({
  connectedWallet,
  explorerLink,
  currentBalance,
  currentNotifier,
  userAddress,
}: IMinerProfileProps) => {
  const userSession = useAppSelector(selectUserSessionState);
  const currentRole = useAppSelector(selectCurrentUserRoleMining);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);
  const localNetwork = network === 'devnet' ? 'testnet' : network;
  const userAddressAsCV: ClarityValue = listCV([
    principalCV(userSession.loadUserData().profile.stxAddress[localNetwork]),
  ]);
  const [positiveVotes, setPositiveVotes] = useState<number | null>(null);
  const [positiveVotesThreshold, setPositiveVotesThreshold] = useState<number | null>(null);
  const [negativeVotes, setNegativeVotes] = useState<number | null>(null);
  const [negativeVotesThreshold, setNegativeVotesThreshold] = useState<number | null>(null);
  const [blocksLeftUntilJoin, setBlocksLeftUntilJoin] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlocksLeft = async () => {
      const blocksLeft = await readOnlyGetRemainingBlocksJoinMining();
      setBlocksLeftUntilJoin(blocksLeft);
    };
    fetchBlocksLeft();
  }, [blocksLeftUntilJoin]);

  useEffect(() => {
    const getUserTotalWithdrawls = async () => {
      const principalAddress = userSession.loadUserData().profile.stxAddress[localNetwork];
      const getTotalWithdrawals = await readOnlyGetAllTotalWithdrawalsMining(principalAddress);
      setTotalWithdrawals(getTotalWithdrawals);
    };

    getUserTotalWithdrawls();
  }, [totalWithdrawals]);

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
  }, [userAddressAsCV]);

  return (
    <div>
      <div className="principal-content-profile-page">
        <RoleIntro
          currentRole={currentRole}
          positiveVotes={positiveVotes}
          positiveVotesThreshold={positiveVotesThreshold}
          negativeVotes={negativeVotes}
          negativeVotesThreshold={negativeVotesThreshold}
          blocksLeftUntilJoin={blocksLeftUntilJoin}
        />
        <div className={currentRole === 'Miner' ? 'main-info-container' : 'main-info-container-normal-user'}>
          <AboutContainer
            currentRole={currentRole}
            connectedWallet={connectedWallet}
            explorerLink={explorerLink}
            currentBalance={currentBalance}
            totalWithdrawals={totalWithdrawals}
            currentNotifier={currentNotifier}
            userAddress={userAddress}
            positiveVotes={positiveVotes}
            positiveVotesThreshold={positiveVotesThreshold}
            negativeVotes={negativeVotes}
            negativeVotesThreshold={negativeVotesThreshold}
            blocksLeftUntilJoin={blocksLeftUntilJoin}
          />
          {currentRole === 'Miner' && <ActionsContainer currentNotifier={currentNotifier} userAddress={userAddress} />}
        </div>
      </div>
    </div>
  );
};

export default MinerProfile;
