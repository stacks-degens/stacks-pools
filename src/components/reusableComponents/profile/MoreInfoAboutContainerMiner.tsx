import { useEffect, useState } from 'react';
import { readOnlyExchangeToggle } from '../../../consts/readOnly';
import { ContractSetAutoExchange } from '../../../consts/smartContractFunctions';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';

interface IMinerMoreInfoAboutMinerContainer {
  currentBalance: number;
  totalWithdrawals: number | null;
  userAddress: string | null;
}

const MoreInfoAboutContainerMiner = ({
  currentBalance,
  totalWithdrawals,
  userAddress,
}: IMinerMoreInfoAboutMinerContainer) => {
  const [exchange, setExchange] = useState<boolean | null>(false);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const setAutoExchange = () => {
    if (userAddress !== null) {
      ContractSetAutoExchange(!exchange);
    }
  };

  useEffect(() => {
    const getExchangeState = async () => {
      if (userAddress !== null) {
        const newExchange = await readOnlyExchangeToggle(userAddress);
        setExchange(newExchange);
      }
    };

    getExchangeState();
  }, [userAddress]);
  return (
    <>
      <div className="content-sections-title-info-container bottom-margins">
        <span className="bold-font">Balance SC: </span>
        <span className="result-of-content-section">{currentBalance / 1000000 + ' STX'}</span>
      </div>
      <div className="content-sections-title-info-container bottom-margins">
        <span className="bold-font">Total withdrawl of SC: </span>
        <span className="result-of-content-section">
          {' '}
          {totalWithdrawals !== null ? totalWithdrawals / 1000000 + ' STX' : '0 STX'}
        </span>
      </div>
      <div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Autoexchange stx to btc: </span>
          <span className="result-of-content-section">{exchange === null || exchange === false ? 'No' : 'Yes'}</span>
        </div>
        <div className="content-sections-title-info-container autoexchange-button-container">
          <button
            className={appCurrentTheme === 'light' ? 'customButton width-100' : 'customDarkButton width-100'}
            onClick={setAutoExchange}
          >
            {exchange === null || exchange === false ? 'Change to Yes' : 'Change to No'}
          </button>
        </div>
      </div>
    </>
  );
};

export default MoreInfoAboutContainerMiner;
