import React, { useEffect, useRef, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import { ExpandLess } from '@mui/icons-material';
import './profile/styles.css';
import colors from '../../consts/colorPallete';
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
import { HighlightScope, BarChart } from '@mui/x-charts';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector } from '../../redux/store';
import { selectCurrentTheme } from '../../redux/reducers/user-state';
import { numberWithCommas } from '../../consts/converter';
import { number } from 'bitcoinjs-lib/types/script';

interface IStackingVisualArts {
  stacksAmountThisCycle: number | null;
  reservedAmount: number | null;
  returnCovered: number | null;
  currentBurnBlockHeight: number;
  preparePhaseStartBlockHeight: number;
  rewardPhaseStartBlockHeight: number;
}

export const StackingVisualArts = ({
  stacksAmountThisCycle,
  reservedAmount,
  returnCovered,
  currentBurnBlockHeight,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: IStackingVisualArts) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);
  const [isProgressExpandButtonClicked, setIsProgressExpandButtonClicked] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const changeDialogOpen = (isDialogOpen: boolean) => {
    setDialogOpen(isDialogOpen);
  };

  useEffect(() => {
    if (divRef.current && divRef.current['offsetWidth'] > 100) {
      setDivWidth(divRef.current['offsetWidth']);
    }
  }, []);

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

  const currentBlockHeight = ((currentBurnBlockHeight - rewardPhaseStartBlockHeight) * 100) / numberOfBlocksPerCycle;
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

  return (
    // <div
    //   style={{
    //     backgroundColor: colors[appCurrentTheme].infoContainers,
    //     color: colors[appCurrentTheme].colorWriting,
    //     borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
    //     height: 'auto',
    //   }}
    //   className="heading-info-container"
    // >
    <div>
      <Box>
        <div
          className="current-block"
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
          <TableCell style={{ borderBottom: 'none', width: 100 - preparePhase + '%', fontWeight: 'bold' }} align="left">
            Prepare Phase
          </TableCell>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <ListItem
            sx={{ marginTop: '10px', width: '50%' }}
            onClick={() => setIsProgressExpandButtonClicked(!isProgressExpandButtonClicked)}
          >
            <ListItemButton
              sx={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                backgroundColor: isProgressExpandButtonClicked
                  ? appCurrentTheme == 'light'
                    ? '#eeeeee'
                    : '#444444'
                  : 'none',
              }}
            >
              <Button size="large" sx={{ color: colors[appCurrentTheme].colorWriting }} disableRipple>
                Cycle Details
              </Button>
            </ListItemButton>
          </ListItem>
          <ListItem sx={{ marginTop: '10px', width: '50%' }}>
            <ListItemButton
              sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', borderRadius: 4 }}
              onClick={() => changeDialogOpen(true)}
            >
              <Button size="large" sx={{ color: colors[appCurrentTheme].colorWriting, width: '100%' }} disableRipple>
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
                <div className="about-section-phase-info">
                  {numberWithCommas(rewardPhaseStartBlockHeight)} - {numberWithCommas(preparePhaseStartBlockHeight)}
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ borderBottom: 'none', width: '60%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      // backgroundColor: '#444444',
                      backgroundColor: 'red',
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
                <div className="about-section-phase-info">{numberWithCommas(currentBurnBlockHeight)}</div>
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
                <div className="about-section-phase-info">
                  {numberWithCommas(preparePhaseStartBlockHeight)} -{' '}
                  {numberWithCommas(rewardPhaseStartBlockHeight + numberOfBlocksPerCycle)}
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ borderBottom: 'none', width: '60%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#444444',
                      // backgroundColor: 'red',
                      height: '20px',
                      width: '7%',
                      marginRight: '10px',
                      borderRadius: 4,
                    }}
                  />
                  <div className="bold-font" style={{ fontSize: '16px' }}>
                    Phase Progress
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </div>
        )}
      </Box>
    </div>
    // </div>
  );
};
