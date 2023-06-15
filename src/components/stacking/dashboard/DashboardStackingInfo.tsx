import { UserRoleStacking, selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ContractDelegatePoxStacking } from '../../../consts/smartContractFunctions';
// import { readOnlyCheckJoinPoolStacking } from '../../../consts/readOnly';
import { useEffect, useState } from 'react';
import { readOnlyCheckJoinPoolStacking } from '../../../consts/readOnly';

interface DashboardStackingInfoProps {
  currentRole: UserRoleStacking;
  liquidityProvider: string | null;
  stackersList: Array<string>;
  blocksRewarded: number | null; //this is for the slots won
  bitcoinRewards: number | null;
  stacksAmountThisCycle: number | null;
  returnCovered: number | null;
  minimumDepositProvider: number | null;
  userAddress: string | null;
}

const DashboardStackingInfo = ({
  currentRole,
  liquidityProvider,
  stackersList,
  blocksRewarded,
  bitcoinRewards,
  stacksAmountThisCycle,
  returnCovered,
  minimumDepositProvider,
  userAddress,
}: DashboardStackingInfoProps) => {
  const [joinPoolStatus, setJoinPoolStatus] = useState<boolean>(false);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  useEffect(() => {
    const getJoinPoolState = async () => {
      const joinPoolStatus = await readOnlyCheckJoinPoolStacking();
      console.log('========', joinPoolStatus);
      // setJoinPoolStatus(joinPoolStatus);
    };
    getJoinPoolState();
  }, []);

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
          <span className="bold-font">Liquidity Provider: </span>
          <div className="result-of-content-section">{liquidityProvider !== null ? liquidityProvider : ''} </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">List of stackers: </span>
          {stackersList.length !== 0 &&
            stackersList.map((data: string, index: number) => (
              <div className="result-of-content-section" key={index}>
                {data}
              </div>
            ))}
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Slots Won: </span>
          <span className="result-of-content-section">{blocksRewarded !== null ? blocksRewarded : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Bitcoin Rewards: </span>
          <span className="result-of-content-section">
            {bitcoinRewards !== null ? bitcoinRewards / 1000000 + ' BTC' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Total stacked this cycle: </span>
          <span className="result-of-content-section">
            {stacksAmountThisCycle !== null ? stacksAmountThisCycle / 1000000 + ' STX' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Return covered: </span>
          <span className="result-of-content-section">
            {returnCovered !== null ? (1 / returnCovered) * 100 + '%' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Minimum return Liquidity Provider: </span>
          <span className="result-of-content-section">
            {minimumDepositProvider !== null ? minimumDepositProvider / 1000000 + ' STX' : ''}
          </span>
        </div>
      </div>
      {currentRole === 'NormalUserStacking' && (
        // <div>
        <div className="footer-join-button-container">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              if (userAddress !== null) ContractDelegatePoxStacking(userAddress);
            }}
          >
            Delegate pox-2
          </button>
        </div>
      )}
      {currentRole === 'NormalUserStacking' && (
        <div className="footer-join-button-container margin-top-10">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              // if (userAddress !== null) {
              // }
            }}
          >
            Join Pool
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardStackingInfo;
