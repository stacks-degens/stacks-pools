import { useEffect, useState } from 'react';
import {
  selectCurrentTheme,
  selectCurrentUserRoleMining,
  selectUserSessionState,
  UserRoleMining,
} from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import {
  readOnlyGetBlocksWonMining,
  ReadOnlyGetMinersList,
  readOnlyGetNotifier,
  readOnlyGetStacksRewardsMining,
} from '../../../consts/readOnly';
import DashboardInfoContainer from '../../reusableComponents/dashboard/DashboardInfoContainer';
import colors from '../../../consts/colorPallete';
import './styles.css';
import { network } from '../../../consts/network';

const Dashboard = () => {
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [minersList, setMinersList] = useState<Array<string>>([]);
  const currentRole: UserRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [blocksWon, setBlocksWon] = useState<number | null>(null);
  const [stacksRewards, setStacksRewards] = useState<number | null>(null);
  const userSession = useAppSelector(selectUserSessionState);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const localNetwork = network === 'devnet' ? 'testnet' : network;

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress[localNetwork];
      setUserAddress(args);
    }
  }, [userAddress]);

  useEffect(() => {
    const getMinersList = async () => {
      const { value } = await ReadOnlyGetMinersList();
      const parsedMinersList =
        value.length !== 0 ? value.map((miner: { type: string; value: string }) => miner.value) : [];
      setMinersList(parsedMinersList);
    };

    getMinersList();
  }, []);

  useEffect(() => {
    const getBlocksWon = async () => {
      const blocks = await readOnlyGetBlocksWonMining();
      setBlocksWon(blocks);
    };
    getBlocksWon();
  }, [blocksWon]);

  useEffect(() => {
    const getStacksRewards = async () => {
      const stacks = await readOnlyGetStacksRewardsMining();
      setStacksRewards(stacks);
    };
    getStacksRewards();
  }, [stacksRewards]);

  return (
    <div className="dashboard-page-main-container">
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Dashboard</h2>
      </div>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <DashboardInfoContainer
            notifier={currentNotifier}
            minersList={minersList}
            blocksWon={blocksWon}
            stacksRewards={stacksRewards}
            userAddress={userAddress}
            currentRole={currentRole}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
