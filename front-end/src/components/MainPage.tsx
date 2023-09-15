import '../App.css';
import HeaderBar from './HeaderBar';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MiningPool from './appMenuSections/miningPool/MiningPool';
import Voting from './appMenuSections/voting/Voting';
import Home from '../components/appMenuSections/home/Home';
import Dashboard from './appMenuSections/dashboard/Dashboard';
import Profile from './appMenuSections/profile/Profile';
import MiningPoolStatus from './appMenuSections/miningPool/MiningPoolStatus';
import VotingJoiners from './appMenuSections/voting/VotingJoiners';
import VotingRemovals from './appMenuSections/voting/VotingRemovals';
import VotingNotifier from './appMenuSections/voting/VotingNotifier';
import MinerProfileDetails from './appMenuSections/profile/MinerProfileDetails';
import DashboardStacking from './stacking/dashboard/DashboardStacking';
import ProfileStacking from './stacking/profile/ProfileStacking';
import { useEffect, useState } from 'react';
import { apiMapping, getExplorerUrl, network } from '../consts/network';
import { UserRoleStacking, selectCurrentUserRoleStacking, userSession } from '../redux/reducers/user-state';
import { useAppSelector } from '../redux/store';
import {
  ReadOnlyGetStackersList,
  readOnlyGetBitcoinRewardsStacking,
  readOnlyGetBlocksRewardedStacking,
  readOnlyGetLiquidityProvider,
  readOnlyGetMinimumDepositLiquidityProviderStacking,
  readOnlyGetReturnStacking,
  readOnlyGetSCLockedBalance,
  readOnlyGetSCReservedBalance,
  readOnlyLockedBalanceUser,
} from '../consts/readOnly';
import { convertDigits } from '../consts/converter';
import { contractMapping } from '../consts/contract';

const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/stacking/dashboard');
  }, []);

  return null;
};

