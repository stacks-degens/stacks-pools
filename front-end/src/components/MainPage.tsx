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
import { apiMapping } from '../consts/network';

const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/stacking/dashboard');
  }, [navigate]);

  return null;
};

const MainPage = () => {
  const [currentBurnBlockHeight, setCurrentBurnBlockHeight] = useState<number | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [preparePhaseStartBlockHeight, setPreparePhaseStartBlockHeight] = useState<number>(0);
  const [rewardPhaseStartBlockHeight, setRewardPhaseStartBlockHeigh] = useState<number>(0);

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
        <Route path="mining/dashboard" index element={<Dashboard currentBurnBlockHeight={currentBurnBlockHeight} />} />
        <Route path="/mining/pool/miners" element={<MiningPool />} />
        <Route path="/mining/voting" element={<Voting />} />
        <Route path="mining/myProfile" element={<Profile />} />
        <Route path="/mining/pool/status" element={<MiningPoolStatus />} />
        <Route path="/mining/voting/joiners" element={<VotingJoiners />} />
        <Route path="/mining/voting/removals" element={<VotingRemovals />} />
        <Route path="/mining/voting/notifier" element={<VotingNotifier />} />
        <Route path="/profile/:address" element={<MinerProfileDetails />} />
        <Route path="/stacking" element={<RedirectToDashboard />} />
        <Route path="/stacking/dashboard" element={<DashboardStacking />} />
        <Route
          path="/stacking/myProfile"
          element={
            <ProfileStacking
              currentBurnBlockHeight={currentBurnBlockHeight}
              currentCycle={currentCycle}
              preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
              rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default MainPage;
