import './styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { CallMade } from '@mui/icons-material';
import MoreInfoAboutContainerMiner from './MoreInfoAboutContainerMiner';
import MoreInfoAboutContainerWaitingMiner from './MoreInfoAboutContainerWaitingMiner';
import MoreInfoAboutContainerPendingMiner from './MoreInfoAboutContainerPendingMiner';

interface IAboutContainerProps {
  currentRole: string;
  connectedWallet: string | null;
  explorerLink: string | undefined;
  currentBalance: number;
  totalWithdrawals: number | null;
  currentNotifier: string | null;
  userAddress: string | null;
  positiveVotes: number | null;
  positiveVotesThreshold: number | null;
  negativeVotes: number | null;
  negativeVotesThreshold: number | null;
  blocksLeftUntilJoin: number | null;
}
const AboutContainer = ({
  currentRole,
  connectedWallet,
  explorerLink,
  currentBalance,
  totalWithdrawals,
  currentNotifier,
  userAddress,
  positiveVotes,
  positiveVotesThreshold,
  negativeVotes,
  negativeVotesThreshold,
  blocksLeftUntilJoin,
}: IAboutContainerProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-profile-page"
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
          <div className="title-info-container bold-font">ABOUT</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className={currentRole === 'Miner' ? 'content-info-container' : 'content-info-container-normal-user'}
      >
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Connected wallet:</span>
          <div className="write-just-on-one-line result-of-content-section">
            {connectedWallet !== null ? connectedWallet : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Role: </span>
          <span className="result-of-content-section">
            {currentNotifier === userAddress ? 'Notifier' : currentRole === 'NormalUser' ? 'Normal User' : currentRole}
          </span>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Link to explorer: </span>
          <button
            className="button-with-no-style"
            style={{
              backgroundColor: colors[appCurrentTheme].accent2,
              color: colors[appCurrentTheme].secondary,
            }}
          >
            <a
              className="custom-link result-of-content-section"
              style={{ backgroundColor: colors[appCurrentTheme].accent2, color: colors[appCurrentTheme].secondary }}
              target="_blank"
              rel="noreferrer"
              href={explorerLink !== undefined ? explorerLink : ''}
            >
              <span className="flex-center">
                Visit
                <span className="flex-center left-margins result-of-content-section">
                  <CallMade className="custom-icon" />
                </span>
              </span>
            </a>
          </button>
        </div>
        {currentRole === 'Miner' && (
          <MoreInfoAboutContainerMiner
            currentBalance={currentBalance}
            totalWithdrawals={totalWithdrawals}
            userAddress={userAddress}
          />
        )}
        {currentRole === 'Waiting' && (
          <MoreInfoAboutContainerWaitingMiner
            positiveVotes={positiveVotes}
            positiveVotesThreshold={positiveVotesThreshold}
            negativeVotes={negativeVotes}
            negativeVotesThreshold={negativeVotesThreshold}
          />
        )}
        {currentRole === 'Pending' && <MoreInfoAboutContainerPendingMiner blocksLeftUntilJoin={blocksLeftUntilJoin} />}
      </div>
    </div>
  );
};

export default AboutContainer;
