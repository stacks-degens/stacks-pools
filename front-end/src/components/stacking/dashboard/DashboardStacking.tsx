import { useEffect, useState } from 'react';
import {
  UserRoleStacking,
  selectCurrentTheme,
  selectCurrentUserRoleStacking,
  selectUserSessionState,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import DashboardStackingInfo from './DashboardStackingInfo';
import {
  readOnlyGetBitcoinRewardsStacking,
  readOnlyGetBlocksRewardedStacking,
  readOnlyGetLiquidityProvider,
  readOnlyGetMinimumDepositLiquidityProviderStacking,
  readOnlyGetReturnStacking,
  readOnlyGetSCLockedBalance,
  readOnlyGetSCReservedBalance,
  ReadOnlyGetStackersList,
} from '../../../consts/readOnly';
import { network, apiMapping } from '../../../consts/network';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractMapping } from '../../../consts/contract';

import { AppConfig, UserSession } from '@stacks/connect';
import { convertDigits } from '../../../consts/converter';

const DashboardStacking = () => {
  const currentRole: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [stackersList, setStackersList] = useState<Array<string>>([]);
  const [blocksRewarded, setBlocksRewarded] = useState<number | null>(null);
  const [bitcoinRewards, setBitcoinRewards] = useState<number | null>(null);
  const [stacksAmountThisCycle, setStacksAmountThisCycle] = useState<number | null>(null);
  const [reservedAmount, setReservedAmount] = useState<number | null>(null);
  const [returnCovered, setReturnCovered] = useState<number | null>(null);
  const [minimumDepositProvider, setMinimumDepositProvider] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentBurnBlockHeight, setCurrentBurnBlockHeight] = useState<number>(0);
  const [preparePhaseStartBlockHeight, setPreparePhaseStartBlockHeight] = useState<number>(0);
  const [rewardPhaseStartBlockHeight, setRewardPhaseStartBlockHeigh] = useState<number>(0);
  const localNetwork = network === 'devnet' ? 'testnet' : network;
  const userSession = useAppSelector(selectUserSessionState);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

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
        setPreparePhaseStartBlockHeight(blockInfoResult['next_cycle']['prepare_phase_start_block_height']);
        setRewardPhaseStartBlockHeigh(blockInfoResult['next_cycle']['reward_phase_start_block_height'] - cycleBlockNr);
      }
    };
    getCurrentBlockInfo();
  }, [setCurrentBurnBlockHeight, setPreparePhaseStartBlockHeight, setRewardPhaseStartBlockHeigh]);

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
    const getReturnCovered = async () => {
      if (userAddress) {
        const returnValue = await readOnlyGetReturnStacking();
        setReturnCovered(parseFloat(returnValue));
      }
    };

    getReturnCovered();
  }, [userAddress]);

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

  useEffect(() => {
    const getReservedAmount = async () => {
      if (userAddress) {
        const stacks = await readOnlyGetSCReservedBalance();
        setReservedAmount(convertDigits(stacks));
      }
    };
    getReservedAmount();
  }, [reservedAmount, userAddress]);

  return (
    <div className="dashboard-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Stacking Pool</h2>
        <h2>Dashboard</h2>
      </div>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <DashboardStackingInfo
            currentRole={currentRole}
            liquidityProvider={currentLiquidityProvider}
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
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStacking;
