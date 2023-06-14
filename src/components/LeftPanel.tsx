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
import { Link } from 'react-router-dom';
import colors from '../consts/colorPallete';
import Home from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAppSelector } from '../redux/store';
import { selectCurrentUserRole, UserRole } from '../redux/reducers/user-state';
import { useState } from 'react';
import { ExpandLess, ExpandMore, StarBorder } from '@mui/icons-material';
import { Collapse } from '@mui/material';

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

  const [openMiningPoolMenu, setOpenMiningPoolMenu] = useState<boolean>(true);
  const [openVotingMenu, setOpenVotingMenu] = useState<boolean>(true);

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
      style={{ backgroundColor: colors[currentTheme].accent2 }}
    >
      <List
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
        style={{ backgroundColor: colors[currentTheme].primary }}
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
              <MenuOpen fontSize="medium" style={{ color: colors[currentTheme].buttons }} />
            </ListItemButton>
          </div>
        </ListItem>
      </List>
      <Divider style={{ backgroundColor: colors[currentTheme].accent2 }} />
      <List style={{ backgroundColor: colors[currentTheme].accent2 }}>
        {/* TODO: keep what fits best, this */}
        <div style={{ marginTop: -10 }}>
          <ListItem onClick={toggleDrawer(anchor, false)} onKeyDown={toggleDrawer(anchor, false)}>
            <ListItemButton component={Link} to={'/'}>
              <ListItemIcon>
                <HomeIcon style={{ color: colors[currentTheme].secondary }} />
              </ListItemIcon>
              <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Home" />
            </ListItemButton>
          </ListItem>
          <Divider style={{ backgroundColor: colors[currentTheme].secondary }} />
          <Divider style={{ backgroundColor: colors[currentTheme].secondary }} />
          <Divider style={{ backgroundColor: colors[currentTheme].secondary }} />
        </div>
        {/* TODO: or this  */}
        {/* <List
        style={{ backgroundColor: colors[currentTheme].accent2 }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      > */}
        <div>
          <ListItem onClick={toggleDrawer(anchor, false)} onKeyDown={toggleDrawer(anchor, false)}>
            <ListItemButton component={Link} to={'/dashboard'}>
              <ListItemIcon>
                <Home style={{ color: colors[currentTheme].secondary }} />
              </ListItemIcon>
              <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <Divider variant="middle" style={{ backgroundColor: colors[currentTheme].secondary }} />
        </div>
        {currentRole !== 'Viewer' && (
          <div>
            <ListItem onClick={toggleDrawer(anchor, false)} onKeyDown={toggleDrawer(anchor, false)}>
              <ListItemButton component={Link} to={'/myProfile'}>
                <ListItemIcon>
                  <AccountCircleIcon style={{ color: colors[currentTheme].secondary }} />
                </ListItemIcon>
                <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Profile" />
              </ListItemButton>
            </ListItem>
            <Divider variant="middle" style={{ backgroundColor: colors[currentTheme].secondary }} />
          </div>
        )}
        {currentRole === 'Miner' && (
          <>
            <div>
              <ListItem className="liMenuMiningPool">
                <ListItemButton onClick={handleClickMiningPoolMenuItem}>
                  <ListItemIcon>
                    <Hardware style={{ color: colors[currentTheme].secondary }} />
                  </ListItemIcon>
                  <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Mining Pool" />
                  {openMiningPoolMenu ? (
                    <ExpandLess style={{ color: colors[currentTheme].secondary }} />
                  ) : (
                    <ExpandMore style={{ color: colors[currentTheme].secondary }} />
                  )}
                </ListItemButton>

                <Collapse
                  in={openMiningPoolMenu}
                  onClick={toggleDrawer(anchor, false)}
                  onKeyDown={toggleDrawer(anchor, false)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/miningPool/status'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[currentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Status" />
                    </ListItemButton>
                  </List>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/miningPool/miners'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[currentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Miners" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </ListItem>
              <Divider variant="middle" style={{ backgroundColor: colors[currentTheme].secondary }} />
            </div>
            <div>
              <ListItem className="liMenuMiningPool">
                <ListItemButton onClick={handleClickVotingMenuItem}>
                  <ListItemIcon>
                    <Poll style={{ color: colors[currentTheme].secondary }} />
                  </ListItemIcon>
                  <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Voting" />
                  {openVotingMenu ? (
                    <ExpandLess style={{ color: colors[currentTheme].secondary }} />
                  ) : (
                    <ExpandMore style={{ color: colors[currentTheme].secondary }} />
                  )}
                </ListItemButton>

                <Collapse
                  in={openVotingMenu}
                  onClick={toggleDrawer(anchor, false)}
                  onKeyDown={toggleDrawer(anchor, false)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[currentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Status" />
                    </ListItemButton>
                  </List>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting/joiners'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[currentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Joiners" />
                    </ListItemButton>
                  </List>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting/removals'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[currentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Removals" />
                    </ListItemButton>
                  </List>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} component={Link} to={'/voting/notifier'}>
                      <ListItemIcon>
                        <StarBorder style={{ color: colors[currentTheme].secondary }} />
                      </ListItemIcon>
                      <ListItemText style={{ color: colors[currentTheme].secondary }} primary="Notifier" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </ListItem>
              <Divider variant="middle" style={{ backgroundColor: colors[currentTheme].secondary }} />
            </div>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <div>
      <React.Fragment key={'left'}>
        <Button onClick={toggleDrawer('left', true)} style={{ color: colors[currentTheme].buttons }}>
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
