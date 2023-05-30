import colors from '../../../consts/colorPallete';
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
import { selectCurrentTheme, selectUserSessionState } from '../../../redux/reducers/user-state';
import { ContractVoteForNotifier } from '../../../consts/smartContractFunctions';
import { principalCV, listCV } from '@stacks/transactions';
import { AllTableData, GetNotifiersRows, notifierColumns } from '../../../consts/tableData';
import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import TableCreation from '../../TableCreation';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useNavigate } from 'react-router-dom';
import VotingNotifierInfoContainer from '../../reusableComponents/voting/VotingNotifierInfoContainer';
import './styles.css';

const VotingNotifier = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [electionBlocksRemaining, setElectionBlocksRemaining] = useState<number | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<boolean | null>(null);
  const [votedNotifier, setVotedNotifier] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);
  const [notifiersRows, setNotifiersRows] = useState<{ id: number; address: string; notifierVotes: string }[]>([]);
  const navigate = useNavigate();

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const handleMinerInfoButtonClick = (address: string | undefined) => {
    if (address !== undefined) {
      navigate(`/profile/${address}`);
    }
  };

  const handlePendingVoteButtonClick = (address: string | undefined) => {
    if (address !== undefined) {
      ContractVoteForNotifier(address);
    }
  };

  const notifiersRowContent = (_index: number, notifiersRow: AllTableData) => {
    return (
      <React.Fragment>
        {notifierColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[appCurrentTheme].colorWriting,
              backgroundColor: colors[appCurrentTheme].infoContainers,
            }}
          >
            {notifiersRow[column.dataKey]}
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(notifiersRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultYellow }} />
                </Button>
              </Box>
            )}
            {column.dataKey === 'vote' && (
              <Box>
                <Button
                  style={{ marginRight: -18 }}
                  disabled={votedNotifier !== "You haven't voted yet!"}
                  onClick={() => handlePendingVoteButtonClick(notifiersRow['address'])}
                >
                  <ThumbUpAltIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultOrange }} />
                </Button>
              </Box>
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  const [minersList, setMinersList] = useState<{ type: string; value: string }[]>([]);
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
  }, []);

  useEffect(() => {
    const fetchNotifierRows = async () => {
      if (notifierVoteThreshold !== null && minersList.length !== 0) {
        const newRows = await GetNotifiersRows(minersList, notifierVoteThreshold);
        setNotifiersRows(newRows);
      }
    };
    fetchNotifierRows();
  }, [notifierVoteThreshold, minersList]);

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
      setNotifierVoteStatus(notifier['vote-status'].value);
      setElectionBlocksRemaining(parseInt(notifier['election-blocks-remaining'].value));
    };
    getNotifierStatus();
  }, []);

  useEffect(() => {
    const args = userSession.loadUserData().profile.stxAddress.testnet;
    setUserAddress(args);
  }, []);

  useEffect(() => {
    const getVotedNotifier = async () => {
      if (userAddress !== null) {
        const voteResult = await readOnlyGetAllDataNotifierVoterMiners(listCV([principalCV(userAddress)]));
        setVotedNotifier(voteResult);
      }
    };
    getVotedNotifier();
  }, [userAddress]);

  return (
    <div className="voting-notifier-page-main-container">
      <div className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Voting - Notifier</h2>
      </div>
      <div
        className="principal-content-profile-page"
        style={{ marginTop: electionBlocksRemaining !== 0 && electionBlocksRemaining !== null ? -11 : 90 }}
      >
        <div className="main-info-container-normal-user">
          <VotingNotifierInfoContainer
            votedFor={votedNotifier}
            blocksRemaining={electionBlocksRemaining}
            electedNotifier={currentNotifier}
            voteStatus={notifierVoteStatus}
          />
        </div>
      </div>

      {electionBlocksRemaining !== 0 && electionBlocksRemaining !== null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: colors[appCurrentTheme].accent2,
            color: colors[appCurrentTheme].secondary,
          }}
        >
          <TableCreation
            rows={notifiersRows}
            rowContent={notifiersRowContent}
            columns={notifierColumns}
            tableId="notifier"
            customTableWidth="75%"
          />
        </div>
      )}
    </div>
  );
};

export default VotingNotifier;
