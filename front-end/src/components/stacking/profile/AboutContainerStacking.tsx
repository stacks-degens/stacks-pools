import { CallMade, ExpandMore } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinearProgress from '@mui/material/LinearProgress';
import { ExpandLess } from '@mui/icons-material';
import './styles.css';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CardHeader,
  Dialog,
  Divider,
  FormControlLabel,
  GlobalStyles,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { convertDigits } from '../../../consts/converter';
import { HighlightScope, BarChart } from '@mui/x-charts';
import CloseIcon from '@mui/icons-material/Close';

interface IAboutContainerStackingProps {
  currentRole: string;
  connectedWallet: string | null;
  lockedInPool: number | null;
  explorerLink: string | undefined;
  delegatedToPool: number | null;
  stacksAmountThisCycle: number | null;
  reservedAmount: number | null;
  returnCovered: number | null;
  userUntilBurnHt: number | null;
  currentBurnBlockHeight: number;
  currentCycle: number | null;
  preparePhaseStartBlockHeight: number;
  rewardPhaseStartBlockHeight: number;
}

const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const AboutContainerStacking = ({
  currentRole,
  connectedWallet,
  lockedInPool,
  delegatedToPool,
  stacksAmountThisCycle,
  reservedAmount,
  returnCovered,
  userUntilBurnHt,
  explorerLink,
  currentBurnBlockHeight,
  currentCycle,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: IAboutContainerStackingProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);

  useEffect(() => {
    if (divRef.current && divRef.current['offsetWidth'] > 100) {
      setDivWidth(divRef.current['offsetWidth']);
    }
  }, []);

  const [isProgressExpandButtonClicked, setIsProgressExpandButtonClicked] = useState<boolean>(false);
  const [btcBlockRetrieved, setBtcBlockRetrieved] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const numberOfBlocksPreparePhase = rewardPhaseStartBlockHeight - preparePhaseStartBlockHeight;
  const numberOfBlocksRewardPhase = numberOfBlocksPreparePhase * 20;
  const numberOfBlocksPerCycle = numberOfBlocksPreparePhase + numberOfBlocksRewardPhase;

  const currentBlockHeight = ((currentBurnBlockHeight - preparePhaseStartBlockHeight) * 100) / numberOfBlocksPerCycle;
  const preparePhase = (numberOfBlocksPreparePhase * 100) / numberOfBlocksPerCycle;

  const barChartsParams = {
    series: [
      { data: [reservedAmount !== null ? reservedAmount * 5 : 0], label: 'Some Reward', color: '#eeeeee' }, // TODO: delete the * 5
      {
        data: [stacksAmountThisCycle !== null ? stacksAmountThisCycle * 5 : 0], // TODO: delete the * 5
        label: 'Other Reward',
        color: '#777777',
      },
      {
        data: [returnCovered !== null && reservedAmount !== null ? returnCovered * reservedAmount * 10 : 0], // TODO: delete the * 10
        label: 'Some Type Of Reward',
        color: '#444444',
      },
    ],
    height: window.screen.height * 0.7,
  };

  const changeDialogOpen = (isDialogOpen: boolean) => {
    setDialogOpen(isDialogOpen);
  };

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-stacking-profile-page"
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
          <div className="title-info-container bold-font">ABOUT</div>
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
                },

                '& .MuiLinearProgress-bar2Buffer': {
                  // Current block
                  backgroundColor: currentBlockHeight <= preparePhase ? '#777777' : '#444444',
                  borderRight: divWidth / 150 + 'px solid red',
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
            <div style={{ marginLeft: '-15px', marginTop: '-5px', marginBottom: '-20px' }}>
              <TableCell style={{ borderBottom: 'none', width: preparePhase + '%' }} align="left">
                Prepare Phase
              </TableCell>
              <TableCell style={{ borderBottom: 'none' }} align="center">
                Reward Phase
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
                                  ? numberWithCommas(returnCovered * reservedAmount * 10) // TODO: delete the * 10
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
                      <div style={{ fontSize: '16px' }}>Prepare Phase</div>
                    </div>
                  </TableCell>
                  <TableCell style={{ borderBottom: 'none' }}>
                    <div style={{ fontSize: '16px' }}>
                      {numberWithCommas(preparePhaseStartBlockHeight)} -{' '}
                      {numberWithCommas(preparePhaseStartBlockHeight + numberOfBlocksPreparePhase)}
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
                      <div style={{ fontSize: '16px' }}>Current Block</div>
                    </div>
                  </TableCell>
                  <TableCell style={{ borderBottom: 'none' }}>
                    <div style={{ fontSize: '16px' }}>{numberWithCommas(currentBurnBlockHeight)}</div>
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
                      <div style={{ fontSize: '16px' }}>Reward Phase</div>
                    </div>
                  </TableCell>
                  <TableCell style={{ borderBottom: 'none' }}>
                    <div style={{ fontSize: '16px' }}>
                      {numberWithCommas(preparePhaseStartBlockHeight + numberOfBlocksPreparePhase)} -{' '}
                      {numberWithCommas(preparePhaseStartBlockHeight + numberOfBlocksPerCycle)}
                    </div>
                  </TableCell>
                </TableRow>
              </div>
            )}
          </Box>
        </div>
      </div>

      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
        }}
        className={
          currentRole === 'Provider' || currentRole === 'Stacker'
            ? 'content-info-container-stacking'
            : 'content-info-container-normal-user'
        }
      >
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Current Bitcoin Block:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {currentBurnBlockHeight !== null ? currentBurnBlockHeight : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Current Stacking Cycle:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {currentCycle !== null ? currentCycle : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">First Bitcoin Block Height of the next prepare phase:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {preparePhaseStartBlockHeight !== null ? preparePhaseStartBlockHeight : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">First Bitcoin Block Height of the next reward phase:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {rewardPhaseStartBlockHeight !== null ? rewardPhaseStartBlockHeight : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Connected wallet:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {connectedWallet !== null ? connectedWallet : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Role: {currentRole === 'NormalUserStacking' ? 'Normal User' : currentRole}</span>
          <span className="result-of-content-section"></span>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">
            Address’ delegated funds to the pool:{' '}
            {delegatedToPool !== null && delegatedToPool !== 0 && userUntilBurnHt !== null
              ? `${convertDigits(delegatedToPool)} STX until Bitcoin block ${userUntilBurnHt}.`
              : delegatedToPool !== null && delegatedToPool !== 0 && userUntilBurnHt === null
              ? 'The last burn block height for delegated funds has been reached, and the delegation has expired.'
              : delegatedToPool === null || delegatedToPool === 0
              ? 'No funds delegated to the Stacking Pool'
              : 'No delegated funds'}
          </span>
          <span className="result-of-content-section"></span>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">
            Locked in pool:{' '}
            {lockedInPool !== null && lockedInPool !== 0 ? `${convertDigits(lockedInPool)} STX` : 'No locked funds'}
          </span>
          <span className="result-of-content-section"></span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Total guaranteed: </span>
          <div className="result-of-content-section">{reservedAmount !== null ? reservedAmount + ' STX' : ''}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacked amount covered by the pool: </span>
          <div className="result-of-content-section">
            {reservedAmount !== null && returnCovered !== null ? reservedAmount * returnCovered + ' STX' : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Link to explorer: </span>
          <button
            className="button-with-no-style"
            style={{
              backgroundColor: colors[appCurrentTheme].accent2,
              color: colors[appCurrentTheme].secondary,
            }}
          >
            <a
              className="custom-link result-of-content-section"
              style={{ backgroundColor: colors[appCurrentTheme].accent2, color: colors[appCurrentTheme].secondary }}
              target="_blank"
              rel="noreferrer"
              href={explorerLink !== undefined ? explorerLink : ''}
            >
              <span className="flex-center">
                Visit
                <span className="flex-center left-margins result-of-content-section">
                  <CallMade className="custom-icon" />
                </span>
              </span>
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutContainerStacking;
