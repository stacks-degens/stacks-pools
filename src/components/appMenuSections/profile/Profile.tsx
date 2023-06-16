import { selectCurrentUserRole, UserRole } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import CommonInfoProfile from './CommonInfoProfile';
import MinerProfile from './MinerProfile';
import PendingMinerProfile from './PendingMinerProfile';
import WaitingMinerProfile from './WaitingMinerProfile';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const Profile = () => {
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const { currentTheme } = useCurrentTheme();

  const profileMapping: Record<UserRole, React.ReactElement> = {
    Viewer: <CommonInfoProfile />,
    NormalUser: <CommonInfoProfile />,
    Waiting: <WaitingMinerProfile />,
    Pending: <PendingMinerProfile />,
    Miner: <MinerProfile />,
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: colors[currentTheme].accent2,
        color: colors[currentTheme].secondary,
        marginTop: -2.5,
      }}
    >
      <div>
        <h2>Profile</h2>
        {profileMapping[currentRole]}
      </div>
    </Box>
  );
};

export default Profile;
