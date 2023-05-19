import { useEffect, useState } from 'react';
import { selectCurrentUserRole, selectUserSessionState, UserRole } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import {
  readOnlyGetBlocksWon,
  ReadOnlyGetMinersList,
  readOnlyGetNotifier,
  readOnlyGetStacksRewards,
} from '../../../consts/readOnly';
import useCurrentTheme from '../../../consts/theme';
import DashboardInfoContainer from '../../reusableComponents/dashboard/DashboardInfoContainer';
import colors from '../../../consts/colorPallete';
import './styles.css';

const Dashboard = () => {
  const { currentTheme } = useCurrentTheme();
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [minersList, setMinersList] = useState<Array<string>>([]);
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [blocksWon, setBlocksWon] = useState<number | null>(null);
  const [stacksRewards, setStacksRewards] = useState<number | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

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
      const blocks = await readOnlyGetBlocksWon();
      setBlocksWon(blocks);
    };
    getBlocksWon();
  }, [blocksWon]);

  useEffect(() => {
    const getStacksRewards = async () => {
      const stacks = await readOnlyGetStacksRewards();
      setStacksRewards(stacks);
    };
    getStacksRewards();
  }, [stacksRewards]);

  console.log(minersList);

  return (
    <div style={{ color: colors[currentTheme].colorWriting }} className="page-heading-title">
      <h2>Decentralized Mining Pool</h2>
      <h2>Dashboard</h2>
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
