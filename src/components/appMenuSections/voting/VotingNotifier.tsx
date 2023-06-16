import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box, Button, TableCell } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  ReadOnlyGetMinersList,
  readOnlyGetAllDataNotifierVoterMiners,
  readOnlyGetK,
  readOnlyGetNotifier,
  readOnlyGetNotifierElectionProcessData,
} from '../../../consts/readOnly';
import { useAppSelector } from '../../../redux/store';
import { selectUserSessionState } from '../../../redux/reducers/user-state';
import { ContractStartVoteNotifier, ContractVoteForNotifier } from '../../../consts/smartContractFunctions';
import { principalCV, listCV } from '@stacks/transactions';
import { GetNotifiersRows, NotifiersData, notifierColumns } from '../../../consts/tableData';
import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import TableCreation from '../../TableCreation';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useNavigate } from 'react-router-dom';

const VotingNotifier = () => {
  const { currentTheme } = useCurrentTheme();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [electionBlocksRemaining, setElectionBlocksRemaining] = useState<number | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<any>(null);
  const [votedNotifier, setVotedNotifier] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);
  const [notifiersRows, setNotifiersRows] = useState<any>([]);
  const navigate = useNavigate();

  const handleMinerInfoButtonClick = (address: string) => {
    navigate(`/profile/${address}`);
  };

  const handlePendingVoteButtonClick = (address: string) => {
    ContractVoteForNotifier(address);
  };

  const notifiersRowContent = (_index: number, notifiersRow: NotifiersData) => {
    return (
      <React.Fragment>
        {notifierColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[currentTheme].secondary,
            }}
          >
            {notifiersRow[column.dataKey]}
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(notifiersRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[currentTheme].secondary }} />
                </Button>
              </Box>
            )}
            {column.dataKey === 'vote' && (
              <Box>
                <Button
                  style={{ marginRight: -18 }}
                  disabled={votedNotifier !== "you haven't voted yet"}
                  onClick={() => handlePendingVoteButtonClick(notifiersRow['address'])}
                >
                  <ThumbUpAltIcon fontSize="small" sx={{ color: 'green' }} />
                </Button>
              </Box>
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  const [minersList, setMinersList] = useState<any>([]);
  const [notifierVoteThreshold, setNotifierVoteThreshold] = useState<number | null>(null);
  const [fetchedMinerList, setFetchedMinerList] = useState<boolean>(false);
  const [fetchedVotesThreshold, setFetchedVotesThreshold] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const newMinersList = await ReadOnlyGetMinersList();
      setMinersList(newMinersList.value);
      setFetchedMinerList(true);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const getNotifierVotesThreshold = async () => {
      const threshold = await readOnlyGetK();
      setNotifierVoteThreshold(threshold);
      setFetchedVotesThreshold(true);
    };
    getNotifierVotesThreshold();
  }, [notifierVoteThreshold]);

  useEffect(() => {
    const fetchNotifierRows = async () => {
      if (notifierVoteThreshold !== null && minersList.length !== 0) {
        const newRows = await GetNotifiersRows(minersList, notifierVoteThreshold);
        setNotifiersRows(newRows);
      }
    };
    fetchNotifierRows();
  }, [fetchedMinerList, fetchedVotesThreshold]);

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
      setNotifierVoteStatus(notifier['vote-status'].value);
      setElectionBlocksRemaining(parseInt(notifier['election-blocks-remaining'].value));
    };
    getNotifierStatus();
  }, [notifierVoteStatus, electionBlocksRemaining]);

  useEffect(() => {
    const args = userSession.loadUserData().profile.stxAddress.testnet;
    setUserAddress(args);
  }, [userAddress]);

  useEffect(() => {
    const getVotedNotifier = async () => {
      if (userAddress !== null) {
        const voteResult = await readOnlyGetAllDataNotifierVoterMiners(listCV([principalCV(userAddress)]));
        setVotedNotifier(voteResult);
      }
    };
    getVotedNotifier();
  }, [votedNotifier, userAddress]);

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
        <h2>Voting - Notifier</h2>
        <ul>
          <li>who I voted for: {votedNotifier !== null ? votedNotifier : ''}</li>
          <li>number of blocks remaining to vote: {electionBlocksRemaining !== null && electionBlocksRemaining}</li>
          <li>
            the elected notifier if the vote ended:{' '}
            {notifierVoteStatus
              ? 'the vote is still open, no notifier to show yet'
              : currentNotifier !== null
              ? currentNotifier
              : '-'}
          </li>
          <li>
            <Button
              variant="contained"
              className="minerProfileButtons"
              onClick={() => {
                ContractStartVoteNotifier();
              }}
            >
              Start notifier vote
            </Button>
          </li>
        </ul>
      </div>
      {electionBlocksRemaining !== 0 && electionBlocksRemaining !== null && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
          }}
          style={{
            backgroundColor: colors[currentTheme].accent2,
            color: colors[currentTheme].secondary,
          }}
        >
          <TableCreation
            rows={notifiersRows}
            rowContent={notifiersRowContent}
            columns={notifierColumns}
            tableId="notifier"
            customTableWidth="75%"
          />
        </Box>
      )}
    </Box>
  );
};

export default VotingNotifier;
