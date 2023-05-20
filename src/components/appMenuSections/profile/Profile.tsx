import './styles.css';

import {
  selectCurrentTheme,
  selectCurrentUserRole,
  selectUserSessionState,
  UserRole,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import CommonInfoProfile from './CommonInfoProfile';
import MinerProfile from './MinerProfile';
import PendingMinerProfile from './PendingMinerProfile';
import WaitingMinerProfile from './WaitingMinerProfile';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { network, getExplorerUrl } from '../../../consts/network';
import { readOnlyGetAllTotalWithdrawals, readOnlyGetBalance } from '../../../consts/readOnly';

const Profile = () => {
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  // const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | null>(null);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);
  const userSession = useAppSelector(selectUserSessionState);
  const { currentTheme } = useCurrentTheme();

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const profileMapping: Record<UserRole, React.ReactElement> = {
    // Viewer: <CommonInfoProfile />,
    // NormalUser: <CommonInfoProfile />,
    // Waiting: <WaitingMinerProfile />,
    // Pending: <PendingMinerProfile />,
    Viewer: <div></div>,
    NormalUser: <MinerProfile connectedWallet={connectedWallet} explorerLink={explorerLink} />,
    Waiting: <MinerProfile connectedWallet={connectedWallet} explorerLink={explorerLink} />,
    Pending: <MinerProfile connectedWallet={connectedWallet} explorerLink={explorerLink} />,

    Miner: <MinerProfile connectedWallet={connectedWallet} explorerLink={explorerLink} />,
  };

  useEffect(() => {
    const wallet = userSession.loadUserData().profile.stxAddress.testnet;
    setConnectedWallet(wallet);
  }, [connectedWallet]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress.testnet;
      console.log('address', args);
      setUserAddress(args);
    } else {
      console.log('not signed in');
    }
  }, [userAddress]);

  useEffect(() => {
    if (userAddress !== null) {
      setExplorerLink(getExplorerUrl[network](userAddress).explorerUrl);
    }
  }, [explorerLink, userAddress]);

  useEffect(() => {
    const getUserBalance = async () => {
      const principalAddress = userSession.loadUserData().profile.stxAddress.testnet;

      const getTotalWithdrawals = await readOnlyGetAllTotalWithdrawals(principalAddress);
      const balance = await readOnlyGetBalance(principalAddress);
      setTotalWithdrawals(getTotalWithdrawals);
      setCurrentBalance(balance);
    };

    getUserBalance();
  }, [currentBalance, totalWithdrawals]);

  return (
    // <Box
    //   sx={{
    //     // minHeight: 'calc(100vh - 60px)',
    //     height: 'calc(100vh - 60px)',
    //     backgroundColor: colors[currentTheme].accent2,
    //     color: colors[currentTheme].secondary,
    //     // marginTop: -2.5,
    //   }}
    // >
    <div>
      <div>
        {/* <div style={{ color: colors[currentTheme].lightYellow }} className="page-heading-title"> */}
        <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
          <h2>Decentralized Mining Pool</h2>
          <h2>Profile</h2>
        </div>
        {profileMapping[currentRole]}
      </div>
    </div>
  );

  {
    // /* </Box> */
  }
};

export default Profile;
