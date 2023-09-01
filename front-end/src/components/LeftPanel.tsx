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
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useAppSelector } from '../redux/store';
import {
  selectCurrentTheme,
  selectCurrentUserRoleMining,
  selectCurrentUserRoleStacking,
  UserRoleMining,
  UserRoleStacking,
} from '../redux/reducers/user-state';
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
  const [openStackingMenu, setOpenStackingMenu] = useState<boolean>(false);
  const [openMiningMenu, setOpenMiningMenu] = useState<boolean>(false);

  const location = useLocation();

  const handleClickMiningPoolMenuItem = () => {
    setOpenMiningPoolMenu(!openMiningPoolMenu);
  };

  const handleClickVotingMenuItem = () => {
    setOpenVotingMenu(!openVotingMenu);
  };

  const handleClickStackingMenu = () => {
    setOpenStackingMenu(!openStackingMenu);
  };

  const handleClickMiningMenu = () => {
    setOpenMiningMenu(!openMiningMenu);
  };

  // const currentRoleMining: UserRoleMining = useAppSelector(selectCurrentUserRoleMining);
  const currentRoleStacking: UserRoleStacking = useAppSelector(selectCurrentUserRoleStacking);

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
            className={
              location.pathname === '/stacking/myProfile' || location.pathname === '/stacking/dashboard'
                ? 'active-custom'
                : ''
            }
            // onClick={toggleDrawer(anchor, false)}
            // onKeyDown={toggleDrawer(anchor, false)}
          >
            <ListItemButton onClick={handleClickStackingMenu}>
              <ListItemIcon>
                {!openStackingMenu && (
                  <KeyboardDoubleArrowDownIcon style={{ color: colors[appCurrentTheme].secondary }} />
                )}
                {openStackingMenu && <KeyboardDoubleArrowUpIcon style={{ color: colors[appCurrentTheme].secondary }} />}
              </ListItemIcon>
              <ListItemText
                className="navbar-sections-font-size"
                style={{ color: colors[appCurrentTheme].secondary }}
                primary="Stacking"
              />
            </ListItemButton>
          </ListItem>
          <Collapse
            in={openStackingMenu}
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
            timeout="auto"
            unmountOnExit
          >
            <Divider variant="middle" style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
            <div>
              <ListItem
                className={location.pathname === '/stacking/dashboard' ? 'active-custom' : ''}
                onClick={toggleDrawer(anchor, false)}
                onKeyDown={toggleDrawer(anchor, false)}
              >
                <ListItemButton
                  component={Link}
                  to={'/stacking/dashboard'}
                  className="padding-left-sidebar-main-sections"
                >
                  <ListItemIcon>
                    <SpaceDashboardIcon style={{ color: colors[appCurrentTheme].secondary }} />
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
            {(currentRoleStacking === 'Provider' || currentRoleStacking === 'Stacker') && (
              <div>
                <ListItem
                  className={location.pathname === '/stacking/myProfile' ? 'active-custom' : ''}
                  onClick={toggleDrawer(anchor, false)}
                  onKeyDown={toggleDrawer(anchor, false)}
                >
                  <ListItemButton
                    component={Link}
                    to={'/stacking/myProfile'}
                    className="padding-left-sidebar-main-sections"
                  >
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
              </div>
            )}
          </Collapse>
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
        </div>
        <div>
          {/* <ListItem
            className={
              location.pathname === '/mining/myProfile' ||
              location.pathname === '/mining/dashboard' ||
              location.pathname === '/mining/pool/status' ||
              location.pathname === '/mining/pool/miners' ||
              location.pathname.slice(0, 8) === '/profile' ||
              location.pathname === '/mining/voting/joiners' ||
              location.pathname === '/mining/voting/removals' ||
              location.pathname === '/mining/voting/notifier' ||
              location.pathname === '/mining/voting'
                ? 'active-custom'
                : ''
            }
            // onClick={toggleDrawer(anchor, false)}
            // onKeyDown={toggleDrawer(anchor, false)}
          >
            <ListItemButton onClick={handleClickMiningMenu}>
              <ListItemIcon>
                {!openMiningMenu && (<KeyboardDoubleArrowDownIcon style={{ color: colors[appCurrentTheme].secondary }} />)}
                {openMiningMenu && (<KeyboardDoubleArrowUpIcon style={{ color: colors[appCurrentTheme].secondary }} />)}
              </ListItemIcon>
              <ListItemText
                className="navbar-sections-font-size"
                style={{ color: colors[appCurrentTheme].secondary }}
                primary="Mining"
              />
            </ListItemButton>
          </ListItem> */}
          <Collapse in={openMiningMenu} timeout="auto" unmountOnExit>
            <Divider variant="middle" style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
            <div>
              <ListItem
                className={location.pathname === '/mining/dashboard' ? 'active-custom' : ''}
                onClick={toggleDrawer(anchor, false)}
                onKeyDown={toggleDrawer(anchor, false)}
              >
                <ListItemButton
                  component={Link}
                  to={'/mining/dashboard'}
                  className="padding-left-sidebar-main-sections"
                >
                  <ListItemIcon>
                    <SpaceDashboardIcon style={{ color: colors[appCurrentTheme].secondary }} />
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
            {/* {currentRoleMining !== 'Viewer' && (
              <div>
                <ListItem
                  className={location.pathname === '/mining/myProfile' ? 'active-custom' : ''}
                  onClick={toggleDrawer(anchor, false)}
                  onKeyDown={toggleDrawer(anchor, false)}
                >
                  <ListItemButton
                    component={Link}
                    to={'/mining/myProfile'}
                    className="padding-left-sidebar-main-sections"
                  >
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
            {currentRoleMining === 'Miner' && (
              <>
                <div>
                  <ListItem className="liMenuMiningPool">
                    <ListItemButton
                      onClick={handleClickMiningPoolMenuItem}
                      className="padding-left-sidebar-main-sections"
                    >
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
                        className={location.pathname === '/mining/pool/status' ? 'active-custom' : ''}
                        component="div"
                        disablePadding
                      >
                        <ListItemButton
                          sx={{ pl: 4 }}
                          component={Link}
                          to={'/mining/pool/status'}
                          className="padding-left-sidebar-inner-sections"
                        >
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
                          location.pathname === '/mining/pool/miners' || location.pathname.slice(0, 8) === '/profile'
                            ? 'active-custom'
                            : ''
                        }
                        component="div"
                        disablePadding
                      >
                        <ListItemButton
                          sx={{ pl: 4 }}
                          component={Link}
                          to={'/mining/pool/miners'}
                          className="padding-left-sidebar-inner-sections"
                        >
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
                    <ListItemButton onClick={handleClickVotingMenuItem} className="padding-left-sidebar-main-sections">
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
                        className={location.pathname === '/mining/voting' ? 'active-custom' : ''}
                        component="div"
                        disablePadding
                      >
                        <ListItemButton
                          sx={{ pl: 4 }}
                          component={Link}
                          to={'/mining/voting'}
                          className="padding-left-sidebar-inner-sections"
                        >
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
                        className={location.pathname === '/mining/voting/joiners' ? 'active-custom' : ''}
                        component="div"
                        disablePadding
                      >
                        <ListItemButton
                          sx={{ pl: 4 }}
                          component={Link}
                          to={'/mining/voting/joiners'}
                          className="padding-left-sidebar-inner-sections"
                        >
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
                        className={location.pathname === '/mining/voting/removals' ? 'active-custom' : ''}
                        component="div"
                        disablePadding
                      >
                        <ListItemButton
                          sx={{ pl: 4 }}
                          component={Link}
                          to={'/mining/voting/removals'}
                          className="padding-left-sidebar-inner-sections"
                        >
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
                        className={location.pathname === '/mining/voting/notifier' ? 'active-custom' : ''}
                        component="div"
                        disablePadding
                      >
                        <ListItemButton
                          sx={{ pl: 4 }}
                          component={Link}
                          to={'/mining/voting/notifier'}
                          className="padding-left-sidebar-inner-sections"
                        >
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
                </div>
              </>
            )} */}
          </Collapse>
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
          <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} />
          {/* <Divider style={{ backgroundColor: colors[appCurrentTheme].secondary }} /> */}
        </div>
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
