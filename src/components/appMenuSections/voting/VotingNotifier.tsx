import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const VotingNotifier = () => {
  const { currentTheme } = useCurrentTheme();
  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', 
      backgroundColor: colors[currentTheme].accent2, 
      color: colors[currentTheme].secondary,
      marginTop: -2.5 }}>
      <div>
        <h2>Voting - Notifier</h2>
        <div>some table here</div>
      </div>
    </Box>
  );
};

export default VotingNotifier;
