import './styles.css';
import colors from '../../../consts/colorPallete';
import { AddCircleOutline, RemoveCircleOutline, SelfImprovement } from '@mui/icons-material';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

interface IRoleIntroWaiting {
  currentRole: string;
  positiveVotes: number | null;
  positiveVotesThreshold: number | null;
  negativeVotes: number | null;
  negativeVotesThreshold: number | null;
}

const RoleIntroWaiting = ({
  currentRole,
  positiveVotes,
  positiveVotesThreshold,
  negativeVotes,
  negativeVotesThreshold,
}: IRoleIntroWaiting) => {
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
            <div className="top-margins">
              {positiveVotes !== null && positiveVotesThreshold !== null && positiveVotes < positiveVotesThreshold
                ? 'Waiting to be voted'
                : 'You have enough votes'}
            </div>
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
