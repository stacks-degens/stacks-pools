import { CallMade, ExpandMore } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './styles.css';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useEffect, useRef, useState } from 'react';

import { convertDigits } from '../../../consts/converter';
import { StackingVisualArts } from '../StackingVIsualArts';
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
        <StackingVisualArts
          reservedAmount={reservedAmount}
          stacksAmountThisCycle={stacksAmountThisCycle}
          returnCovered={returnCovered}
          currentBurnBlockHeight={currentBurnBlockHeight}
          preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
          rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
        />
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
          <span className="bold-font">Current Stacking Cycle:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {currentCycle !== null ? numberWithCommas(currentCycle) : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Connected wallet:</span>
          <div className="write-just-on-one-line result-of-content-section connected-walled">
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
          <div className="result-of-content-section">
            {reservedAmount !== null ? numberWithCommas(reservedAmount) + ' STX' : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacked amount covered by the pool: </span>
          <div className="result-of-content-section">
            {reservedAmount !== null && returnCovered !== null
              ? numberWithCommas(reservedAmount * returnCovered) + ' STX'
              : ''}
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
