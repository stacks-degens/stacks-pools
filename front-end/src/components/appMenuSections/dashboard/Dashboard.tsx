import { selectCurrentTheme, selectCurrentUserRoleMining, UserRoleMining } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import DashboardInfoContainer from '../../reusableComponents/dashboard/DashboardInfoContainer';
import colors from '../../../consts/colorPallete';
import './styles.css';

interface IDashboardProps {
  currentBurnBlockHeight: number | null;
  currentNotifier: string | null;
  minersList: Array<string>;
  blocksWon: number | null;
  stacksRewards: number | null;
  userAddress: string | null;
  minersNumber: number | null;
  poolSpendPerBlock: number | null;
}

const Dashboard = ({
  currentBurnBlockHeight,
  currentNotifier,
  minersList,
  blocksWon,
  stacksRewards,
  userAddress,
  minersNumber,
  poolSpendPerBlock,
}: IDashboardProps) => {
  const currentRole: UserRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div className="dashboard-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Dashboard</h2>
      </div>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <DashboardInfoContainer
            notifier={currentNotifier}
            minersList={minersList}
            blocksWon={blocksWon}
            stacksRewards={stacksRewards}
            userAddress={userAddress}
            currentRole={currentRole}
            currentBurnBlockHeight={currentBurnBlockHeight}
            minersNumber={minersNumber}
            poolTotalSpendPerBlock={poolSpendPerBlock}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
