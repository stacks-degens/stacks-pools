import { UserRoleStacking, selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import DashboardStackingInfo from './DashboardStackingInfo';

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
  currentBurnBlockHeight: number;
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
        <center>
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
        </center>
      </div>
    </div>
  );
};

export default DashboardStacking;
