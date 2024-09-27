import { UserRoleStacking, selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import './styles.css';
import colors from '../../../consts/colorPallete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ContractAllowInPoolPoxScStacking, ContractJoinPoolStacking } from '../../../consts/smartContractFunctions';
import { GlobalStyles, Paper } from '@mui/material';
import { StackingVisualArts } from '../StackingVIsualArts';
import { numberWithCommas } from '../../../consts/converter';

interface DashboardStackingInfoProps {
  currentRole: UserRoleStacking;
  liquidityProvider: string | null;
  stackersList: Array<string>;
  blocksRewarded: number | null; //this is for the slots won
  bitcoinRewards: number | null;
  stacksAmountThisCycle: number | null;
  reservedAmount: number | null;
  returnCovered: number | null;
  minimumDepositProvider: number | null;
  userAddress: string | null;
  currentBurnBlockHeight: number;
  preparePhaseStartBlockHeight: number;
  rewardPhaseStartBlockHeight: number;
  nextRewardPhaseStartBlockHeight: number;
}

const DashboardStackingInfo = ({
  currentRole,
  liquidityProvider,
  stackersList,
  blocksRewarded,
  bitcoinRewards,
  stacksAmountThisCycle,
  reservedAmount,
  returnCovered,
  minimumDepositProvider,
  userAddress,
  currentBurnBlockHeight,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
  nextRewardPhaseStartBlockHeight,
}: DashboardStackingInfoProps) => {
  //TODO: see what is returning the readOnlyGetAllowanceStacking(userAddress) ->
  //null is false (so ALert comes up) and
  //some value for true, but I don't know the type of that value ->
  //see if I have to change the type of aloowanceStatus
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const allowPoolInPoxSc = () => {
    if (userAddress !== null) {
      ContractAllowInPoolPoxScStacking();
    }
  };

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
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
          height: 'auto',
        }}
        className="heading-info-container"
      >
        <StackingVisualArts
          reservedAmount={reservedAmount}
          stacksAmountThisCycle={stacksAmountThisCycle}
          returnCovered={returnCovered}
          currentBurnBlockHeight={currentBurnBlockHeight}
          preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
          rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
        />
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
          <Paper
            style={{
              backgroundColor: colors[appCurrentTheme].infoContainers,
              color: colors[appCurrentTheme].colorWriting,
              maxHeight: 70,
              overflow: 'auto',
            }}
            elevation={0}
          >
            <GlobalStyles
              styles={{
                '*::-webkit-scrollbar': { width: '0.1em' },
                '*::-webkit-scrollbar-thumb': { backgroundColor: colors[appCurrentTheme].colorWriting },
              }}
            />
            {stackersList.length !== 0 &&
              stackersList.map((data: string, index: number) => (
                <div className="result-of-content-section" key={index}>
                  {data}
                </div>
              ))}
          </Paper>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Slots Won: </span>
          <span className="result-of-content-section">
            {blocksRewarded !== null ? numberWithCommas(blocksRewarded) : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Bitcoin Rewards: </span>
          <span className="result-of-content-section">
            {bitcoinRewards !== null ? numberWithCommas(bitcoinRewards) + ' BTC' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Total stacked this cycle: </span>
          <span className="result-of-content-section">
            {stacksAmountThisCycle !== null ? numberWithCommas(stacksAmountThisCycle) + ' STX' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Total guaranteed: </span>
          <span className="result-of-content-section">
            {reservedAmount !== null ? numberWithCommas(reservedAmount) + ' STX' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacked amount covered by the pool: </span>
          <span className="result-of-content-section">
            {reservedAmount !== null && returnCovered !== null
              ? numberWithCommas(2 * reservedAmount * returnCovered) + ' STX'
              : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Return covered: </span>
          <span className="result-of-content-section">
            {returnCovered !== null ? (1 / returnCovered) * 100 + '%' : ''}
          </span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Minimum Required Liquidity: </span>
          <span className="result-of-content-section">
            {minimumDepositProvider !== null ? numberWithCommas(minimumDepositProvider) + ' STX' : ''}
          </span>
        </div>
      </div>
      {currentRole === 'NormalUserStacking' && (
        <div className="footer-join-button-container">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={allowPoolInPoxSc}
          >
            Allow Pool in PoX SC
          </button>
        </div>
      )}

      {currentRole === 'NormalUserStacking' && (
        <div className="footer-join-button-container margin-top-10">
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => ContractJoinPoolStacking()}
          >
            Join Pool
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardStackingInfo;
