import './styles.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { AddCircleOutline, RemoveCircleOutline, SelfImprovement } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { principalCV, ClarityValue, listCV, cvToJSON } from '@stacks/transactions';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme, selectUserSessionState } from '../../../redux/reducers/user-state';
import { ReadOnlyAllDataWaitingMiners } from '../../../consts/readOnly';

interface IRoleIntroWaiting {
  currentRole: string;
}

const RoleIntroWaiting = ({ currentRole }: IRoleIntroWaiting) => {
  const userSession = useAppSelector(selectUserSessionState);
  const userAddressAsCV: ClarityValue = listCV([principalCV(userSession.loadUserData().profile.stxAddress.testnet)]);
  const [positiveVotes, setPositiveVotes] = useState<number | null>(null);
  const [positiveVotesThreshold, setPositiveVotesThreshold] = useState<number | null>(null);
  const [negativeVotes, setNegativeVotes] = useState<number | null>(null);
  const [negativeVotesThreshold, setNegativeVotesThreshold] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const waitingList = await ReadOnlyAllDataWaitingMiners(userAddressAsCV);
      const newWaitingList = cvToJSON(waitingList.newResultList[0]);
      setPositiveVotes(newWaitingList.value[0].value.value['pos-votes'].value);
      setPositiveVotesThreshold(newWaitingList.value[0].value.value['pos-thr'].value);
      setNegativeVotes(newWaitingList.value[0].value.value['neg-votes'].value);
      setNegativeVotesThreshold(newWaitingList.value[0].value.value['neg-thr'].value);
    };
    fetchData();
  }, [userAddressAsCV]);
  const { currentTheme } = useCurrentTheme();

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      className="intro-container-profile-page"
      style={{
        background: `linear-gradient(135deg, ${colors[appCurrentTheme].defaultYellow} 30%, ${colors[appCurrentTheme].defaultOrange}) 60%`,
        color: colors[appCurrentTheme].introRoleWriting,
      }}
    >
      <filter id="round">
        <div className="intro-icon-container">
          <SelfImprovement className="role-icon" />
        </div>
      </filter>
      <div className="intro-informations-profile-page">
        <div className="intro-sides">
          <>
            <h5 className="margin-block-0">Status</h5>
            <div className="top-margins">waiting to be voted</div>
          </>
        </div>
        <h3 className="intro-center-side ">{currentRole}</h3>
        <div className="intro-sides">
          <>
            <h5 className="margin-block-0 align-center">Votes</h5>

            <div className="flex-center top-margins">
              <span>
                {negativeVotes !== null && negativeVotesThreshold !== null
                  ? negativeVotes + '/' + negativeVotesThreshold
                  : '0'}
              </span>
              <RemoveCircleOutline className="font-15 margin-inline-5 " />
              <AddCircleOutline className="font-15 margin-inline-5 " />
              <span>
                {positiveVotes !== null && positiveVotesThreshold !== null
                  ? positiveVotes + '/' + positiveVotesThreshold
                  : '0'}
              </span>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default RoleIntroWaiting;
