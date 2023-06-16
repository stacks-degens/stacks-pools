import '.././styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../../consts/colorPallete';
import { useEffect, useState } from 'react';
import { selectCurrentTheme } from '../../../../redux/reducers/user-state';
import { useAppSelector } from '../../../../redux/store';
import { readOnlyGetNotifier } from '../../../../consts/readOnly';
import { CallMade } from '@mui/icons-material';
import { useLocation, useParams } from 'react-router-dom';

interface MinerDetailsContainerProps {
  currentRole: string | null;
  address: string | null;
  explorerLink: string | undefined;
  currentBalance: string | null;
  totalWithdrawals: string | null;
  wasBlacklisted: boolean | null;
  warnings: number | null;
  blocksAsMiner: number | null;
  blocksUntilJoin: number | null;
  positiveVotes: string | null;
  negativeVotes: string | null;
}
const MinerDetailsContainer = ({
  currentRole,
  address,
  explorerLink,
  currentBalance,
  totalWithdrawals,
  wasBlacklisted,
  warnings,
  blocksAsMiner,
  blocksUntilJoin,
  positiveVotes,
  negativeVotes,
}: MinerDetailsContainerProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);

  const location = useLocation();
  const params = useParams();
  console.log('loc', location);
  console.log('params', params);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  if (currentRole === null) {
    return (
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="info-container-profile-page"
      >
        <div
          style={{
            backgroundColor: colors[appCurrentTheme].infoContainers,
            color: colors[appCurrentTheme].colorWriting,
          }}
          className="heading-info-container"
        >
          <div className="heading-title-info-container">
            <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
              <AccountCircleIcon className="icon-info-container yellow-icon" />
            </div>
            <div className="title-info-continer">ABOUT</div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: colors[appCurrentTheme].infoContainers,
            color: colors[appCurrentTheme].colorWriting,
          }}
          className={'content-info-container-normal-user'}
        >
          <div className="content-sections-title-info-container bottom-margins">
            <span className="bold-font">Address:</span>
            <div className="write-just-on-one-line">{address !== null ? address : ''}</div>
          </div>
          <div className="content-sections-title-info-container bottom-margins">
            <span className="bold-font">Wrong Address!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-profile-page"
    >
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-continer">ABOUT</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className={'content-info-container-normal-user'}
      >
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Address:</span>
          <div className="write-just-on-one-line">{address !== null ? address : ''}</div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Role: </span>
          <span>
            {currentNotifier === address ? 'Notifier' : currentRole === 'NormalUser' ? 'Normal User' : currentRole}
          </span>
        </div>
        {(currentRole === 'Notifier' || currentRole === 'Miner') && (
          <div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Was Blacklisted: </span>
              <span>{wasBlacklisted !== null ? (wasBlacklisted === true ? 'Yes' : 'No') : ''}</span>
            </div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Warnings: </span>
              <span>{warnings !== null ? warnings : ''}</span>
            </div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Blocks as Miner: </span>
              <span>{blocksAsMiner !== null ? blocksAsMiner : ''}</span>
            </div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Balance: </span>
              <span>{currentBalance !== null ? currentBalance : ''}</span>
            </div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Total Withdrawn: </span>
              <span>{totalWithdrawals !== null ? totalWithdrawals : ''}</span>
            </div>
          </div>
        )}
        {currentRole === 'Pending' && (
          <div className="content-sections-title-info-container bottom-margins">
            <span className="bold-font">Blocks Left Until Join: </span>
            <span>{blocksUntilJoin !== null ? blocksUntilJoin : ''}</span>
          </div>
        )}
        {currentRole === 'Waiting' && (
          <div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Positive Votes: </span>
              <span>{positiveVotes !== null ? positiveVotes : ''}</span>
            </div>
            <div className="content-sections-title-info-container bottom-margins">
              <span className="bold-font">Negative Votes: </span>
              <span>{negativeVotes !== null ? negativeVotes : ''}</span>
            </div>
          </div>
        )}
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Link to explorer: </span>
          <button
            className="button-with-no-style"
            style={{ backgroundColor: colors[appCurrentTheme].accent2, color: colors[appCurrentTheme].secondary }}
          >
            <a
              className="custom-link"
              style={{ backgroundColor: colors[appCurrentTheme].accent2, color: colors[appCurrentTheme].secondary }}
              target="_blank"
              rel="noreferrer"
              href={explorerLink !== undefined ? explorerLink : ''}
            >
              <span className="flex-center">
                Visit
                <span className="flex-center left-margins">
                  <CallMade className="custom-icon" />
                </span>
              </span>
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinerDetailsContainer;
