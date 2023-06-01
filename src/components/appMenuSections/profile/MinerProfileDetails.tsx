import { useEffect, useState } from 'react';
import {
  ReadOnlyAllDataWaitingMiners,
  readOnlyAddressStatus,
  readOnlyGetAllDataMinersInPool,
  readOnlyGetRemainingBlocksJoin,
} from '../../../consts/readOnly';
import { getExplorerUrl, network } from '../../../consts/network';
import { cvToJSON, listCV, principalCV } from '@stacks/transactions';
import MinerDetailsContainer from '../../reusableComponents/profile/profileDetails/MinerDetailsContainer';
import RoleIntroMinerDetails from '../../reusableComponents/profile/profileDetails/RoleIntroMinerDetails';
import './styles.css';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

interface MinerDataProps {
  balance: string;
  minerBlocks: number;
  totalWithdraw: string;
  warnings: number;
  wasBlacklisted: boolean;
}

const MinerProfileDetails = () => {
  const currentLink = window.location.href;
  const addressParts = currentLink.split('/');
  const address = addressParts[addressParts.length - 1];
  const [minerData, setMinerData] = useState<MinerDataProps | string | null>(null);
  const [wasBlacklisted, setWasBlacklisted] = useState<boolean | null>(null);
  const [warnings, setWarnings] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [totalWithdrawals, setTotalWithdrawals] = useState<string | null>(null);
  const [blocksAsMiner, setBlocksAsMiner] = useState<number | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | null>(null);
  const [positiveVotes, setPositiveVotes] = useState<number | null>(null);
  const [positiveVotesThreshold, setPositiveVotesThreshold] = useState<number | null>(null);
  const [negativeVotes, setNegativeVotes] = useState<number | null>(null);
  const [negativeVotesThreshold, setNegativeVotesThreshold] = useState<number | null>(null);
  const [blocksLeftUntilJoin, setBlocksLeftUntilJoin] = useState<number | null>(null);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  useEffect(() => {
    if (status === 'Pending') {
      const fetchBlocksLeft = async () => {
        const blocksLeft = await readOnlyGetRemainingBlocksJoin();
        setBlocksLeftUntilJoin(blocksLeft);
      };
      fetchBlocksLeft();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'Waiting') {
      const fetchData = async () => {
        const waitingList = await ReadOnlyAllDataWaitingMiners(listCV([principalCV(address)]));
        const newWaitingList = cvToJSON(waitingList.newResultList[0]);
        setPositiveVotes(newWaitingList.value[0].value.value['pos-votes'].value);
        setPositiveVotesThreshold(newWaitingList.value[0].value.value['pos-thr'].value);
        setNegativeVotes(newWaitingList.value[0].value.value['neg-votes'].value);
        setNegativeVotesThreshold(newWaitingList.value[0].value.value['neg-thr'].value);
      };
      fetchData();
    }
  }, [status, address]);

  useEffect(() => {
    if (address !== null) {
      setExplorerLink(getExplorerUrl[network](address).explorerUrl);

      const getAddressStatus = async () => {
        const newStatus = await readOnlyAddressStatus(address);
        setStatus(newStatus);
      };
      getAddressStatus();
    }
  }, [address]);

  useEffect(() => {
    if (status === 'Miner') {
      const getMinerData = async () => {
        const data = await readOnlyGetAllDataMinersInPool(address);
        setMinerData(data);
      };
      getMinerData();
    }
  }, [status]);

  useEffect(() => {
    if (typeof minerData !== 'string' && minerData !== null) {
      setWasBlacklisted(minerData.wasBlacklisted);
      setWarnings(minerData.warnings);
      setBalance(minerData.balance);
      setTotalWithdrawals(minerData.totalWithdraw);
      setBlocksAsMiner(minerData.minerBlocks);
    }
  }, [minerData]);

  return (
    <div
      style={{
        backgroundColor: 'inherit',
      }}
      className="single-miner-page-main-container"
    >
      <div className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Miner Details</h2>
      </div>
      <div
        style={{
          backgroundColor: colors[appCurrentTheme].accent2,
        }}
        className="principal-content-profile-page"
      >
        <RoleIntroMinerDetails currentRole={status} />
        <div className={'main-info-container-normal-user'}>
          <MinerDetailsContainer
            currentRole={status}
            address={address}
            explorerLink={explorerLink}
            currentBalance={balance}
            totalWithdrawals={totalWithdrawals}
            wasBlacklisted={wasBlacklisted}
            warnings={warnings}
            blocksAsMiner={blocksAsMiner}
            blocksUntilJoin={blocksLeftUntilJoin}
            positiveVotes={positiveVotes + '/' + positiveVotesThreshold}
            negativeVotes={negativeVotes + '/' + negativeVotesThreshold}
          />
        </div>
      </div>
    </div>
  );
};

export default MinerProfileDetails;