const MainPage = () => {
  const [currentBurnBlockHeight, setCurrentBurnBlockHeight] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [preparePhaseStartBlockHeight, setPreparePhaseStartBlockHeight] = useState<number>(0);
  const [rewardPhaseStartBlockHeight, setRewardPhaseStartBlockHeigh] = useState<number>(0);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);
  const [stacksAmountThisCycle, setStacksAmountThisCycle] = useState<number | null>(null);
  const [lockedInPool, setLockedInPool] = useState<number>(0);
  const [delegatedToPool, setDelegatedToPool] = useState<number>(0);
  const [userUntilBurnHt, setUserUntilBurnHt] = useState<number>(0);
  const [reservedAmount, setReservedAmount] = useState<number | null>(null);
  const [returnCovered, setReturnCovered] = useState<number | null>(null);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [stackersList, setStackersList] = useState<Array<string>>([]);
  const [blocksRewarded, setBlocksRewarded] = useState<number | null>(null);
  const [bitcoinRewards, setBitcoinRewards] = useState<number | null>(null);
  const [minimumDepositProvider, setMinimumDepositProvider] = useState<number | null>(null);
  const currentRole: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const localNetwork = network === 'devnet' ? 'testnet' : network;

  useEffect(() => {
    const getCurrentBlockInfo = async () => {
      const blockInfoResult = await fetch(`${apiMapping.stackingInfo}`)
        .then((res) => res.json())
        .then((res) => res);
      if (await blockInfoResult) {
        let cycleBlockNr =
          (blockInfoResult['next_cycle']['reward_phase_start_block_height'] -
            blockInfoResult['next_cycle']['prepare_phase_start_block_height']) *
          21;
        setCurrentBurnBlockHeight(blockInfoResult['current_burnchain_block_height']);
        setCurrentCycle(blockInfoResult['current_cycle']['id']);
        setPreparePhaseStartBlockHeight(blockInfoResult['next_cycle']['prepare_phase_start_block_height']);
        setRewardPhaseStartBlockHeigh(blockInfoResult['next_cycle']['reward_phase_start_block_height'] - cycleBlockNr);
      }
    };
    getCurrentBlockInfo();
  }, [setCurrentBurnBlockHeight, setCurrentCycle, setPreparePhaseStartBlockHeight, setRewardPhaseStartBlockHeigh]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setConnectedWallet(args);
    }
  }, [connectedWallet]);

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
  //       setPreparePhaseStartBlockHeight(blockInfoResult['next_cycle']['prepare_phase_start_block_height']);
  //       setRewardPhaseStartBlockHeigh(blockInfoResult['next_cycle']['reward_phase_start_block_height'] - cycleBlockNr);
  //     }
  //   };
  //   getCurrentBlockInfo();
  // }, [setCurrentBurnBlockHeight, setPreparePhaseStartBlockHeight, setRewardPhaseStartBlockHeigh]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setUserAddress(args);
    } else {
      const defaultAddressWhenUserNotLoggedIn = contractMapping.stacking[network].owner;
      setUserAddress(defaultAddressWhenUserNotLoggedIn);
    }
  }, []);

  useEffect(() => {
    const getCurrentLiquidityProvider = async () => {
      if (userAddress) {
        const liquidityProvider = await readOnlyGetLiquidityProvider();
        setCurrentLiquidityProvider(liquidityProvider);
      }
    };

    getCurrentLiquidityProvider();
  }, [currentLiquidityProvider, userAddress]);

  useEffect(() => {
    const getMinimumDepositProvider = async () => {
      if (userAddress) {
        const minimum = await readOnlyGetMinimumDepositLiquidityProviderStacking();
        setMinimumDepositProvider(convertDigits(minimum));
      }
    };

    getMinimumDepositProvider();
  }, [userAddress]);

  useEffect(() => {
    const getStackersList = async () => {
      if (userAddress) {
        const { value } = await ReadOnlyGetStackersList();
        const parsedStackersList =
          value.length !== 0 ? value.map((stacker: { type: string; value: string }) => stacker.value) : [];
        setStackersList(parsedStackersList);
      }
    };

    getStackersList();
  }, [userAddress]);

  useEffect(() => {
    const getBlocksRewarded = async () => {
      if (userAddress) {
        const blocks = await readOnlyGetBlocksRewardedStacking();
        setBlocksRewarded(blocks);
      }
    };
    getBlocksRewarded();
  }, [blocksRewarded, userAddress]);

  useEffect(() => {
    const getBitcoinRewards = async () => {
      if (userAddress) {
        const bitcoin = await readOnlyGetBitcoinRewardsStacking();
        setBitcoinRewards(convertDigits(bitcoin));
      }
    };
    getBitcoinRewards();
  }, [bitcoinRewards, userAddress]);

  useEffect(() => {
    const getSCLockedBalance = async () => {
      if (userAddress) {
        const stacks = await readOnlyGetSCLockedBalance();
        setStacksAmountThisCycle(convertDigits(stacks));
      }
    };
    getSCLockedBalance();
  }, [stacksAmountThisCycle, userAddress]);

  return (
    <div
      style={{
        backgroundColor: 'inherit',
      }}
    >
      <div>
        <HeaderBar />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="mining/dashboard" index element={<Dashboard />} />
        <Route path="/mining/pool/miners" element={<MiningPool />} />
        <Route path="/mining/voting" element={<Voting />} />
        <Route path="mining/myProfile" element={<Profile />} />
        <Route path="/mining/pool/status" element={<MiningPoolStatus />} />
        <Route path="/mining/voting/joiners" element={<VotingJoiners />} />
        <Route path="/mining/voting/removals" element={<VotingRemovals />} />
        <Route path="/mining/voting/notifier" element={<VotingNotifier />} /> */}
        <Route path="/profile/:address" element={<MinerProfileDetails />} />
        <Route path="/stacking" element={<RedirectToDashboard />} />
        <Route
          path="/stacking/dashboard"
          element={
            <DashboardStacking
              currentLiquidityProvider={currentLiquidityProvider}
              stackersList={stackersList}
              blocksRewarded={blocksRewarded}
              bitcoinRewards={bitcoinRewards}
              stacksAmountThisCycle={stacksAmountThisCycle}
              reservedAmount={reservedAmount}
              returnCovered={returnCovered}
              minimumDepositProvider={minimumDepositProvider}
              userAddress={userAddress}
              currentBurnBlockHeight={currentBurnBlockHeight}
              preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
              rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
              currentRole={currentRole}
            />
          }
        />
        <Route
          path="/stacking/myProfile"
          element={
            <ProfileStacking
              currentBurnBlockHeight={currentBurnBlockHeight !== null ? currentBurnBlockHeight : 0}
              currentCycle={currentCycle !== null ? currentCycle : 0}
              preparePhaseStartBlockHeight={preparePhaseStartBlockHeight !== null ? preparePhaseStartBlockHeight : 0}
              rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight !== null ? rewardPhaseStartBlockHeight : 0}
              connectedWallet={connectedWallet !== null ? connectedWallet : ''}
              explorerLink={explorerLink !== null ? explorerLink : ''}
              userAddress={userAddress !== null ? userAddress : ''}
              lockedInPool={lockedInPool !== null ? lockedInPool : 0}
              stacksAmountThisCycle={stacksAmountThisCycle !== null ? stacksAmountThisCycle : 0}
              delegatedToPool={delegatedToPool !== null ? delegatedToPool : 0}
              reservedAmount={reservedAmount !== null ? reservedAmount : 0}
              returnCovered={returnCovered !== null ? returnCovered : 0}
              userUntilBurnHt={userUntilBurnHt !== null ? userUntilBurnHt : 0}
              currentRole={currentRole !== null ? currentRole : 'Viewer'}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default MainPage;
