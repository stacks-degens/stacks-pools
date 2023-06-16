import { useEffect, useState } from 'react';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';
import {
  ReadOnlyAllDataWaitingMiners,
  readOnlyAddressStatus,
  readOnlyGetAllDataMinersInPool,
  readOnlyGetRemainingBlocksJoin,
} from '../../../consts/readOnly';
import { getExplorerUrl, network } from '../../../consts/network';
import { cvToJSON, listCV, principalCV } from '@stacks/transactions';

interface MinerDataProps {
  balance: string;
  minerBlocks: number;
  totalWithdraw: string;
  warnings: number;
  wasBlacklisted: boolean;
}

const Voting = () => {
  const { currentTheme } = useCurrentTheme();
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

  useEffect(() => {
    if (status === 'Pending') {
      const fetchBlocksLeft = async () => {
        const blocksLeft = await readOnlyGetRemainingBlocksJoin();
        setBlocksLeftUntilJoin(blocksLeft);
      };
      fetchBlocksLeft();
    }
  }, [blocksLeftUntilJoin]);

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
  }, [positiveVotes, positiveVotesThreshold, negativeVotes, negativeVotesThreshold]);

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

  if (status === null) {
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
          <h2>Miner Profile - Details</h2>
          <ul>
            <li>Address: {address}</li>
            <li>Wrong Address!</li>
          </ul>
        </div>
      </Box>
    );
  }

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
        <h2>Miner Profile - Details</h2>
        <ul>
          <li>Address: {address}</li>
          <li>Status: {status === 'NormalUser' ? 'Not Asked To Join Yet' : status}</li>
          {status === 'Waiting' && (
            <li>
              positive votes for me:{' '}
              {positiveVotes !== null && positiveVotesThreshold !== null
                ? positiveVotes + '/' + positiveVotesThreshold
                : '0'}
            </li>
          )}
          {status === 'Waiting' && (
            <li>
              negative votes for me:{' '}
              {negativeVotes !== null && negativeVotesThreshold !== null
                ? negativeVotes + '/' + negativeVotesThreshold
                : '0'}
            </li>
          )}
          {status === 'Pending' && (
            <li>Blocks until can join: {blocksLeftUntilJoin !== null ? blocksLeftUntilJoin : 0}</li>
          )}
          {status === 'Miner' && (
            <li>Was Blacklisted: {wasBlacklisted !== null ? (wasBlacklisted === false ? 'No' : 'Yes') : ''}</li>
          )}
          {status === 'Miner' && <li>Warnings: {warnings !== null ? warnings : ''}</li>}
          {status === 'Miner' && <li>Number of Blocks as Miner: {blocksAsMiner !== null ? blocksAsMiner : ''}</li>}
          {status === 'Miner' && <li>Balance: {balance !== null ? balance : ''}</li>}
          {status === 'Miner' && <li>Total Withdrawals: {totalWithdrawals !== null ? totalWithdrawals : ''}</li>}
          <li>
            <button style={{ backgroundColor: colors[currentTheme].accent2, color: colors[currentTheme].secondary }}>
              <a
                style={{ backgroundColor: colors[currentTheme].accent2, color: colors[currentTheme].secondary }}
                target="_blank"
                rel="noreferrer"
                href={explorerLink !== undefined ? explorerLink : ''}
              >
                Check Address on Explorer
              </a>
            </button>
          </li>
        </ul>
      </div>
    </Box>
  );
};

export default Voting;
