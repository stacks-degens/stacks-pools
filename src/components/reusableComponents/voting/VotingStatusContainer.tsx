import './styles.css';
import '../../../css/common-page-alignments/styles.css';
import '../../../css/buttons/styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import { ContractEndVoteNotifier } from '../../../consts/smartContractFunctions';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

interface VotingStatusContainerProps {
  notifier: string | null;
  votingStatus: string | null;
}
const VotingStatusContainer = ({ notifier, votingStatus }: VotingStatusContainerProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-voting-status-page"
    >
      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container">STATUS</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Current Notifier: </span>
          <div className="result-of-content-section">{notifier !== null ? notifier : ''}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Notifier Voting Status: </span>
          <span className="result-of-content-section">{votingStatus !== null ? votingStatus : ''}</span>
        </div>
      </div>
      {votingStatus === 'Ended by time!' && (
        <div className="footer-end-vote-button-container">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              ContractEndVoteNotifier();
            }}
          >
            End Vote
          </button>
        </div>
      )}
    </div>
  );
};
export default VotingStatusContainer;
