import { IUserState, defaultUserState, selectUserSessionState } from './user-state';
import {
  DISCONNECT_USER_SESSION,
  CONNECT_USER_SESSION,
  UPDATE_USER_ROLE_MINING,
  UPDATE_APP_THEME,
  UPDATE_USER_ROLE_STACKING,
} from '../actions';

import { showConnect } from '@stacks/connect';

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
          icon: 'https://res.cloudinary.com/dltehevwk/image/upload/v1694105316/degen_lab/logo/512/logo_light_full_transparent.png',
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
      return state;
    case UPDATE_USER_ROLE_MINING:
      return { ...state, userState: { ...state.userState, miningUserRole: action.payload } };

    case UPDATE_APP_THEME:
      return { ...state, theme: action.payload };

    case UPDATE_USER_ROLE_STACKING:
      return { ...state, userState: { ...state.userState, stackingUserRole: action.payload } };
    default:
      return state;
  }
};

export default mainReducer;
