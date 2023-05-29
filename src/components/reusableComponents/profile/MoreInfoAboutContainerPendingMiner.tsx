import { selectCurrentTheme, selectCurrentUserRole, UserRole } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { ContractAddPending } from '../../../consts/smartContractFunctions';
import colors from '../../../consts/colorPallete';

interface IMoreInfoAboutContainerPendingProps {
  blocksLeftUntilJoin: number | null;
}

const MoreInfoAboutContainerPendingMiner = ({ blocksLeftUntilJoin }: IMoreInfoAboutContainerPendingProps) => {
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <>
      <div className="content-sections-title-info-container bottom-margins">
        <span className="bold-font">Status: </span>
        <span className="result-of-content-section">waiting to join pool </span>
      </div>
      <div className="content-sections-title-info-container">
        <span className="bold-font">Blocks until you join pool: </span>
        <span className="result-of-content-section">{blocksLeftUntilJoin !== null && blocksLeftUntilJoin}</span>
      </div>
      <div className="footer-button-container">
        <button
          style={{
            background: `linear-gradient(135deg, ${colors[appCurrentTheme].defaultYellow} 30%, ${colors[appCurrentTheme].defaultOrange}) 60%`,
            color: colors[appCurrentTheme].buttonWriting,
            border: `1px solid ${colors[appCurrentTheme].defaultOrange}`,
          }}
          disabled={blocksLeftUntilJoin === 0 && currentRole === 'Pending' ? false : true}
          className="customButton width-50"
          onClick={() => {
            ContractAddPending();
          }}
        >
          Enter Pool
        </button>
      </div>
    </>
  );
};

export default MoreInfoAboutContainerPendingMiner;
