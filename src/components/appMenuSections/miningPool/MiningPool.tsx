import './styles.css';
import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import colors from '../../../consts/colorPallete';
import { ContractProposeRemoval } from '../../../consts/smartContractFunctions';
import Button from '@mui/material/Button';
import TableCreation from '../../../components/TableCreation';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import InfoIcon from '@mui/icons-material/Info';
import { AllTableData, GetMinersRows, minerColumns } from '../../../consts/tableData';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

const MiningPool = () => {
  const navigate = useNavigate();
  const minersRows = GetMinersRows();
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const handleMinerRemoveButtonClick = (address: string | undefined) => {
    if (address !== undefined) {
      ContractProposeRemoval(address);
    }
  };

  const handleMinerInfoButtonClick = async (address: string | undefined) => {
    if (address !== undefined) {
      navigate(`/profile/${address}`);
    }
  };

  const minersRowContent = (_index: number, minersRow: AllTableData) => {
    return (
      <React.Fragment>
        {minerColumns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.dataKey === 'address' ? 'left' : 'right'}
            sx={{
              color: colors[appCurrentTheme].colorWriting,
              backgroundColor: colors[appCurrentTheme].infoContainers,
            }}
          >
            {column.dataKey === 'proposeRemoval' ? (
              <Box>
                <Button sx={{ marginRight: 3 }} onClick={() => handleMinerRemoveButtonClick(minersRow['address'])}>
                  <PersonRemoveIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultOrange }} />
                </Button>
              </Box>
            ) : (
              minersRow[column.dataKey]
            )}
            {column.dataKey === 'generalInfo' && (
              <Box>
                <Button onClick={() => handleMinerInfoButtonClick(minersRow['address'])}>
                  <InfoIcon fontSize="small" sx={{ color: colors[appCurrentTheme].defaultYellow }} />
                </Button>
              </Box>
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="miningpool-miners-page-main-container">
      <div className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Mining Pool - Miners</h2>
      </div>
      <div className="principal-content-profile-page">
        <TableCreation
          rows={minersRows}
          rowContent={minersRowContent}
          columns={minerColumns}
          tableId="miners"
          customTableWidth="75%"
        />
      </div>
    </div>
  );
};

export default MiningPool;
