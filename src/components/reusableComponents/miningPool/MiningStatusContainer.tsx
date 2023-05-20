import './styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { ContractEndVoteNotifier } from '../../../consts/smartContractFunctions';

interface MiningStatusContainerProps {
  notifier: string | null;
  currentBlock: number | null;
  blocksWon: number | null;
  votingStatus: string | null;
}
const MiningPoolStatusContainer = ({ notifier, currentBlock, blocksWon, votingStatus }: MiningStatusContainerProps) => {
  const { currentTheme } = useCurrentTheme();

  return (
    <div
      style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
      className="info-container-mining-pool-status-page"
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
          <span className="bold-font">Current Notifier: </span>
          <div>{notifier !== null ? notifier : ''}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Ongoing Block: </span>
          {currentBlock !== null ? currentBlock : ''}
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Blocks Won: </span>
          <span>{blocksWon !== null ? blocksWon : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Notifier Voting Status: </span>
          <span>{votingStatus !== null ? votingStatus : ''}</span>
        </div>
      </div>
      {votingStatus === 'Ended by time!' && (
        <div
          style={{
            borderTop: `1px solid ${colors[currentTheme].colorWriting}`,
          }}
          className="footer-end-vote-button-container"
        >
          <button
            className="customButton"
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
export default MiningPoolStatusContainer;
