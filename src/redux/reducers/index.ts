import { IUserState, defaultUserState, selectUserSessionState } from './user-state';
import { DISCONNECT_USER_SESSION, CONNECT_USER_SESSION, UPDATE_USER_ROLE, UPDATE_APP_THEME } from '../actions';

import { showConnect } from '@stacks/connect';
import logo from './../../logo.png';

export interface IinitialState {
  userState: IUserState;
  theme: Theme;
}

export type Theme = 'light' | 'dark';

const initialState: IinitialState = {
  userState: defaultUserState,
  theme: 'light',
};

interface IreduxAction {
  type: string;
  payload?: any; // know the type?
}

const mainReducer = (state = initialState, action: IreduxAction) => {
  const userSession = selectUserSessionState(state);
  switch (action.type) {
    case CONNECT_USER_SESSION:
      showConnect({
        appDetails: {
          name: 'Stacks Decentralized Pools',
          icon: logo,
        },
        redirectTo: '/',
        onFinish: () => {
          window.location.reload();
        },
        userSession,
      });
      return state;
    case DISCONNECT_USER_SESSION:
      state.userState.userSession.signUserOut('/dashboard');
      console.log('Disconnect');
      return state;
    case UPDATE_USER_ROLE:
      return { ...state, userState: { ...state.userState, userRole: action.payload } };

    case UPDATE_APP_THEME:
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

export default mainReducer;
