import { Card, CardHeader, Container, FormControlLabel, Grid, Box } from '@mui/material';
import DarkModeButton from '../consts/lightModeButton';
import ConnectWallet from './ConnectWallet';
import LeftPanel from './LeftPanel';
import colors from '../consts/colorPallete';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { selectCurrentTheme } from '../redux/reducers/user-state';
import { updateAppThemeAction } from '../redux/actions';

const HeaderBar = () => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const dispatch = useAppDispatch();
  const isButtonChecked = appCurrentTheme === 'light' ? true : false;

  return (
    <Container
      maxWidth={false}
      disableGutters={true}
      style={{
        backgroundColor: colors[appCurrentTheme].primary,
      }}
    >
      <div className="App">
        <Card
          style={{
            backgroundColor: colors[appCurrentTheme].primary,
          }}
        >
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <CardHeader
                action={<FormControlLabel control={<LeftPanel currentTheme={appCurrentTheme} />} label="" />}
              />
            </Grid>
            <Grid item>
              <Box>
                <FormControlLabel
                  control={
                    <DarkModeButton
                      onClick={() => {
                        appCurrentTheme === 'light'
                          ? dispatch(updateAppThemeAction('dark'))
                          : dispatch(updateAppThemeAction('light'));
                      }}
                      currentTheme={appCurrentTheme}
                      checked={isButtonChecked}
                    />
                  }
                  label=""
                />
                <FormControlLabel control={<ConnectWallet currentTheme={appCurrentTheme} />} label="" />
              </Box>
            </Grid>
          </Grid>
        </Card>
      </div>
    </Container>
  );
};

export default HeaderBar;
