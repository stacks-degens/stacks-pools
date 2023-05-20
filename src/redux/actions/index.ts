import { IinitialState } from '../reducers';
import { UserRole } from '../reducers/user-state';
import { AppDispatch } from '../store';

export const DISCONNECT_USER_SESSION = 'DISCONNECT_USER_SESSION';
export const CONNECT_USER_SESSION = 'CONNECT_USER_SESSION';
export const UPDATE_USER_ROLE = 'UPDATE_USER_ROLE';
export const UPDATE_APP_THEME = 'UPDATE_APP_THEME';

export const disconnectAction = () => {
  return { type: DISCONNECT_USER_SESSION };
};

export const connectAction = () => {
  return { type: CONNECT_USER_SESSION };
};

// const updateRole = (): Promise<UserRole> => {
//   return Promise.resolve('Miner');
// };

export const updateUserRoleAction = (newRole: string) => {
  return async (dispatch: AppDispatch, getState: () => IinitialState) => {
    try {
      // const userRole = await updateRole();
      // dispatch({ type: UPDATE_USER_ROLE, payload: userRole });
      dispatch({ type: UPDATE_USER_ROLE, payload: newRole });
    } catch (err) {
      console.error('Failed to grab user role');
    }
  };
};

export const updateAppThemeAction = (newTheme: string) => {
  return { type: UPDATE_APP_THEME, payload: newTheme };
};
