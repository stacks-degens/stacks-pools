import './styles.css';
import '../../../css/common-page-alignments/styles.css';
import '../../../css/buttons/styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import { ContractStartVoteNotifier } from '../../../consts/smartContractFunctions';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

interface VotingNotifierInfoContainerProps {
  votedFor: string | null;
  blocksRemaining: number | null;
  electedNotifier: string | null;
  voteStatus: boolean | null;
}
const VotingNotifierInfoContainer = ({
  votedFor,
  blocksRemaining,
  electedNotifier,
  voteStatus,
}: VotingNotifierInfoContainerProps) => {
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
          <div className="title-info-container">NOTIFIER</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Who I voted for: </span>
          <span className="result-of-content-section">{votedFor !== null ? votedFor : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Voting Blocks Remaining: </span>
          <span className="result-of-content-section">{blocksRemaining !== null ? blocksRemaining : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Elected Notifier: </span>
          {voteStatus && <span>Voting is still open!</span>}
          {!voteStatus && (
            <div className="result-of-content-section">{electedNotifier !== null ? electedNotifier : ''}</div>
          )}
        </div>
      </div>
      {blocksRemaining === 0 && (
        <div className="footer-end-vote-button-container">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              ContractStartVoteNotifier();
            }}
          >
            Start Vote
          </button>
        </div>
      )}
    </div>
  );
};
export default VotingNotifierInfoContainer;
