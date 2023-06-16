import { Card, CardHeader, Container, FormControlLabel, Grid, Box } from '@mui/material';
import DarkModeButton from '../consts/lightModeButton';
import ConnectWallet from './ConnectWallet';
import LeftPanel from './LeftPanel';
import colors from '../consts/colorPallete';
import useCurrentTheme from '../consts/theme';

const HeaderBar = () => {
  const { currentTheme, setTheme } = useCurrentTheme();

  const changeTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const isButtonChecked = currentTheme === 'light' ? true : false;

  return (
    <Container
      maxWidth={false}
      disableGutters={true}
      style={{
        backgroundColor: colors[currentTheme].primary,
      }}
    >
      <div className="App">
        <Card
          style={{
            backgroundColor: colors[currentTheme].primary,
          }}
        >
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <CardHeader action={<FormControlLabel control={<LeftPanel currentTheme={currentTheme} />} label="" />} />
            </Grid>
            <Grid item>
              <Box>
                <FormControlLabel
                  control={<DarkModeButton currentTheme={currentTheme} checked={isButtonChecked} />}
                  onChange={changeTheme}
                  label=""
                />
                <FormControlLabel control={<ConnectWallet currentTheme={currentTheme} />} label="" />
              </Box>
            </Grid>
          </Grid>
        </Card>
      </div>
    </Container>
  );
};

export default HeaderBar;
