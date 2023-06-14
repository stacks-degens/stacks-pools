import { AppConfig, UserSession } from '@stacks/connect';
import { IinitialState } from '.';

export interface IUserState {
  userSession: UserSession;
  userRole: UserRole;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const defaultUserState: IUserState = {
  userSession,
  userRole: 'Viewer',
};

// export type UserRole = 'Miner' | 'NormalUser' | 'PendingMiner' | 'WaitingMiner' | 'Viewer';
export type UserRole = 'Miner' | 'NormalUser' | 'Pending' | 'Waiting' | 'Viewer';

export const selectUserState = (state: IinitialState) => state.userState;
export const selectUserSessionState = (state: IinitialState) => state.userState.userSession;
export const selectCurrentUserRole = (state: IinitialState) => state.userState.userRole;
