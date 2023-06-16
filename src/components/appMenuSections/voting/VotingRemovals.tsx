import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import colors from '../../../consts/colorPallete';
import { ContractVotePositiveRemove, ContractVoteNegativeRemove } from '../../../consts/smartContractFunctions';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import InfoIcon from '@mui/icons-material/Info';
import Button from '@mui/material/Button';
import TableCreation from '../../../components/TableCreation';
import { removalsColumns, GetRemovalsRows, AllTableData } from '../../../consts/tableData';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

const VotingRemovals = () => {
  const removalsRows = GetRemovalsRows();
  const navigate = useNavigate();

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const handleRemovalVoteButtonClick = (data: string, address: string | undefined) => {
    if (address !== undefined) {
      if (data === 'voteYes') {
        ContractVotePositiveRemove(address);
      } else if (data === 'voteNo') {
        ContractVoteNegativeRemove(address);
      }
    }
  };

  const handleMinerInfoButtonClick = (address: string | undefined) => {
    if (address !== undefined) {
      navigate(`/profile/${address}`);
    }
  };

  const removalsRowContent = (_index: number, removalsRow: AllTableData) => {
    return (
      <React.Fragment>
        {removalsColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[appCurrentTheme].colorWriting,
              backgroundColor: colors[appCurrentTheme].infoContainers,
            }}
          >
            {column.dataKey === 'vote' ? (
              <Box>
                <Button onClick={() => handleRemovalVoteButtonClick('voteYes', removalsRow['address'])}>
                  <ThumbUpAltIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultOrange }} />
                </Button>
                <Button
                  style={{ marginRight: -52 }}
                  onClick={() => handleRemovalVoteButtonClick('voteNo', removalsRow['address'])}
                >
                  <ThumbDownAltIcon fontSize="small" sx={{ color: colors[appCurrentTheme].colorWriting }} />
                </Button>
              </Box>
            ) : (
              removalsRow[column.dataKey]
            )}
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(removalsRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultOrange }} />
                </Button>
              </Box>
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="voting-removals-page-main-container">
      <div className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Voting - Removals</h2>
      </div>
      <div className="principal-content-profile-page">
        <TableCreation
          rows={removalsRows}
          rowContent={removalsRowContent}
          columns={removalsColumns}
          tableId="removals"
          customTableWidth="75%"
        />
      </div>
    </div>
  );
};

export default VotingRemovals;
