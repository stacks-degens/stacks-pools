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
  // readOnlyAddressStatusMining,
  readOnlyAddressStatusStacking,
  readOnlyGetLiquidityProvider,
} from '../consts/readOnly';
import { network } from '../consts/network';

interface ConnectWalletProps {
  currentTheme: string;
}

const ConnectWallet = ({ currentTheme }: ConnectWalletProps) => {
  const [finalStatusMining, setFinalStatusMining] = useState<string>('Viewer');
  const [finalStatusStacking, setFinalStatusStacking] = useState<string>('Viewer');
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const currentRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const currentRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const localNetwork = network === 'devnet' ? 'testnet' : network;
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setUserAddress(args);
    }
  }, [userAddress]);

  const controlAccessRoutes = () => {
    if (location.pathname !== '/') {
      if (location.pathname.substring(1)?.toLowerCase() !== currentRoleMining.toLowerCase()) {
        console.log('Seems like you got lost, click here to go back to the main page');
      }
    }
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const wallet = userSession.loadUserData().profile.stxAddress[localNetwork];
      setConnectedWallet(wallet);
    }
  }, [connectedWallet]);

  // useEffect(() => {
  //   const fetchStatus = async () => {
  //     if (userSession.isUserSignedIn()) {
  //       const args = userSession.loadUserData().profile.stxAddress[localNetwork];
  //       const statusMining = await readOnlyAddressStatusMining(args);
  //       setFinalStatusMining(statusMining);
  //       updateUserRoleActionMining(finalStatusMining);
  //     }
  //   };

  //   fetchStatus();
  // }, [finalStatusMining]);

  // useEffect(() => {
  //   const getCurrentLiquidityProvider = async () => {
  //     const liquidityProvider = await readOnlyGetLiquidityProvider();
  //     setCurrentLiquidityProvider(liquidityProvider);
  //   };

  //   getCurrentLiquidityProvider();
  // }, [currentLiquidityProvider]);

  useEffect(() => {
    const fetchStatusStacking = async () => {
      if (userSession.isUserSignedIn()) {
        const args = userSession.loadUserData().profile.stxAddress[localNetwork];
        const statusStacking = await readOnlyAddressStatusStacking(args);
        setFinalStatusStacking(statusStacking);
        updateUserRoleActionStacking(finalStatusStacking);
      }
    };

    fetchStatusStacking();
  }, [finalStatusStacking]);

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
    if (currentRoleMining === 'Viewer') {
      dispatch(updateUserRoleActionMining(finalStatusMining));
    }
    if (currentRoleStacking === 'Viewer') {
      dispatch(updateUserRoleActionStacking(finalStatusStacking));
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
