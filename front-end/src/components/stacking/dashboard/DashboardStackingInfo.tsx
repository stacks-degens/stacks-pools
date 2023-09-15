import { UserRoleStacking, selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ContractAllowInPoolPoxScStacking, ContractJoinPoolStacking } from '../../../consts/smartContractFunctions';
import {
  Box,
  Button,
  Dialog,
  GlobalStyles,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  Paper,
  TableCell,
  TableRow,
} from '@mui/material';
import { HighlightScope, BarChart } from '@mui/x-charts';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from 'react';

interface DashboardStackingInfoProps {
  currentRole: UserRoleStacking;
  liquidityProvider: string | null;
  stackersList: Array<string>;
  blocksRewarded: number | null; //this is for the slots won
  bitcoinRewards: number | null;
  stacksAmountThisCycle: number | null;
  reservedAmount: number | null;
  returnCovered: number | null;
  minimumDepositProvider: number | null;
  userAddress: string | null;
  currentBurnBlockHeight: number | null;
  preparePhaseStartBlockHeight: number;
  rewardPhaseStartBlockHeight: number;
}

const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const DashboardStackingInfo = ({
  currentRole,
  liquidityProvider,
  stackersList,
  blocksRewarded,
  bitcoinRewards,
  stacksAmountThisCycle,
  reservedAmount,
  returnCovered,
  minimumDepositProvider,
  userAddress,
  currentBurnBlockHeight,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: DashboardStackingInfoProps) => {
  //TODO: see what is returning the readOnlyGetAllowanceStacking(userAddress) ->
  //null is false (so ALert comes up) and
  //some value for true, but I don't know the type of that value ->
  //see if I have to change the type of aloowanceStatus
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isProgressExpandButtonClicked, setIsProgressExpandButtonClicked] = useState<boolean>(false);

  const numberOfBlocksPreparePhase = (preparePhaseStartBlockHeight - rewardPhaseStartBlockHeight) / 20;
  const numberOfBlocksRewardPhase = numberOfBlocksPreparePhase * 20;
  const numberOfBlocksPerCycle = numberOfBlocksPreparePhase + numberOfBlocksRewardPhase;

  const slope =
    returnCovered !== null && reservedAmount !== null ? (1.0 - 2.5) / (0.025 * returnCovered * reservedAmount) : 1;
  const multiplier =
    stacksAmountThisCycle !== null && returnCovered !== null && reservedAmount !== null
      ? stacksAmountThisCycle > 0.025 * returnCovered * reservedAmount
        ? 1
        : 2.5 + slope * stacksAmountThisCycle
      : 1;

  const currentBlockHeight =
    currentBurnBlockHeight !== null
      ? ((currentBurnBlockHeight - rewardPhaseStartBlockHeight) * 100) / numberOfBlocksPerCycle
      : ((0 - rewardPhaseStartBlockHeight) * 100) / numberOfBlocksPerCycle;

  const preparePhase = ((preparePhaseStartBlockHeight - rewardPhaseStartBlockHeight) * 100) / numberOfBlocksPerCycle;

  const barChartsParams = {
    series: [
      { data: [reservedAmount !== null ? reservedAmount * 2.5 : 0], color: '#eeeeee' },
      {
        data: [
          stacksAmountThisCycle !== null && returnCovered !== null && reservedAmount !== null
            ? stacksAmountThisCycle < 0.001 * returnCovered * reservedAmount
              ? 0.001 * returnCovered * reservedAmount
              : stacksAmountThisCycle * multiplier
            : 0,
        ],
        color: '#777777',
      },
      {
        data: [returnCovered !== null && reservedAmount !== null ? returnCovered * reservedAmount : 0],
        color: '#444444',
      },
    ],
    height: window.screen.height * 0.7,
  };

  useEffect(() => {
    if (divRef.current && divRef.current['offsetWidth'] > 100) {
      setDivWidth(divRef.current['offsetWidth']);
    }
  }, []);

  const allowPoolInPoxSc = () => {
    if (userAddress !== null) {
      ContractAllowInPoolPoxScStacking();
    }
  };

  const changeDialogOpen = (isDialogOpen: boolean) => {
    setDialogOpen(isDialogOpen);
  };

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-dashboard-page"
    >
      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container">INFO</div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
          height: 'auto',
        }}
        className="heading-info-container"
      >
        <div>
          <Box>
            <div
              ref={divRef}
              style={{
                marginTop: '10px',
                marginLeft:
                  currentBlockHeight >= (divWidth - 50) / (divWidth / 100)
                    ? (divWidth - 50) / (divWidth / 100) + '%'
                    : currentBlockHeight < 50 / (divWidth / 100)
                    ? '0%'
                    : currentBlockHeight - 50 / (divWidth / 100) + '%',
              }}
            >
              Current Block
            </div>
            <LinearProgress
              variant="buffer"
              value={preparePhase < currentBlockHeight ? preparePhase : currentBlockHeight}
              valueBuffer={preparePhase < currentBlockHeight ? currentBlockHeight : preparePhase}
              sx={{
                '& .MuiLinearProgress-bar1Buffer': {
                  // Prepare phase
                  backgroundColor: currentBlockHeight <= preparePhase ? '#444444' : '#777777',
                  borderRight: currentBlockHeight < preparePhase ? divWidth / 150 + 'px solid red' : 'none',
                },

                '& .MuiLinearProgress-bar2Buffer': {
                  // Current block
                  backgroundColor: currentBlockHeight <= preparePhase ? '#777777' : '#444444',
                  borderRight: currentBlockHeight > preparePhase ? divWidth / 150 + 'px solid red' : 'none',
                },

                '& .MuiLinearProgress-dashed': {
                  // Reward phase
                  animation: 'none',
                  backgroundColor: '#eeeeee',
                  backgroundImage: 'none',
                },

                height: 20,
                borderRadius: 3,
                marginTop: '15px',
              }}
            />
            <div style={{ marginRight: '-15px', marginTop: '-5px', marginBottom: '-20px' }}>
              <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }} align="center">
                Reward Phase
              </TableCell>
              <TableCell
                style={{ borderBottom: 'none', width: 100 - preparePhase + '%', fontWeight: 'bold' }}
                align="left"
              >
                Prepare Phase
              </TableCell>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <ListItem
                sx={{ marginTop: '10px', width: '50%' }}
                onClick={() => setIsProgressExpandButtonClicked(!isProgressExpandButtonClicked)}
              >
                <ListItemButton
                  sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', borderRadius: 4 }}
                >
                  <Button size="large" sx={{ color: colors[appCurrentTheme].colorWriting }} disableRipple>
                    Blocks Details
                  </Button>
                </ListItemButton>
              </ListItem>
              <ListItem sx={{ marginTop: '10px', width: '50%' }}>
                <ListItemButton
                  sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', borderRadius: 4 }}
                  onClick={() => changeDialogOpen(true)}
                >
                  <Button
                    size="large"
                    sx={{ color: colors[appCurrentTheme].colorWriting, width: '100%' }}
                    disableRipple
                  >
                    Reward Details
                  </Button>
                </ListItemButton>
                <GlobalStyles
                  styles={{
                    '*::-webkit-scrollbar': { width: '0.1em', backgroundColor: colors[appCurrentTheme].primary },
                    '*::-webkit-scrollbar-thumb': { backgroundColor: colors[appCurrentTheme].defaultOrange },
                  }}
                />
                <Dialog open={dialogOpen}>
                  <Box
                    sx={{ width: 310, height: '100%' }}
                    role="presentation"
                    style={{
                      backgroundColor: colors[appCurrentTheme].accent2,
                      color: colors[appCurrentTheme].colorWriting,
                    }}
                  >
                    <List style={{ backgroundColor: colors[appCurrentTheme].primary }}>
                      <ListItem disablePadding>
                        <div
                          style={{
                            width: 'auto',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            marginTop: 2,
                            marginBottom: 2,
                          }}
                        >
                          <ListItemButton disableRipple onClick={() => changeDialogOpen(false)}>
                            <CloseIcon fontSize="medium" style={{ color: '#ff0000' }} />
                          </ListItemButton>
                        </div>
                      </ListItem>
                    </List>

                    <List style={{ backgroundColor: colors[appCurrentTheme].accent2 }}>
                      <div>
                        <div style={{ marginBottom: '-100px' }}>
                          <TableRow>
                            <TableCell style={{ borderBottom: 'none', width: '70%' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                  style={{
                                    backgroundColor: '#ffffff',
                                    height: '12px',
                                    width: '7%',
                                    marginRight: '10px',
                                  }}
                                />
                                <div style={{ fontSize: '16px' }}>Rewards Guaraneed</div>
                              </div>
                            </TableCell>
                            <TableCell style={{ borderBottom: 'none' }}>
                              <div style={{ fontSize: '16px' }}>
                                {reservedAmount !== null ? numberWithCommas(reservedAmount) : 0}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ borderBottom: 'none', width: '70%' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                  style={{
                                    backgroundColor: '#777777',
                                    height: '12px',
                                    width: '7%',
                                    marginRight: '10px',
                                  }}
                                />
                                <div style={{ fontSize: '16px' }}>Stacked This Cycle</div>
                              </div>
                            </TableCell>
                            <TableCell style={{ borderBottom: 'none' }}>
                              <div style={{ fontSize: '16px' }}>
                                {stacksAmountThisCycle !== null ? numberWithCommas(stacksAmountThisCycle) : 0}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ borderBottom: 'none', width: '70%' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                  style={{
                                    backgroundColor: '#444444',
                                    height: '12px',
                                    width: '7%',
                                    marginRight: '10px',
                                  }}
                                />
                                <div style={{ fontSize: '16px' }}>Amount Covered</div>
                              </div>
                            </TableCell>
                            <TableCell style={{ borderBottom: 'none' }}>
                              <div style={{ fontSize: '16px' }}>
                                {returnCovered !== null && reservedAmount !== null
                                  ? numberWithCommas(returnCovered * reservedAmount)
                                  : 0}
                              </div>
                            </TableCell>
                          </TableRow>
                        </div>
                        <BarChart
                          {...barChartsParams}
                          series={barChartsParams.series.map((series) => ({
                            ...series,
                            highlightScope: {
                              highlighted: 'item',
                              faded: 'global',
                            } as HighlightScope,
                          }))}
                          bottomAxis={null}
                          leftAxis={null}
                          legend={{ hidden: true }}
                          tooltip={{ trigger: 'none' }}
                        />
                      </div>
                    </List>
                  </Box>
                </Dialog>
              </ListItem>
            </div>
            {isProgressExpandButtonClicked && (
              <div>
                <TableRow>
                  <TableCell style={{ borderBottom: 'none', width: '60%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          backgroundColor: '#777777',
                          height: '20px',
                          width: '7%',
                          marginRight: '10px',
                          borderRadius: 4,
                        }}
                      />
                      <div className="bold-font" style={{ fontSize: '16px' }}>
                        Reward Phase
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ borderBottom: 'none' }}>
                    <div className="info-section-phase-dashboard">
                      {numberWithCommas(rewardPhaseStartBlockHeight)} - {numberWithCommas(preparePhaseStartBlockHeight)}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ borderBottom: 'none', width: '60%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          backgroundColor: '#444444',
                          height: '20px',
                          width: '7%',
                          marginRight: '10px',
                          borderRadius: 4,
                        }}
                      />
                      <div className="bold-font" style={{ fontSize: '16px' }}>
                        Current Block
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ borderBottom: 'none' }}>
                    <div className="info-section-phase-dashboard">
                      {currentBurnBlockHeight !== null ? numberWithCommas(currentBurnBlockHeight) : ''}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ borderBottom: 'none', width: '60%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          backgroundColor: '#eeeeee',
                          height: '20px',
                          width: '7%',
                          marginRight: '10px',
                          borderRadius: 4,
                        }}
                      />
                      <div className="bold-font" style={{ fontSize: '16px' }}>
                        Prepare Phase
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ borderBottom: 'none' }}>
                    <div className="info-section-phase-dashboard">
                      {numberWithCommas(preparePhaseStartBlockHeight)} -{' '}
                      {numberWithCommas(rewardPhaseStartBlockHeight + numberOfBlocksPerCycle)}
                    </div>
                  </TableCell>
                </TableRow>
              </div>
            )}
          </Box>
        </div>
      </div>

      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Liquidity Provider: </span>
          <div className="result-of-content-section">{liquidityProvider !== null ? liquidityProvider : ''} </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">List of stackers: </span>
          <Paper
            style={{
              backgroundColor: colors[appCurrentTheme].infoContainers,
              color: colors[appCurrentTheme].colorWriting,
              maxHeight: 70,
              overflow: 'auto',
            }}
            elevation={0}
          >
            <GlobalStyles
              styles={{
                '*::-webkit-scrollbar': { width: '0.1em' },
                '*::-webkit-scrollbar-thumb': { backgroundColor: colors[appCurrentTheme].colorWriting },
              }}
            />
            {stackersList.length !== 0 &&
              stackersList.map((data: string, index: number) => (
                <div className="result-of-content-section" key={index}>
                  {data}
                </div>
              ))}
          </Paper>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Slots Won: </span>
          <span className="result-of-content-section">{blocksRewarded !== null ? blocksRewarded : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Bitcoin Rewards: </span>
          <span className="result-of-content-section">{bitcoinRewards !== null ? bitcoinRewards + ' BTC' : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Total stacked this cycle: </span>
          <span className="result-of-content-section">
            {stacksAmountThisCycle !== null ? stacksAmountThisCycle + ' STX' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Total guaranteed: </span>
          <span className="result-of-content-section">{reservedAmount !== null ? reservedAmount + ' STX' : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacked amount covered by the pool: </span>
          <span className="result-of-content-section">
            {reservedAmount !== null && returnCovered !== null ? reservedAmount * returnCovered + ' STX' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Return covered: </span>
          <span className="result-of-content-section">
            {returnCovered !== null ? (1 / returnCovered) * 100 + '%' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Minimum return Liquidity Provider: </span>
          <span className="result-of-content-section">
            {minimumDepositProvider !== null ? minimumDepositProvider + ' STX' : ''}
          </span>
        </div>
      </div>
      {currentRole === 'NormalUserStacking' && (
        <div className="footer-join-button-container">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={allowPoolInPoxSc}
          >
            Allow Pool in PoX SC
          </button>
        </div>
      )}

      {currentRole === 'NormalUserStacking' && (
        <div className="footer-join-button-container margin-top-10">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => ContractJoinPoolStacking()}
          >
            Join Pool
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardStackingInfo;
