import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { ContractTryEnterPool } from '../../../consts/smartContractFunctions';
import colors from '../../../consts/colorPallete';

interface IMoreInfoAboutContainerWaitingMinerProps {
  positiveVotes: number | null;
  positiveVotesThreshold: number | null;
  negativeVotes: number | null;
  negativeVotesThreshold: number | null;
}

const MoreInfoAboutContainerWaitingMiner = ({
  positiveVotes,
  positiveVotesThreshold,
  negativeVotes,
  negativeVotesThreshold,
}: IMoreInfoAboutContainerWaitingMinerProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <>
      <div className="content-sections-title-info-container bottom-margins">
        <span className="bold-font">Status: </span>
        <span className="result-of-content-section">waiting to be voted </span>
      </div>

      <div className="content-sections-title-info-container">
        <span className="bold-font">Positive votes: </span>
        <span className="result-of-content-section">
          {positiveVotes !== null && positiveVotesThreshold !== null
            ? positiveVotes + '/' + positiveVotesThreshold
            : '0'}
        </span>
      </div>
      <div className="content-sections-title-info-container">
        <span className="bold-font">Negative votes: </span>
        <span className="result-of-content-section">
          {negativeVotes !== null && negativeVotesThreshold !== null
            ? negativeVotes + '/' + negativeVotesThreshold
            : '0'}
        </span>
      </div>
      {positiveVotes !== null && positiveVotesThreshold !== null && positiveVotes >= positiveVotesThreshold && (
        <div className="footer-button-container">
          <button
            style={{
              background: `linear-gradient(135deg, ${colors[appCurrentTheme].defaultYellow} 30%, ${colors[appCurrentTheme].defaultOrange}) 60%`,
              color: colors[appCurrentTheme].buttonWriting,
              border: `1px solid ${colors[appCurrentTheme].defaultOrange}`,
            }}
            className="customButton"
            onClick={() => ContractTryEnterPool()}
          >
            Try Enter
          </button>
        </div>
      )}
    </>
  );
};

export default MoreInfoAboutContainerWaitingMiner;
