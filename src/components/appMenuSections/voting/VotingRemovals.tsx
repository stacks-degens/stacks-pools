import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import useCurrentTheme from '../../../consts/theme';
import colors from '../../../consts/colorPallete';
import {
  ContractVotePositiveJoin,
  ContractVoteNegativeJoin,
  ContractTryEnterPool,
} from '../../../consts/smartContractFunctions';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Button from '@mui/material/Button';
import TableCreation from '../../../components/TableCreation';
import {
  WaitingData,
  waitingColumns,
  GetWaitingRows,
  GetRemovalsRows,
} from '../../../consts/tableData';

const VotingJoiners = () => {
  const { currentTheme } = useCurrentTheme();
  const waitingRows = GetRemovalsRows();

  const tryEnterPool = () => {
    ContractTryEnterPool();
  };

  const handlePendingVoteButtonClick = (data: string, address: string) => {
    if (data === 'voteYes') {
      ContractVotePositiveJoin(address);
    } else if (data === 'voteNo') {
      ContractVoteNegativeJoin(address);
    }
  };

  const waitingRowContent = (_index: number, waitingRow: WaitingData) => {
    return (
      <React.Fragment>
        {waitingColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[currentTheme].secondary,
            }}
          >
            {column.dataKey === 'vote' ? (
              <Box>
                <Button onClick={() => handlePendingVoteButtonClick('voteYes', waitingRow['address'])}>
                  <ThumbUpAltIcon
                    fontSize="small"
                    sx={{ color: 'green' }}
                  />
                </Button>
                <Button style={{ marginRight: -52 }} onClick={() => handlePendingVoteButtonClick('voteNo', waitingRow['address'])}>
                  <ThumbDownAltIcon
                    fontSize="small"
                    sx={{ color: 'red' }}
                  />
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
        {/* if user not waiting, don't show this button */}
        <Button
          sx={{ border: 1 }}
          style={{
            backgroundColor: colors[currentTheme].accent2,
            color: colors[currentTheme].secondary,
            marginTop: 10,
            marginBottom: -20,
          }}
          onClick={() => tryEnterPool()}
        >
          Try Enter
        </Button>
      <TableCreation
        rows={waitingRows}
        rowContent={waitingRowContent}
        columns={waitingColumns}
        tableId="waiting"
        customTableWidth="75%"
      />
    </Box>
  );
};

export default VotingJoiners;
