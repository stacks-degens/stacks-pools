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
import { removalsColumns, GetRemovalsRows, RemovalsData } from '../../../consts/tableData';

const VotingRemovals = () => {
  const { currentTheme } = useCurrentTheme();
  const removalsRows = GetRemovalsRows();

  const handleRemovalVoteButtonClick = (data: string, address: string) => {
    if (data === 'voteYes') {
      ContractVotePositiveRemove(address);
    } else if (data === 'voteNo') {
      ContractVoteNegativeRemove(address);
    }
  };

  const handleMinerInfoButtonClick = (address: string) => {
    // change this call to redirect the one who clicked to a new tab, or make a popup with the info of the given miner
    // the call is named 'readOnlyGetAllDataMinersInPool', but for now it gives read_length error (@deployer needs to fix it)
    // ContractVotePositiveJoin(address);
  };

  const removalsRowContent = (_index: number, removalsRow: RemovalsData) => {
    return (
      <React.Fragment>
        {removalsColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[currentTheme].secondary,
            }}
          >
            {column.dataKey === 'vote' ? (
              <Box>
                <Button onClick={() => handleRemovalVoteButtonClick('voteYes', removalsRow['address'])}>
                  <ThumbUpAltIcon fontSize="small" sx={{ color: 'green' }} />
                </Button>
                <Button
                  style={{ marginRight: -52 }}
                  onClick={() => handleRemovalVoteButtonClick('voteNo', removalsRow['address'])}
                >
                  <ThumbDownAltIcon fontSize="small" sx={{ color: 'red' }} />
                </Button>
              </Box>
            ) : (
              removalsRow[column.dataKey]
            )}
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(removalsRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[currentTheme].secondary }} />
                </Button>
              </Box>
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        minHeight: 'calc(100vh - 60px)',
      }}
      style={{
        backgroundColor: colors[currentTheme].accent2,
        color: colors[currentTheme].secondary,
      }}
    >
      <TableCreation
        rows={removalsRows}
        rowContent={removalsRowContent}
        columns={removalsColumns}
        tableId="waiting"
        customTableWidth="75%"
      />
    </Box>
  );
};

export default VotingRemovals;
