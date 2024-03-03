import { UserRoleStacking, selectCurrentTheme, selectUserSessionState } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import { useEffect } from 'react';
import StackerProfile from './StackerProfile';
import { useLocation, useNavigate } from 'react-router-dom';

interface IProfileStackingProps {
  currentBurnBlockHeight: number | null;
  currentCycle: number | null;
  preparePhaseStartBlockHeight: number | null;
  rewardPhaseStartBlockHeight: number | null;
  connectedWallet: string | null;
  explorerLink: string | undefined;
  userAddress: string | null;
  lockedInPool: number;
  stacksAmountThisCycle: number | null;
  delegatedToPool: number;
  reservedAmount: number | null;
  returnCovered: number | null;
  userUntilBurnHt: number;
  currentRole: UserRoleStacking;
}

const ProfileStacking = ({
  currentBurnBlockHeight,
  currentCycle,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
  connectedWallet,
  explorerLink,
  userAddress,
  lockedInPool,
  stacksAmountThisCycle,
  delegatedToPool,
  reservedAmount,
  returnCovered,
  userUntilBurnHt,
  currentRole,
}: IProfileStackingProps) => {
  const userSession = useAppSelector(selectUserSessionState);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = '/stacking/dashboard';

  useEffect(() => {
    if (userSession.isUserSignedIn() === false) {
      navigate(`${basePath}`);
    } else if (userSession.isUserSignedIn()) {
      if (currentRole === 'NormalUserStacking') {
        navigate(`${basePath}`);
      }
    }
  }, [location.pathname, currentRole, userSession, navigate]);

  useEffect(() => {
    if (!userSession.isUserSignedIn()) {
      navigate(`${basePath}`);
    }
  }, [userSession, navigate]);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  return (
    <div
      className="profile-page-main-container-stacking"
      style={{
        backgroundColor: colors[appCurrentTheme].accent2,
        color: colors[appCurrentTheme].colorWriting,
      }}
    >
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Stacking Pool</h2>
        <h2>Profile</h2>
      </div>
      {(currentRole === 'Provider' || currentRole === 'Stacker') && (
        <StackerProfile
          currentRole={currentRole}
          connectedWallet={connectedWallet}
          explorerLink={explorerLink}
          userAddress={userAddress}
          lockedInPool={lockedInPool}
          stacksAmountThisCycle={stacksAmountThisCycle}
          delegatedToPool={delegatedToPool}
          reservedAmount={reservedAmount}
          returnCovered={returnCovered}
          userUntilBurnHt={userUntilBurnHt}
          currentBurnBlockHeight={currentBurnBlockHeight}
          currentCycle={currentCycle}
          preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
          rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
        />
      )}
    </div>
  );
};

export default ProfileStacking;
