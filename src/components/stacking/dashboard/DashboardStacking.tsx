import { useEffect, useState } from 'react';
import { selectCurrentTheme, selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { UserRole } from '../../../redux/reducers/user-state';
import './styles.css';
import colors from '../../../consts/colorPallete';
import DashboardStackingInfo from './DashboardStackingInfo';

const DashboardStacking = () => {
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const dashboardStackingMapping: Record<UserRole, React.ReactElement> = {
    Viewer: <div></div>,
    NormalUser: <div></div>,
    Waiting: <div></div>,
    Pending: <div></div>,
    Miner: <div></div>,
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress.testnet;
      console.log('address', args);
      setUserAddress(args);
    } else {
      console.log('not signed in');
    }
  }, [userAddress]);

  return (
    <div className="dashboard-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Stacking Pool</h2>
        <h2>Dashboard</h2>
      </div>
      {/* <div>{dashboardStackingMapping[currentRole]}</div> */}
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <DashboardStackingInfo currentRole={currentRole} />
          {/* <DashboardInfoContainer
            notifier={currentNotifier}
            minersList={minersList}
            blocksWon={blocksWon}
            stacksRewards={stacksRewards}
            userAddress={userAddress}
            currentRole={currentRole}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardStacking;
