import './styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { useEffect, useState } from 'react';
import { ContractSetAutoExchange } from '../../../consts/smartContractFunctions';
import { useAppSelector } from '../../../redux/store';
import { selectUserSessionState } from '../../../redux/reducers/user-state';
import { readOnlyExchangeToggle, readOnlyGetNotifier } from '../../../consts/readOnly';
import { CallMade } from '@mui/icons-material';
import MinerMoreInfoAboutContainer from './MoreInfoAboutContainerMiner';
import WaitingMoreInfoAboutContainer from './MoreInfoAboutContainerWaitingMiner';
import MoreInfoAboutContainerMiner from './MoreInfoAboutContainerMiner';
import MoreInfoAboutContainerWaitingMiner from './MoreInfoAboutContainerWaitingMiner';
import MoreInfoAboutContainerPendingMiner from './MoreInfoAboutContainerPendingMiner';

interface IAboutContainerProps {
  currentRole: string;
  connectedWallet: string | null;
  explorerLink: string | undefined;
  currentBalance: number;
  totalWithdrawals: number | null;
}
const AboutContainer = ({
  currentRole,
  connectedWallet,
  explorerLink,
  currentBalance,
  totalWithdrawals,
}: IAboutContainerProps) => {
  const { currentTheme } = useCurrentTheme();
  const [exchange, setExchange] = useState<boolean | null>(false);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

  const userAddress = userSession.loadUserData().profile.stxAddress.testnet;

  const setAutoExchange = () => {
    if (userAddress !== null) {
      ContractSetAutoExchange(!exchange);
    }
  };

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  useEffect(() => {
    const getExchangeState = async () => {
      if (userAddress !== null) {
        const newExchange = await readOnlyExchangeToggle(userAddress);
        setExchange(newExchange);
      }
    };

    getExchangeState();
  }, [userAddress]);

  console.log('conn', connectedWallet);
  return (
    <div
      style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
      className="info-container-profile-page"
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
          <div className="title-info-continer">ABOUT</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
        className={currentRole === 'Miner' ? 'content-info-container' : 'content-info-container-normal-user'}
      >
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Connected wallet:</span>
          <div className="write-just-on-one-line">{connectedWallet !== null ? connectedWallet : ''}</div>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Role: </span>
          <span>
            {currentNotifier === userAddress ? 'Notifier' : currentRole === 'NormalUser' ? 'Normal User' : currentRole}
          </span>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Link to explorer: </span>
          <button
            className="button-with-no-style"
            style={{
              backgroundColor: colors[currentTheme].accent2,
              color: colors[currentTheme].secondary,
            }}
          >
            <a
              className="custom-link"
              style={{ backgroundColor: colors[currentTheme].accent2, color: colors[currentTheme].secondary }}
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
        {currentRole === 'Miner' && (
          <MoreInfoAboutContainerMiner currentBalance={currentBalance} totalWithdrawals={totalWithdrawals} />
        )}
        {currentRole === 'Waiting' && <MoreInfoAboutContainerWaitingMiner />}
        {currentRole === 'Pending' && <MoreInfoAboutContainerPendingMiner />}
        {/* <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Balance SC: </span>
          <span>{currentBalance / 1000000 + ' STX'}</span>
        </div>
        <div className="content-sections-title-info-container bottom-margins">
          <span className="bold-font">Total withdrawl of SC: </span>
          <span> {totalWithdrawals !== null ? totalWithdrawals / 1000000 + ' STX' : '0 STX'}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Autoexchange stx to btc: </span>
          <span>{exchange === null || exchange === false ? 'No' : 'Yes'}</span>
        </div>
        <div>
          <button className="customButton" onClick={setAutoExchange}>
            {exchange === null || exchange === false ? 'Change to yes' : 'Change to no'}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AboutContainer;
