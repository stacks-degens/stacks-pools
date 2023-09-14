import { useEffect, useState } from 'react';
import {
  UserRoleStacking,
  selectCurrentTheme,
  selectCurrentUserRoleStacking,
  selectUserSessionState,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import DashboardStackingInfo from './DashboardStackingInfo';
import {
  readOnlyGetBitcoinRewardsStacking,
  readOnlyGetBlocksRewardedStacking,
  readOnlyGetLiquidityProvider,
  readOnlyGetMinimumDepositLiquidityProviderStacking,
  readOnlyGetReturnStacking,
  readOnlyGetSCLockedBalance,
  readOnlyGetSCReservedBalance,
  ReadOnlyGetStackersList,
} from '../../../consts/readOnly';
import { network, apiMapping } from '../../../consts/network';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractMapping } from '../../../consts/contract';

import { AppConfig, UserSession } from '@stacks/connect';
import { convertDigits } from '../../../consts/converter';

interface IDashboardProps {
  currentRole: UserRoleStacking;
  currentLiquidityProvider: string | null;
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
const DashboardStacking = ({
  currentRole,
  currentLiquidityProvider,
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
}: IDashboardProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div className="dashboard-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Stacking Pool</h2>
        <h2>Dashboard</h2>
      </div>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <DashboardStackingInfo
            currentRole={currentRole}
            liquidityProvider={currentLiquidityProvider}
            stackersList={stackersList}
            blocksRewarded={blocksRewarded}
            bitcoinRewards={bitcoinRewards}
            stacksAmountThisCycle={stacksAmountThisCycle}
            reservedAmount={reservedAmount}
            returnCovered={returnCovered}
            minimumDepositProvider={minimumDepositProvider}
            userAddress={userAddress}
            currentBurnBlockHeight={currentBurnBlockHeight}
            preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
            rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStacking;
