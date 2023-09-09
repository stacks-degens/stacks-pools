import { CallMade, ExpandMore } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinearProgress from '@mui/material/LinearProgress';
import { ExpandLess } from '@mui/icons-material';
import './styles.css';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useEffect, useState } from 'react';
import { Box, Divider, ListItem, ListItemButton, Table, TableCell, TableHead, TableRow } from '@mui/material';
import { convertDigits } from '../../../consts/converter';

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
  const [isProgressExpandButtonClicked, setIsProgressExpandButtonClicked] = useState<boolean>(false);
  const [btcBlockRetrieved, setBtcBlockRetrieved] = useState(false);

  const numberOfBlocksPreparePhase = rewardPhaseStartBlockHeight - preparePhaseStartBlockHeight;
  const numberOfBlocksRewardPhase = numberOfBlocksPreparePhase * 20;
  const numberOfBlocksPerCycle = numberOfBlocksPreparePhase + numberOfBlocksRewardPhase;

  const currentBlockHeight = 80; //(currentBurnBlockHeight - preparePhaseStartBlockHeight) * 100 / numberOfBlocksPerCycle;
  const preparePhase = (numberOfBlocksPreparePhase * 100) / numberOfBlocksPerCycle;

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
            <ListItem
              sx={{ marginTop: '10px' }}
              onClick={() => setIsProgressExpandButtonClicked(!isProgressExpandButtonClicked)}
            >
              <ListItemButton
                sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', borderRadius: 4 }}
              >
                {!isProgressExpandButtonClicked && <ExpandMore fontSize="large" />}
                {isProgressExpandButtonClicked && <ExpandLess fontSize="large" />}
              </ListItemButton>
            </ListItem>
            {isProgressExpandButtonClicked && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#777777',
                      height: '20px',
                      width: '1%',
                      marginRight: '10px',
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ fontSize: '16px', marginRight: '50px' }}>Prepare Phase</div>
                  <div style={{ fontSize: '16px' }}>
                    {preparePhaseStartBlockHeight} - {preparePhaseStartBlockHeight + numberOfBlocksPreparePhase}
                  </div>
                </div>
                <br />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#444444',
                      height: '20px',
                      width: '1%',
                      marginRight: '10px',
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ fontSize: '16px', marginRight: '50px' }}>Current Block Height</div>
                  <div style={{ fontSize: '16px' }}>{currentBurnBlockHeight}</div>
                </div>
                <br />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#eeeeee',
                      height: '20px',
                      width: '1%',
                      marginRight: '10px',
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ fontSize: '16px', marginRight: '50px' }}>Reward Phase</div>
                  <div style={{ fontSize: '16px' }}>
                    {preparePhaseStartBlockHeight + numberOfBlocksPreparePhase} -{' '}
                    {preparePhaseStartBlockHeight + numberOfBlocksPerCycle}
                  </div>
                </div>
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
          <span className="result-of-content-section">{reservedAmount !== null ? reservedAmount + ' STX' : ''}</span>
        </div>

        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacked amount covered by the pool: </span>
          <span className="result-of-content-section">
            {reservedAmount !== null && returnCovered !== null ? reservedAmount * returnCovered + ' STX' : ''}
          </span>
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
