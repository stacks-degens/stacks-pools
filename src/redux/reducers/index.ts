import { IUserState, defaultUserState, selectUserSessionState } from './user-state';
import { DISCONNECT_USER_SESSION, CONNECT_USER_SESSION, UPDATE_USER_ROLE } from '../actions';

import { showConnect } from '@stacks/connect';

export interface IinitialState {
  userState: IUserState;
}

const initialState: IinitialState = {
  userState: defaultUserState,
};

interface IreduxAction {
  type: string;
  payload?: any;
}

const mainReducer = (state = initialState, action: IreduxAction) => {
  const userSession = selectUserSessionState(state);
  switch (action.type) {
    case CONNECT_USER_SESSION:
      showConnect({
        appDetails: {
          name: 'Stacks React Starter',
          icon: window.location.origin + '/logo512.png',
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
    default:
      return state;
  }
};

export default mainReducer;
