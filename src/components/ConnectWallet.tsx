import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import colors from '../consts/colorPallete';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { connectAction, disconnectAction, updateUserRoleAction } from '../redux/actions';
import { selectCurrentTheme, selectCurrentUserRole, selectUserSessionState } from '../redux/reducers/user-state';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { readOnlyAddressStatus } from '../consts/readOnly';

interface ConnectWalletProps {
  currentTheme: string;
}

const ConnectWallet = ({ currentTheme }: ConnectWalletProps) => {
  const [finalStatus, setFinalStatus] = useState<string>('Viewer');
  const userSession = useAppSelector(selectUserSessionState);
  const dispatch = useAppDispatch();

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const currentRole = useAppSelector(selectCurrentUserRole);
  const location = useLocation();

  const controlAccessRoutes = () => {
    if (location.pathname !== '/') {
      if (location.pathname.substring(1)?.toLowerCase() !== currentRole.toLowerCase()) {
        console.log('Seems like you got lost, click here to go back to the main page');
      }
    }
  };
  useEffect(() => {
    const fetchStatus = async () => {
      if (userSession.isUserSignedIn()) {
        const args = userSession.loadUserData().profile.stxAddress.testnet;
        const status = await readOnlyAddressStatus(args);
        setFinalStatus(status);
        updateUserRoleAction(finalStatus);
      }
    };

    fetchStatus();
  }, [finalStatus]);

  useEffect(() => {
    controlAccessRoutes();
  }, [location]);

  const disconnect = () => {
    dispatch(disconnectAction());
  };

  const authenticate = () => {
    dispatch(connectAction());
  };

  if (userSession.isUserSignedIn()) {
    if (currentRole === 'Viewer') {
      dispatch(updateUserRoleAction(finalStatus));
      return <div>Loading ...</div>;
    }
    return (
      <div>
        <button className="Connect" style={{ backgroundColor: colors[appCurrentTheme].primary }} onClick={disconnect}>
          <LogoutIcon style={{ color: colors[appCurrentTheme].headerIcon }} fontSize="medium" />
        </button>
      </div>
    );
  }

  return (
    <button className="Connect" style={{ backgroundColor: colors[appCurrentTheme].primary }} onClick={authenticate}>
      <LoginIcon style={{ color: colors[appCurrentTheme].headerIcon }} fontSize="medium" />
    </button>
  );
};

export default ConnectWallet;
