import {
  UserRoleStacking,
  selectCurrentTheme,
  selectCurrentUserRoleStacking,
  selectUserSessionState,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useEffect, useState } from 'react';
import RoleIntroStacking from './RoleIntroStacking';
import StackerProfile from './StackerProfile';

const ProfileStacking = () => {
  // I will need the currentRole, the connectedWallet and linkToExplorer

  const currentRole: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

  useEffect(() => {
    const wallet = userSession.loadUserData().profile.stxAddress.testnet;
    setConnectedWallet(wallet);
  }, [connectedWallet]);

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
      {currentRole === 'Provider' ? <StackerProfile currentRole={currentRole} connectedWallet={connectedWallet} /> : ''}
    </div>
  );
};

export default ProfileStacking;
