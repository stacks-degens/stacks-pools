import './styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { ContractStartVoteNotifier } from '../../../consts/smartContractFunctions';

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
  const { currentTheme } = useCurrentTheme();

  return (
    <div
      style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
      className="info-container-voting-status-page"
    >
      <div
        style={{
          backgroundColor: colors[currentTheme].infoContainers,
          color: colors[currentTheme].colorWriting,
          borderBottom: `1px solid ${colors[currentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[currentTheme].defaultYellow }} className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container">INFO</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Who I voted for: </span>
          <span>{votedFor !== null ? votedFor : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Voting Blocks Remaining: </span>
          <span>{blocksRemaining !== null ? blocksRemaining : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Elected Notifier: </span>
          {voteStatus && <span>Voting is still open!</span>}
          {!voteStatus && <div>{electedNotifier !== null ? electedNotifier : ''}</div>}
        </div>
      </div>
      {blocksRemaining === 0 && (
        <div
          style={{
            borderTop: `1px solid ${colors[currentTheme].colorWriting}`,
          }}
          className="footer-join-button-container"
        >
          <button
            className={currentTheme === 'light' ? 'customButton' : 'customDarkButton'}
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
