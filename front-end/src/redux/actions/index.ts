import { IinitialState } from '../reducers';
import { UserRoleMining } from '../reducers/user-state';
import { AppDispatch } from '../store';

export const DISCONNECT_USER_SESSION = 'DISCONNECT_USER_SESSION';
export const CONNECT_USER_SESSION = 'CONNECT_USER_SESSION';
export const UPDATE_USER_ROLE_MINING = 'UPDATE_USER_ROLE_MINING';
export const UPDATE_USER_ROLE_STACKING = 'UPDATE_USER_ROLE_STACKING';
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

export const updateUserRoleActionMining = (newRole: string) => {
  return async (dispatch: AppDispatch, getState: () => IinitialState) => {
    try {
      // const userRole = await updateRole();
      // dispatch({ type: UPDATE_USER_ROLE, payload: userRole });
      dispatch({ type: UPDATE_USER_ROLE_MINING, payload: newRole });
    } catch (err) {
      console.error('Failed to grab user role for mining');
    }
  };
};

export const updateAppThemeAction = (newTheme: string) => {
  localStorage.setItem('theme', newTheme);
  return { type: UPDATE_APP_THEME, payload: newTheme };
};

export const updateUserRoleActionStacking = (newRole: string) => {
  return async (dispatch: AppDispatch, getState: () => IinitialState) => {
    try {
      dispatch({ type: UPDATE_USER_ROLE_STACKING, payload: newRole });
    } catch (err) {
      console.error('Failed to grab user role for stacking');
    }
  };
};
