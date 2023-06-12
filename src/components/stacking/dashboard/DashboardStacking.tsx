import { useEffect, useState } from 'react';
import {
  selectCurrentTheme,
  selectCurrentUserRoleMining,
  selectUserSessionState,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { UserRoleMining } from '../../../redux/reducers/user-state';
import './styles.css';
import colors from '../../../consts/colorPallete';
import DashboardStackingInfo from './DashboardStackingInfo';
import {
  readOnlyGetBitcoinRewardsStacking,
  readOnlyGetBlocksRewardedStacking,
  readOnlyGetLiquidityProvider,
  readOnlyGetStackAmounThisCycleStacking,
  ReadOnlyGetStackersList,
} from '../../../consts/readOnly';

const DashboardStacking = () => {
  const currentRole: UserRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [stackersList, setStackersList] = useState<Array<string>>([]);
  const [blocksRewarded, setBlocksRewarded] = useState<number | null>(null);
  const [bitcoinRewards, setBitcoinRewards] = useState<number | null>(null);
  const [stacksAmountThisCycle, setStacksAmountThisCycle] = useState<number | null>(null);

  const userSession = useAppSelector(selectUserSessionState);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  useEffect(() => {
    const getCurrentLiquidityProvider = async () => {
      const liquidityProvider = await readOnlyGetLiquidityProvider();
      setCurrentLiquidityProvider(liquidityProvider);
      console.log('provider', currentLiquidityProvider);
    };

    getCurrentLiquidityProvider();
  }, [currentLiquidityProvider]);

  useEffect(() => {
    const getStackersList = async () => {
      const { value } = await ReadOnlyGetStackersList();
      const parsedStackersList =
        value.length !== 0 ? value.map((stacker: { type: string; value: string }) => stacker.value) : [];
      setStackersList(parsedStackersList);
    };

    getStackersList();
  }, []);

  useEffect(() => {
    const getBlocksRewarded = async () => {
      const blocks = await readOnlyGetBlocksRewardedStacking();
      setBlocksRewarded(blocks);
    };
    getBlocksRewarded();
  }, [blocksRewarded]);

  useEffect(() => {
    const getBitcoinRewards = async () => {
      const bitcoin = await readOnlyGetBitcoinRewardsStacking();
      setBitcoinRewards(bitcoin);
    };
    getBitcoinRewards();
  }, [bitcoinRewards]);

  useEffect(() => {
    const getStacksAmountThisCycle = async () => {
      const stacks = await readOnlyGetStackAmounThisCycleStacking();
      setStacksAmountThisCycle(stacks);
    };
    getStacksAmountThisCycle();
  }, [stacksAmountThisCycle]);

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
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStacking;
