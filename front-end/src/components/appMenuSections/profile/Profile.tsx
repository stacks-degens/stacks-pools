import './styles.css';
import '../../../css/buttons/styles.css';
import '../../../css/helpers/styles.css';
import '../../../css/inputs/styles.css';
import '../../../css/links/styles.css';
import '../../../css/common-page-alignments/styles.css';
import { selectCurrentTheme, selectCurrentUserRoleMining, UserRoleMining } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import MinerProfile from './MinerProfile';
import colors from '../../../consts/colorPallete';

interface IProfileProps {
  connectedWallet: string | null;
  explorerLink: string | undefined;
  currentBalance: number;
  currentNotifier: string | null;
  userAddress: string | null;
}

const Profile = ({ connectedWallet, explorerLink, currentBalance, currentNotifier, userAddress }: IProfileProps) => {
  const currentRole: UserRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const profileMapping: Record<UserRoleMining, React.ReactElement> = {
    Viewer: <div></div>,
    NormalUser: (
      <MinerProfile
        connectedWallet={connectedWallet}
        explorerLink={explorerLink}
        currentBalance={currentBalance}
        currentNotifier={currentNotifier}
        userAddress={userAddress}
      />
    ),
    Waiting: (
      <MinerProfile
        connectedWallet={connectedWallet}
        explorerLink={explorerLink}
        currentBalance={currentBalance}
        currentNotifier={currentNotifier}
        userAddress={userAddress}
      />
    ),
    Pending: (
      <MinerProfile
        connectedWallet={connectedWallet}
        explorerLink={explorerLink}
        currentBalance={currentBalance}
        currentNotifier={currentNotifier}
        userAddress={userAddress}
      />
    ),
    Miner: (
      <MinerProfile
        connectedWallet={connectedWallet}
        explorerLink={explorerLink}
        currentBalance={currentBalance}
        currentNotifier={currentNotifier}
        userAddress={userAddress}
      />
    ),
  };

  return (
    <div
      className="profile-page-main-container"
      style={{
        backgroundColor: colors[appCurrentTheme].accent2,
        color: colors[appCurrentTheme].colorWriting,
      }}
    >
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Profile</h2>
      </div>
      {profileMapping[currentRole]}
    </div>
  );
};

export default Profile;
