import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const Voting = () => {
  const { currentTheme } = useCurrentTheme();

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', 
      backgroundColor: colors[currentTheme].accent2, 
      color: colors[currentTheme].secondary,
      marginTop: -2.5 }}>
      <div>
        <h2>Voting dashboard</h2>
        <ul>
          <li>notifier</li>
          <li>status</li>
        </ul>
        <h4>notifier results from last round</h4>
      </div>
    </Box>
  );
};

export default Voting;
