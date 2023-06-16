import { useEffect, useState } from 'react';
import {
  readOnlyGetAllTotalWithdrawals,
  ReadOnlyAllDataWaitingMiners,
  readOnlyGetRemainingBlocksJoin,
} from '../../../consts/readOnly';
import { selectCurrentUserRole, selectUserSessionState } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import AboutContainer from '../../reusableComponents/profile/AboutContainer';
import ActionsContainer from '../../reusableComponents/profile/ActionsContainer';
import RoleIntro from '../../reusableComponents/profile/RoleIntro';
import { principalCV, ClarityValue, listCV, cvToJSON } from '@stacks/transactions';
import './styles.css';
import RoleIntroStacking from './RoleIntroStacking';
import AboutContainerStacking from './AboutContainerStacking';

interface IStackerProfileProps {
  currentRole: string;
  // connectedWallet: string | null;
  // explorerLink: string | undefined;
}

const StackerProfile = ({ currentRole }: IStackerProfileProps) => {
  const userSession = useAppSelector(selectUserSessionState);
  // const currentRole = useAppSelector(selectCurrentUserRole);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number | null>(null);

  return (
    <div>
      <div className="principal-content-profile-page">
        <RoleIntroStacking currentRole={currentRole} />
        <div className={currentRole === 'Miner' ? 'main-info-container' : 'main-info-container-normal-user'}>
          <AboutContainerStacking currentRole={currentRole} />
          {/* {currentRole === 'Miner' && <ActionsContainer currentNotifier={currentNotifier} userAddress={userAddress} />} */}
        </div>
      </div>
    </div>
  );
};

export default StackerProfile;
