import {
  selectCurrentTheme,
  selectCurrentUserRoleMining,
  selectUserSessionState,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { UserRoleMining } from '../../../redux/reducers/user-state';
import './styles.css';
import colors from '../../../consts/colorPallete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import RoleIntroStacking from './RoleIntroStacking';
import StackerProfile from './StackerProfile';

const ProfileStacking = () => {
  // I will need the currentRole, the connectedWallet and linkToExplorer

  const currentRole: UserRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  return (
    <div
      className="profile-page-main-container"
      style={{
        backgroundColor: colors[appCurrentTheme].accent2,
        color: colors[appCurrentTheme].colorWriting,
      }}
    >
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Stacking Pool</h2>
        <h2>Profile</h2>
      </div>
      {currentRole === 'Miner' ? <StackerProfile currentRole={currentRole} /> : ''}
    </div>
  );
};

export default ProfileStacking;
