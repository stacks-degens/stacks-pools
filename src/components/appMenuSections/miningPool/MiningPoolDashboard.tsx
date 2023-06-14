import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const MiningPoolDashboard = () => {
  const { currentTheme } = useCurrentTheme()

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', 
      backgroundColor: colors[currentTheme].accent2, 
      color: colors[currentTheme].secondary,
      marginTop: -2.7 }}>
      <div>
        <h4>General info about the mining pool (widgets/statistics - short)</h4>
        <ul>
          <li>ongoing block</li>
          <li>mining performance</li>
          <li>notifier voting status</li>
        </ul>
        <h4>Detailed info about the mining pool (widgets/statistics for all existing blocks)</h4>
        <ul>
          <li>last winner bloack id</li>
          <li>number of blocks won</li>
          <li>mining performance</li>
          <li>voting history</li>
        </ul>
      </div>
    </Box>
  );
};
export default MiningPoolDashboard;
