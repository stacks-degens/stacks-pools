import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import useCurrentTheme from '../../../consts/theme';
import colors from '../../../consts/colorPallete';
import { ContractVotePositiveRemove, ContractVoteNegativeRemove } from '../../../consts/smartContractFunctions';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import InfoIcon from '@mui/icons-material/Info';
import Button from '@mui/material/Button';
import TableCreation from '../../../components/TableCreation';
import { removalsColumns, GetRemovalsRows, AllTableData } from '../../../consts/tableData';
import { useNavigate } from 'react-router-dom';

const VotingRemovals = () => {
  const { currentTheme } = useCurrentTheme();
  const removalsRows = GetRemovalsRows();
  const navigate = useNavigate();

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
              color: colors[currentTheme].colorWriting,
              backgroundColor: colors[currentTheme].infoContainers,
            }}
          >
            {column.dataKey === 'vote' ? (
              <Box>
                <Button onClick={() => handleRemovalVoteButtonClick('voteYes', removalsRow['address'])}>
                  <ThumbUpAltIcon sx={{ color: colors[currentTheme].defaultOrange }} />
                </Button>
                <Button
                  style={{ marginRight: -52 }}
                  onClick={() => handleRemovalVoteButtonClick('voteNo', removalsRow['address'])}
                >
                  <ThumbDownAltIcon fontSize="small" sx={{ color: colors[currentTheme].colorWriting }} />
                </Button>
              </Box>
            ) : (
              removalsRow[column.dataKey]
            )}
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(removalsRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[currentTheme].defaultOrange }} />
                </Button>
              </Box>
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  return (
    // <Box
    //   sx={{
    //     display: 'flex',
    //     alignItems: 'center',
    //     flexDirection: 'column',
    //     width: '100%',
    //     minHeight: 'calc(100vh - 60px)',
    //   }}
    //   style={{
    //     backgroundColor: colors[currentTheme].accent2,
    //     color: colors[currentTheme].secondary,
    //   }}
    // >
    <div className="page-heading-title">
      <h2>Decentralized Mining Pool</h2>
      <h2>Voting - Removals</h2>
      <div className="principal-content-profile-page"></div>
      <TableCreation
        rows={removalsRows}
        rowContent={removalsRowContent}
        columns={removalsColumns}
        tableId="removals"
        customTableWidth="75%"
      />
    </div>
  );
  // </Box>
};

export default VotingRemovals;
