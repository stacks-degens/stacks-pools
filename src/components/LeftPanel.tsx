import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/icons-material/MenuRounded';
import MenuOpen from '@mui/icons-material/MenuOpenRounded';
import HomeIcon from '@mui/icons-material/Home';
import Hardware from '@mui/icons-material/Hardware';
import Poll from '@mui/icons-material/Poll';
import { Link, useLocation } from 'react-router-dom';
import colors from '../consts/colorPallete';
import Home from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAppSelector } from '../redux/store';
import { selectCurrentTheme, selectCurrentUserRole, UserRole } from '../redux/reducers/user-state';
import { useState } from 'react';
import { ExpandLess, ExpandMore, StarBorder } from '@mui/icons-material';
import { Collapse } from '@mui/material';
import '../css/navbars/styles.css';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

interface ConnectWalletProps {
  currentTheme: string;
}

const LeftPanel = ({ currentTheme }: ConnectWalletProps) => {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const [openMiningPoolMenu, setOpenMiningPoolMenu] = useState<boolean>(false);
  const [openVotingMenu, setOpenVotingMenu] = useState<boolean>(false);

  const location = useLocation();

  const handleClickMiningPoolMenuItem = () => {
    setOpenMiningPoolMenu(!openMiningPoolMenu);
  };

  const handleClickVotingMenuItem = () => {
    setOpenVotingMenu(!openVotingMenu);
  };

  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);

  const toggleDrawer = (anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250, height: '100%' }}
      role="presentation"
      style={{ backgroundColor: colors[appCurrentTheme].accent2, color: colors[appCurrentTheme].colorWriting }}
    >
      <List
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
        style={{ backgroundColor: colors[appCurrentTheme].primary }}
      >
        <ListItem disablePadding>
          <div
            style={{
              width: 'auto',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            <ListItemButton>
              <MenuOpen id="open-menu-icon" fontSize="medium" style={{ color: colors[appCurrentTheme].buttons }} />
            </ListItemButton>
          </div>
        </ListItem>
      </List>
      <Divider style={{ backgroundColor: colors[appCurrentTheme].accent2 }} />
      <List style={{ backgroundColor: colors[appCurrentTheme].accent2 }}>
        {/* TODO: keep what fits best, this */}
        <div style={{ marginTop: -10 }}>
          <ListItem
            className={location.pathname === '/' ? 'active-custom' : ''}
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
          >
            <ListItemButton component={Link} to={'/'}>
              <ListItemIcon>
                <HomeIcon style={{ color: colors[appCurrentTheme].secondary }} />
              </ListItemIcon>
              <ListItemText
                className="navbar-sections-font-size"
                style={{ color: colors[appCurrentTheme].secondary }}
                primary="Home"
              />
            </ListItemButton>
          </ListItem>
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
        </div>
        {/* TODO: or this  */}
        {/* <List
        style={{ backgroundColor: colors[currentTheme].accent2 }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      > */}
        <div>
          <ListItem
            className={location.pathname === '/dashboard' ? 'active-custom' : ''}
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
          >
            <ListItemButton component={Link} to={'/dashboard'}>
              <ListItemIcon>
                <Home style={{ color: colors[appCurrentTheme].secondary }} />
              </ListItemIcon>
              <ListItemText
                className="navbar-sections-font-size"
                style={{ color: colors[appCurrentTheme].secondary }}
                primary="Dashboard"
              />
            </ListItemButton>
          </ListItem>
          <Divider variant="middle" style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
        </div>
        {currentRole !== 'Viewer' && (
          <div>
            <ListItem
              className={location.pathname === '/myProfile' ? 'active-custom' : ''}
              onClick={toggleDrawer(anchor, false)}
              onKeyDown={toggleDrawer(anchor, false)}
            >
              <ListItemButton component={Link} to={'/myProfile'}>
                <ListItemIcon>
                  <AccountCircleIcon style={{ color: colors[appCurrentTheme].secondary }} />
                </ListItemIcon>
                <ListItemText
                  className="navbar-sections-font-size"
                  style={{ color: colors[appCurrentTheme].secondary }}
                  primary="Profile"
                />
              </ListItemButton>
            </ListItem>
            <Divider variant="middle" style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
          </div>
        )}
        {currentRole === 'Miner' && (
          <>
            <div>
              <ListItem className="liMenuMiningPool">
                <ListItemButton onClick={handleClickMiningPoolMenuItem}>
                  <ListItemIcon>
                    <Hardware style={{ color: colors[appCurrentTheme].secondary }} />
                  </ListItemIcon>
                  <ListItemText
                    className="navbar-sections-font-size"
                    style={{ color: colors[appCurrentTheme].secondary }}
                    primary="Mining Pool"
                  />
                  {openMiningPoolMenu ? (
                    <ExpandLess style={{ color: colors[appCurrentTheme].secondary }} />
                  ) : (
                    <ExpandMore style={{ color: colors[appCurrentTheme].secondary }} />
                  )}
                </ListItemButton>

                <Collapse
                  in={openMiningPoolMenu}
                  onClick={toggleDrawer(anchor, false)}
                  onKeyDown={toggleDrawer(anchor, false)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List
                    className={location.pathname === '/miningPool/status' ? 'active-custom' : ''}
                    component="div"
                    disablePadding
                  >
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/miningPool/status'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[appCurrentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        className="navbar-sections-font-size"
                        style={{ color: colors[appCurrentTheme].secondary }}
                        primary="Status"
                      />
                    </ListItemButton>
                  </List>
                  <List
                    className={
                      location.pathname === '/miningPool/miners' || location.pathname.slice(0, 8) === '/profile'
                        ? 'active-custom'
                        : ''
                    }
                    component="div"
                    disablePadding
                  >
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/miningPool/miners'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[appCurrentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        className="navbar-sections-font-size"
                        style={{ color: colors[appCurrentTheme].secondary }}
                        primary="Miners"
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              </ListItem>
              <Divider variant="middle" style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
            </div>
            <div>
              <ListItem className="liMenuMiningPool">
                <ListItemButton onClick={handleClickVotingMenuItem}>
                  <ListItemIcon>
                    <Poll style={{ color: colors[appCurrentTheme].secondary }} />
                  </ListItemIcon>
                  <ListItemText
                    className="navbar-sections-font-size"
                    style={{ color: colors[appCurrentTheme].secondary }}
                    primary="Voting"
                  />
                  {openVotingMenu ? (
                    <ExpandLess style={{ color: colors[appCurrentTheme].secondary }} />
                  ) : (
                    <ExpandMore style={{ color: colors[appCurrentTheme].secondary }} />
                  )}
                </ListItemButton>

                <Collapse
                  in={openVotingMenu}
                  onClick={toggleDrawer(anchor, false)}
                  onKeyDown={toggleDrawer(anchor, false)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List
                    className={location.pathname === '/voting' ? 'active-custom' : ''}
                    component="div"
                    disablePadding
                  >
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[appCurrentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        className="navbar-sections-font-size"
                        style={{ color: colors[appCurrentTheme].secondary }}
                        primary="Status"
                      />
                    </ListItemButton>
                  </List>
                  <List
                    className={location.pathname === '/voting/joiners' ? 'active-custom' : ''}
                    component="div"
                    disablePadding
                  >
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting/joiners'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[appCurrentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        className="navbar-sections-font-size"
                        style={{ color: colors[appCurrentTheme].secondary }}
                        primary="Joiners"
                      />
                    </ListItemButton>
                  </List>
                  <List
                    className={location.pathname === '/voting/removals' ? 'active-custom' : ''}
                    component="div"
                    disablePadding
                  >
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting/removals'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[appCurrentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        className="navbar-sections-font-size"
                        style={{ color: colors[appCurrentTheme].secondary }}
                        primary="Removals"
                      />
                    </ListItemButton>
                  </List>
                  <List
                    className={location.pathname === '/voting/notifier' ? 'active-custom' : ''}
                    component="div"
                    disablePadding
                  >
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting/notifier'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[appCurrentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        className="navbar-sections-font-size"
                        style={{ color: colors[appCurrentTheme].secondary }}
                        primary="Notifier"
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              </ListItem>
              <Divider variant="middle" style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
            </div>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <div>
      <React.Fragment key={'left'}>
        <Button onClick={toggleDrawer('left', true)} style={{ color: colors[appCurrentTheme].buttons }}>
          <Menu fontSize="medium" />
        </Button>
        <Drawer anchor={'left'} open={state['left']} onClose={toggleDrawer('left', false)}>
          {list('left')}
        </Drawer>
      </React.Fragment>
    </div>
  );
};

export default LeftPanel;
