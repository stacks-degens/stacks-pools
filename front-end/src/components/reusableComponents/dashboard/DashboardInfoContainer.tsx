import '../../../css/buttons/styles.css';
import './styles.css';
import '../../../css/common-page-alignments/styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import { ContractAskToJoinMining } from '../../../consts/smartContractFunctions';
import { selectCurrentTheme, UserRoleMining } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { numberWithCommas } from '../../../consts/converter';
import { useState } from 'react';
import MouseOverPopover from '../../stacking/profile/MouseOverPopover';

interface DashboardInfoContainerProps {
  notifier: string | null;
  minersList: Array<string>;
  blocksWon: number | null;
  stacksRewards: number | null;
  userAddress: string | null;
  currentRole: UserRoleMining;
  currentBurnBlockHeight: number | null;
  minersNumber: number | null;
  poolTotalSpendPerBlock: number | null;
}
const DashboardInfoContainer = ({
  notifier,
  minersList,
  blocksWon,
  stacksRewards,
  userAddress,
  currentRole,
  currentBurnBlockHeight,
  minersNumber,
  poolTotalSpendPerBlock,
}: DashboardInfoContainerProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);
  const [userPubKey, setUserPubKey] = useState<string>('');
  const legacyBtcAddressInstructions =
    'How to create a Bitcoin legacy address?' +
    '\n' +
    ' electrum create new wallet → standard wallet → create a new seed → copy seed → back → i already have a seed → paste seed and click options → BIP39 seed → next → legacy';

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-dashboard-page"
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
          <div className="title-info-container">INFO</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Current Bitcoin Block Height: </span>
          <div className="result-of-content-section">
            {currentBurnBlockHeight !== null ? numberWithCommas(currentBurnBlockHeight) : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Current Notifier: </span>
          <div className="result-of-content-section">{notifier !== null ? notifier : ''}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Miners in the Pool: </span>
          <div className="result-of-content-section">{minersNumber !== null ? minersNumber : 0}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Miners List: </span>
          {minersList.length !== 0 &&
            minersList.map((data: string, index: number) => (
              <div className="result-of-content-section" key={index}>
                {data}
              </div>
            ))}
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Pool total spend per block: </span>
          <div className="result-of-content-section">
            {poolTotalSpendPerBlock !== null ? numberWithCommas(poolTotalSpendPerBlock / 1_000_000) : 0} sats
          </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Blocks Won: </span>
          <span className="result-of-content-section">{blocksWon !== null ? numberWithCommas(blocksWon) : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacks Rewards: </span>
          <span className="result-of-content-section">
            {stacksRewards !== null ? numberWithCommas(stacksRewards / 1000000) + ' STX' : ''}
          </span>
        </div>
      </div>
      {currentRole === 'NormalUser' && (
        <div style={{ alignContent: 'center', textAlign: 'center' }}>
          <div>
            <label className="custom-label">Insert your legacy Bitcoin address' public key</label>{' '}
            <span
              style={{
                margin: 'auto',
                textAlign: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                display: 'flex',
                marginTop: 'auto',
              }}
            >
              <MouseOverPopover severityType="info" text={legacyBtcAddressInstructions} />
            </span>
            <div className="bottom-margins" style={{ width: '20vw', margin: 'auto' }}>
              <input
                className="custom-input"
                type="text"
                onChange={(e) => {
                  console.log(e.target.value);
                  setUserPubKey(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <br />
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              if (userAddress !== null) {
                ContractAskToJoinMining(userPubKey);
              }
            }}
            disabled={userPubKey === ''}
          >
            Join Pool
          </button>
          <br />
          <br />
        </div>
      )}
    </div>
  );
};
export default DashboardInfoContainer;
