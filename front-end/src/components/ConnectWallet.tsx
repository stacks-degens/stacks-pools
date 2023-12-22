import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import colors from '../consts/colorPallete';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  connectAction,
  disconnectAction,
  updateUserRoleActionMining,
  updateUserRoleActionStacking,
} from '../redux/actions';
import {
  selectCurrentTheme,
  selectCurrentUserRoleMining,
  selectCurrentUserRoleStacking,
  selectUserSessionState,
} from '../redux/reducers/user-state';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  readOnlyAddressStatusMining,
  readOnlyAddressStatusStacking,
  readOnlyGetLiquidityProvider,
} from '../consts/readOnly';
import { network } from '../consts/network';

interface ConnectWalletProps {
  currentTheme: string;
}

const ConnectWallet = ({ currentTheme }: ConnectWalletProps) => {
  const userSession = useAppSelector(selectUserSessionState);
  const [finalStatusMining, setFinalStatusMining] = useState<string>('Viewer');
  const [finalStatusStacking, setFinalStatusStacking] = useState<string>('Viewer');
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [displayLogoutIcon, setDisplayLogoutIcon] = useState<boolean>(userSession.isUserSignedIn());
  const dispatch = useAppDispatch();
  const location = useLocation();
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const currentRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const currentRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const localNetwork = network === 'devnet' ? 'testnet' : network;
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const disconnect = () => {
    dispatch(disconnectAction());
  };

  const authenticate = () => {
    dispatch(connectAction());
  };

  const controlAccessRoutes = () => {
    if (location.pathname !== '/') {
      if (location.pathname.substring(1)?.toLowerCase() !== currentRoleMining.toLowerCase()) {
        console.log('Seems like you got lost, click here to go back to the main page');
      }
    }
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setUserAddress(args);
    }
  }, [userAddress]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const wallet = userSession.loadUserData().profile.stxAddress[localNetwork];
      setConnectedWallet(wallet);
    }
  }, [connectedWallet]);

  useEffect(() => {
    const fetchStatusStacking = async () => {
      if (userSession.isUserSignedIn()) {
        const args = userSession.loadUserData().profile.stxAddress[localNetwork];
        const statusStacking = await readOnlyAddressStatusStacking(args);
        setFinalStatusStacking(statusStacking);
        dispatch(updateUserRoleActionStacking(finalStatusStacking));
      }
    };

    fetchStatusStacking();

    if (currentRoleStacking === 'Viewer') {
      dispatch(updateUserRoleActionStacking(finalStatusStacking));
    }
  }, [finalStatusStacking]);

  // useEffect(() => {
  //   const fetchStatusMining = async () => {
  //     if (userSession.isUserSignedIn()) {
  //       const args = userSession.loadUserData().profile.stxAddress[localNetwork];
  //       const statusMining = await readOnlyAddressStatusMining(args);
  //       setFinalStatusMining(statusMining);
  //       dispatch(updateUserRoleActionMining(finalStatusMining));
  //     }
  //   };

  //   fetchStatusMining();

  //   if (currentRoleMining === 'Viewer') {
  //     dispatch(updateUserRoleActionStacking(finalStatusStacking));
  //   }
  // }, [finalStatusMining]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setDisplayLogoutIcon(true);
    }
  }, [displayLogoutIcon]);

  useEffect(() => {
    controlAccessRoutes();
  }, [location]);

  return (
    <div>
      <button
        className="Connect"
        style={{ backgroundColor: colors[appCurrentTheme].primary }}
        onClick={displayLogoutIcon ? disconnect : authenticate}
      >
        {displayLogoutIcon && <LogoutIcon style={{ color: colors[appCurrentTheme].headerIcon }} fontSize="medium" />}
        {!displayLogoutIcon && (
          <LoginIcon style={{ color: colors[appCurrentTheme].headerIcon }} fontSize="medium" />
        )}{' '}
      </button>
    </div>
  );
};

export default ConnectWallet;
