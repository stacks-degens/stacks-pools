import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import colors from '../../../consts/colorPallete';
import { ContractVotePositiveJoin, ContractVoteNegativeJoin } from '../../../consts/smartContractFunctions';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';
import TableCreation from '../../../components/TableCreation';
import { waitingColumns, GetWaitingRows, AllTableData } from '../../../consts/tableData';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

const VotingJoiners = () => {
  const waitingRows = GetWaitingRows();
  const navigate = useNavigate();

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const handlePendingVoteButtonClick = (data: string, address: string | undefined) => {
    if (address !== undefined) {
      if (data === 'voteYes') {
        ContractVotePositiveJoin(address);
      } else if (data === 'voteNo') {
        ContractVoteNegativeJoin(address);
      }
    }
  };

  const handleMinerInfoButtonClick = (address: string | undefined) => {
    if (address !== undefined) {
      navigate(`/profile/${address}`);
    }
  };

  const waitingRowContent = (_index: number, waitingRow: AllTableData) => {
    return (
      <React.Fragment>
        {waitingColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[appCurrentTheme].colorWriting,
              backgroundColor: colors[appCurrentTheme].infoContainers,
            }}
          >
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(waitingRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultOrange }} />
                </Button>
              </Box>
            )}
            {column.dataKey === 'vote' ? (
              <Box>
                <Button onClick={() => handlePendingVoteButtonClick('voteYes', waitingRow['address'])}>
                  <ThumbUpAltIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultOrange }} />
                </Button>
                <Button
                  style={{ marginRight: -52 }}
                  onClick={() => handlePendingVoteButtonClick('voteNo', waitingRow['address'])}
                >
                  <ThumbDownAltIcon fontSize="small" sx={{ color: colors[appCurrentTheme].colorWriting }} />
                </Button>
              </Box>
            ) : (
              waitingRow[column.dataKey]
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="voting-joiners-page-main-container">
      <div className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Voting - Joiners</h2>
      </div>
      <div className="principal-content-profile-page">
        <TableCreation
          rows={waitingRows}
          rowContent={waitingRowContent}
          columns={waitingColumns}
          tableId="waiting"
          customTableWidth="75%"
        />
      </div>
    </div>
  );
};

export default VotingJoiners;
