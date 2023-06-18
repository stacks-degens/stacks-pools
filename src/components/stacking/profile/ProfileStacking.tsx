import {
  UserRoleStacking,
  selectCurrentTheme,
  selectCurrentUserRoleStacking,
  selectUserSessionState,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import { useEffect, useState } from 'react';
import StackerProfile from './StackerProfile';
import { network, getExplorerUrl } from '../../../consts/network';
import { readOnlyLockedBalanceUser } from '../../../consts/readOnly';

const ProfileStacking = () => {
  const currentRole: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);
  const [lockedInPool, setLockedInPool] = useState<number>(0);
  const [delegatedToPool, setDelegatedToPool] = useState<number>(0);
  const [userUntilBurnHt, setUserUntilBurnHt] = useState<number>(0);
  const userSession = useAppSelector(selectUserSessionState);

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
    const getLockedBalance = async () => {
      const wallet = userSession.loadUserData().profile.stxAddress.testnet;
      console.log(wallet);
      const userLockedData = await readOnlyLockedBalanceUser(wallet, 'locked-balance');
      const userDelegatedData = await readOnlyLockedBalanceUser(wallet, 'delegated-balance');
      const userUntilBurnHtData = await readOnlyLockedBalanceUser(wallet, 'until-burn-ht');
      setLockedInPool(userLockedData);
      setDelegatedToPool(userDelegatedData);
      setUserUntilBurnHt(userUntilBurnHtData);
    };

    getLockedBalance();
  }, []);

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
          delegatedToPool={delegatedToPool}
          userUntilBurnHt={userUntilBurnHt}
        />
      )}
    </div>
  );
};

export default ProfileStacking;
