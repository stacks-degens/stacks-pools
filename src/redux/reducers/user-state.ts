import { AppConfig, UserSession } from '@stacks/connect';
import { IinitialState } from '.';

export interface IUserState {
  userSession: UserSession;
  miningUserRole: UserRoleMining;
  stackingUserRole: UserRoleStacking;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const defaultUserState: IUserState = {
  userSession,
  miningUserRole: 'Viewer',
  stackingUserRole: 'Viewer',
};

export type Theme = 'light' | 'dark';

export type UserRoleMining = 'Miner' | 'NormalUser' | 'Pending' | 'Waiting' | 'Viewer';
export type UserRoleStacking = 'Provider' | 'Stacker' | 'NormalUserStacking' | 'Viewer';

export const selectUserState = (state: IinitialState) => state.userState;
export const selectUserSessionState = (state: IinitialState) => state.userState.userSession;
export const selectCurrentUserRoleMining = (state: IinitialState) => state.userState.miningUserRole;
export const selectCurrentUserRoleStacking = (state: IinitialState) => state.userState.stackingUserRole;
export const selectCurrentTheme = (state: IinitialState) => state.theme;
