import '../App.css';
import HeaderBar from './HeaderBar';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MiningPool from './appMenuSections/miningPool/MiningPool';
import Home from '../components/appMenuSections/home/Home';
import Dashboard from './appMenuSections/dashboard/Dashboard';
import Profile from './appMenuSections/profile/Profile';
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
  ReadOnlyGetMinersList,
  ReadOnlyGetMinersNumber,
  ReadOnlyGetStackersList,
  readOnlyGetAllTotalWithdrawalsMining,
  readOnlyGetBalanceMining,
  readOnlyGetBitcoinRewardsStacking,
  readOnlyGetBlocksRewardedStacking,
  readOnlyGetBlocksWonMining,
  readOnlyGetLiquidityProvider,
  readOnlyGetMinimumDepositLiquidityProviderStacking,
  readOnlyGetNotifier,
  readOnlyGetPoolSpendPerBlock,
  readOnlyGetReturnStacking,
  readOnlyGetSCLockedBalance,
  readOnlyGetSCReservedBalance,
  readOnlyGetStacksRewardsMining,
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
  // GENERAL State Hooks

  const localNetwork = network === 'devnet' ? 'testnet' : network;
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);
  const [currentBurnBlockHeight, setCurrentBurnBlockHeight] = useState<number>(0);
  const [mempoolTxs, setMempoolTxs] = useState([]);

  // STACKING State Hooks

  const currentRole: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [preparePhaseStartBlockHeight, setPreparePhaseStartBlockHeight] = useState<number>(0);
  const [rewardPhaseStartBlockHeight, setRewardPhaseStartBlockHeigh] = useState<number>(0);
  const [stacksAmountThisCycle, setStacksAmountThisCycle] = useState<number | null>(null);
  const [lockedInPool, setLockedInPool] = useState<number>(0);
  const [delegatedToPool, setDelegatedToPool] = useState<number>(0);
  const [userUntilBurnHt, setUserUntilBurnHt] = useState<number>(0);
  const [reservedAmount, setReservedAmount] = useState<number | null>(null);
  const [returnCovered, setReturnCovered] = useState<number | null>(null);
  const [stackersList, setStackersList] = useState<Array<string>>([]);
  const [blocksRewarded, setBlocksRewarded] = useState<number | null>(null);
  const [bitcoinRewards, setBitcoinRewards] = useState<number | null>(null);
  const [minimumDepositProvider, setMinimumDepositProvider] = useState<number | null>(null);

  // MINING State Hooks

  // const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  // const [poolSpendPerBlock, setPoolSpendPerBlock] = useState<number | null>(null);
  // const [minersList, setMinersList] = useState<Array<string>>([]);
  // const [minersNumber, setMinersNumber] = useState<number | null>(null);
  // const [blocksWon, setBlocksWon] = useState<number | null>(null);
  // const [stacksRewards, setStacksRewards] = useState<number | null>(null);
  // const [currentBalance, setCurrentBalance] = useState<number>(0);
  // const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);

  // GENERAL Effect Hooks

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setConnectedWallet(args);
    }
  }, [connectedWallet]);

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
    if (userAddress !== null) {
      setExplorerLink(getExplorerUrl(userAddress).explorerUrl);
    }
  }, [explorerLink, userAddress]);

  // STACKING Effect Hooks

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

  // MINING Effect Hooks

  // useEffect(() => {
  //   const getCurrentNotifier = async () => {
  //     const notifier = await readOnlyGetNotifier();
  //     setCurrentNotifier(notifier);
  //   };

  //   getCurrentNotifier();
  // }, [currentNotifier]);

  // useEffect(() => {
  //   const getSpendPerBlock = async () => {
  //     const notifier = await readOnlyGetPoolSpendPerBlock();
  //     setPoolSpendPerBlock(notifier);
  //   };

  //   getSpendPerBlock();
  // }, [poolSpendPerBlock]);

  // useEffect(() => {
  //   const getMinersList = async () => {
  //     const { value } = await ReadOnlyGetMinersList();
  //     const parsedMinersList =
  //       value.length !== 0 ? value.map((miner: { type: string; value: string }) => miner.value) : [];
  //     setMinersList(parsedMinersList);
  //   };

  //   getMinersList();
  // }, []);

  // useEffect(() => {
  //   const getBlocksWon = async () => {
  //     const blocks = await readOnlyGetBlocksWonMining();
  //     setBlocksWon(blocks);
  //   };
  //   getBlocksWon();
  // }, [blocksWon]);

  // useEffect(() => {
  //   const getStacksRewards = async () => {
  //     const stacks = await readOnlyGetStacksRewardsMining();
  //     setStacksRewards(stacks);
  //   };
  //   getStacksRewards();
  // }, [stacksRewards]);

  // useEffect(() => {
  //   const getMinersNumber = async () => {
  //     const minersNumber = await ReadOnlyGetMinersNumber();
  //     setMinersNumber(minersNumber);
  //   };
  //   getMinersNumber();
  // }, [minersNumber]);

  // useEffect(() => {
  //   const getUserBalance = async () => {
  //     const principalAddress = userSession.loadUserData().profile.stxAddress[localNetwork];
  //     const getTotalWithdrawals = await readOnlyGetAllTotalWithdrawalsMining(principalAddress);
  //     const balance = await readOnlyGetBalanceMining(principalAddress);
  //     setTotalWithdrawals(getTotalWithdrawals);
  //     setCurrentBalance(balance);
  //   };

  //   getUserBalance();
  // }, [currentBalance, totalWithdrawals]);

  // MEMPOOL STACKS API
  // useEffect(() => {
  //   const getCurrentMempoolInfo = async () => {
  //     let mempoolInfoResult;
  //     if (connectedWallet !== null) {
  //       mempoolInfoResult = await fetch(`${apiMapping.mempoolInfo(connectedWallet)}`)
  //         .then((res) => res.json())
  //         .then((res) => res);
  //     }
  //     if (mempoolInfoResult && (await mempoolInfoResult.length) > 0) {
  //       console.log('mempoolInfoResult', mempoolInfoResult);
  //       setMempoolTxs(mempoolInfoResult);
  //       // let cycleBlockNr =
  //       //   (mempoolInfoResult['next_cycle']['reward_phase_start_block_height'] -
  //       //     mempoolInfoResult['next_cycle']['prepare_phase_start_block_height']) *
  //       //   21;
  //       // setCurrentBurnBlockHeight(mempoolInfoResult['current_burnchain_block_height']);
  //       // setCurrentCycle(mempoolInfoResult['current_cycle']['id']);
  //       // setPreparePhaseStartBlockHeight(mempoolInfoResult['next_cycle']['prepare_phase_start_block_height']);
  //       // setRewardPhaseStartBlockHeigh(mempoolInfoResult['next_cycle']['reward_phase_start_block_height'] - cycleBlockNr);
  //     }
  //   };
  //   getCurrentMempoolInfo();
  // }, [mempoolTxs, connectedWallet]);

  // Mining Dashboard

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
        {/* <Route
          path="mining/dashboard"
          index
          element={
            <Dashboard
              currentBurnBlockHeight={currentBurnBlockHeight}
              currentNotifier={currentNotifier}
              minersList={minersList}
              blocksWon={blocksWon}
              stacksRewards={stacksRewards}
              userAddress={userAddress}
              minersNumber={minersNumber}
              poolSpendPerBlock={poolSpendPerBlock}
            />
          }
        />
        <Route path="/mining/pool/miners" element={<MiningPool userAddress={userAddress} />} />
        <Route
          path="mining/myProfile"
          element={
            <Profile
              connectedWallet={connectedWallet}
              explorerLink={explorerLink}
              currentBalance={currentBalance}
              currentNotifier={currentNotifier}
              userAddress={userAddress}
            />
          }
        />
        <Route path="/mining/voting/joiners" element={<VotingJoiners />} />
        <Route path="/mining/voting/removals" element={<VotingRemovals />} />
        <Route path="/mining/voting/notifier" element={<VotingNotifier />} />
        <Route path="/profile/:address" element={<MinerProfileDetails />} /> */}
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
