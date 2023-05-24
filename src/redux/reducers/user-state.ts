import { AppConfig, UserSession } from '@stacks/connect';
import { IinitialState } from '.';

export interface IUserState {
  userSession: UserSession;
  userRole: UserRole;
  // theme: Theme;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const defaultUserState: IUserState = {
  userSession,
  userRole: 'Viewer',
  // theme: 'light',
};

export type Theme = 'light' | 'dark';

export type UserRole = 'Miner' | 'NormalUser' | 'Pending' | 'Waiting' | 'Viewer';

export const selectUserState = (state: IinitialState) => state.userState;
export const selectUserSessionState = (state: IinitialState) => state.userState.userSession;
export const selectCurrentUserRole = (state: IinitialState) => state.userState.userRole;
export const selectCurrentTheme = (state: IinitialState) => state.theme;
