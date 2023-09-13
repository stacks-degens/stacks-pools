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
import { network, getExplorerUrl, apiMapping } from '../../../consts/network';
import {
  readOnlyGetReturnStacking,
  readOnlyGetSCLockedBalance,
  readOnlyGetSCReservedBalance,
  readOnlyLockedBalanceUser,
} from '../../../consts/readOnly';
import { useLocation, useNavigate } from 'react-router-dom';
import { convertDigits } from '../../../consts/converter';

interface IProfileStackingProps {
  currentBurnBlockHeight: number | null;
  currentCycle: number | null;
  preparePhaseStartBlockHeight: number | null;
  rewardPhaseStartBlockHeight: number | null;
}

const ProfileStacking = ({
  currentBurnBlockHeight,
  currentCycle,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: IProfileStackingProps) => {
  const currentRole: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);
  const [stacksAmountThisCycle, setStacksAmountThisCycle] = useState<number | null>(null);
  const [lockedInPool, setLockedInPool] = useState<number>(0);
  const [delegatedToPool, setDelegatedToPool] = useState<number>(0);
  const [userUntilBurnHt, setUserUntilBurnHt] = useState<number>(0);
  const [reservedAmount, setReservedAmount] = useState<number | null>(null);
  const [returnCovered, setReturnCovered] = useState<number | null>(null);
  const userSession = useAppSelector(selectUserSessionState);
  const localNetwork = network === 'devnet' ? 'testnet' : network;
  // const [currentBurnBlockHeight, setCurrentBurnBlockHeight] = useState<number>(0);
  // const [preparePhaseStartBlockHeight, setPreparePhaseStartBlockHeight] = useState<number>(0);
  // const [rewardPhaseStartBlockHeight, setRewardPhaseStartBlockHeigh] = useState<number>(0);
  // const [currentCycle, setCurrentCycle] = useState<number>(0);
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
  }, [location.pathname, currentRole]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const wallet = userSession.loadUserData().profile.stxAddress[localNetwork];
      setConnectedWallet(wallet);
    } else {
      navigate(`${basePath}`);
    }
  }, [connectedWallet]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setUserAddress(args);
    }
  }, []);

  useEffect(() => {
    if (userAddress !== null) {
      setExplorerLink(getExplorerUrl(userAddress).explorerUrl);
    }
  }, [explorerLink, userAddress]);

  useEffect(() => {
    const getLockedBalance = async () => {
      if (userSession.isUserSignedIn() && (currentRole === 'Stacker' || currentRole === 'Provider')) {
        const wallet = userSession.loadUserData().profile.stxAddress[localNetwork];
        const userLockedData = await readOnlyLockedBalanceUser(wallet, 'locked-balance');
        const userDelegatedData = await readOnlyLockedBalanceUser(wallet, 'delegated-balance');
        const userUntilBurnHtData = await readOnlyLockedBalanceUser(wallet, 'until-burn-ht');
        setLockedInPool(userLockedData);
        setDelegatedToPool(userDelegatedData);
        setUserUntilBurnHt(userUntilBurnHtData);
      }
    };

    getLockedBalance();
  }, [userAddress]);

  useEffect(() => {
    const getReturnCovered = async () => {
      if (userAddress) {
        const returnValue = await readOnlyGetReturnStacking();
        setReturnCovered(parseFloat(returnValue));
      }
    };

    getReturnCovered();
  }, [userAddress]);

  useEffect(() => {
    const getReservedAmount = async () => {
      if (userAddress) {
        const stacks = await readOnlyGetSCReservedBalance();
        setReservedAmount(convertDigits(stacks));
      }
    };
    getReservedAmount();
  }, [reservedAmount, userAddress]);

  useEffect(() => {
    const getSCLockedBalance = async () => {
      if (userAddress) {
        const stacks = await readOnlyGetSCLockedBalance();
        setStacksAmountThisCycle(convertDigits(stacks));
      }
    };
    getSCLockedBalance();
  }, [stacksAmountThisCycle, userAddress]);

  // useEffect(() => {
  //   const getCurrentBlockInfo = async () => {
  //     const blockInfoResult = await fetch(`${apiMapping.stackingInfo}`)
  //       .then((res) => res.json())
  //       .then((res) => res);
  //     if (await blockInfoResult) {
  //       let cycleBlockNr =
  //         (blockInfoResult['next_cycle']['reward_phase_start_block_height'] -
  //           blockInfoResult['next_cycle']['prepare_phase_start_block_height']) *
  //         21;
  //       setCurrentBurnBlockHeight(blockInfoResult['current_burnchain_block_height']);
  //       setCurrentCycle(blockInfoResult['current_cycle']['id']);
  //       setPreparePhaseStartBlockHeight(blockInfoResult['next_cycle']['prepare_phase_start_block_height']);
  //       setRewardPhaseStartBlockHeigh(blockInfoResult['next_cycle']['reward_phase_start_block_height'] - cycleBlockNr);
  //     }
  //   };
  //   getCurrentBlockInfo();
  // }, [setCurrentBurnBlockHeight, setCurrentCycle, setPreparePhaseStartBlockHeight, setRewardPhaseStartBlockHeigh]);

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
