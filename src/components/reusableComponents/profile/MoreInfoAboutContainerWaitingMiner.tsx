import { useEffect, useState } from 'react';

import { selectUserSessionState } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { principalCV, ClarityValue, listCV, cvToJSON } from '@stacks/transactions';
import { ReadOnlyAllDataWaitingMiners } from '../../../consts/readOnly';
import { ContractTryEnterPool } from '../../../consts/smartContractFunctions';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';

const MoreInfoAboutContainerWaitingMiner = () => {
  const userSession = useAppSelector(selectUserSessionState);
  const userAddress = userSession.loadUserData().profile.stxAddress.testnet;
  const userAddressAsCV: ClarityValue = listCV([principalCV(userSession.loadUserData().profile.stxAddress.testnet)]);
  const [positiveVotes, setPositiveVotes] = useState<number | null>(null);
  const [positiveVotesThreshold, setPositiveVotesThreshold] = useState<number | null>(null);
  const [negativeVotes, setNegativeVotes] = useState<number | null>(null);
  const [negativeVotesThreshold, setNegativeVotesThreshold] = useState<number | null>(null);
  const { currentTheme } = useCurrentTheme();

  useEffect(() => {
    const fetchData = async () => {
      const waitingList = await ReadOnlyAllDataWaitingMiners(userAddressAsCV);
      const newWaitingList = cvToJSON(waitingList.newResultList[0]);
      setPositiveVotes(newWaitingList.value[0].value.value['pos-votes'].value);
      setPositiveVotesThreshold(newWaitingList.value[0].value.value['pos-thr'].value);
      setNegativeVotes(newWaitingList.value[0].value.value['neg-votes'].value);
      setNegativeVotesThreshold(newWaitingList.value[0].value.value['neg-thr'].value);
    };
    fetchData();
  }, [userAddressAsCV]);

  return (
    <>
      <div className="content-sections-title-info-container bottom-margins">
        <span className="bold-font">Status: </span>
        <span>waiting to be voted </span>
      </div>

      <div className="content-sections-title-info-container">
        <span className="bold-font">Positive votes: </span>
        <span>
          {positiveVotes !== null && positiveVotesThreshold !== null
            ? positiveVotes + '/' + positiveVotesThreshold
            : '0'}
        </span>
      </div>
      <div className="content-sections-title-info-container">
        <span className="bold-font">Negative votes: </span>
        <span>
          {negativeVotes !== null && negativeVotesThreshold !== null
            ? negativeVotes + '/' + negativeVotesThreshold
            : '0'}
        </span>
      </div>
      {positiveVotes !== null && positiveVotesThreshold !== null && positiveVotes >= positiveVotesThreshold && (
        <div
          style={{
            borderTop: `1px solid ${colors[currentTheme].colorWriting}`,
          }}
          className="footer-button-container"
        >
          <button
            style={{
              background: `linear-gradient(135deg, ${colors[currentTheme].defaultYellow} 30%, ${colors[currentTheme].defaultOrange}) 60%`,
              color: colors[currentTheme].buttonWriting,
              border: `1px solid ${colors[currentTheme].defaultOrange}`,
            }}
            className="customButton"
            // style={{
            //   backgroundColor: colors[currentTheme].accent2,
            //   color: colors[currentTheme].secondary,
            // }}
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
