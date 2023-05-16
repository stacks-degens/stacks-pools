import './styles.css';

import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
// import { selectCurrentUserRole, selectUserSessionState, UserRole } from '../../../redux/reducers/user-state';

import { AddCircleOutline, RemoveCircleOutline, SelfImprovement } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { principalCV, ClarityValue, listCV, cvToJSON } from '@stacks/transactions';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUserRole, selectUserSessionState, UserRole } from '../../../redux/reducers/user-state';
import { ReadOnlyAllDataWaitingMiners, readOnlyGetRemainingBlocksJoin } from '../../../consts/readOnly';
import RoleIntroMiner from './RoleIntroMiner';
import RoleIntroWaiting from './RoleIntroWaiting';
import RoleIntroPending from './RoleIntroPending';
import RoleIntroNormalUser from './RoleIntroNormalUser';

interface IRoleIntro {
  currentRole: string;
}

const RoleIntro = ({ currentRole }: IRoleIntro) => {
  const role: UserRole = useAppSelector(selectCurrentUserRole);

  const roleIntroMapping: Record<UserRole, React.ReactElement> = {
    Viewer: <div></div>,
    NormalUser: <RoleIntroNormalUser currentRole={currentRole} />,
    Waiting: <RoleIntroWaiting currentRole={currentRole} />,
    Pending: <RoleIntroPending currentRole={currentRole} />,
    Miner: <RoleIntroMiner currentRole={currentRole} />,
  };

  return (
    <div>
      <div>{roleIntroMapping[role]}</div>
    </div>
  );
};

export default RoleIntro;
