import { useEffect, useState } from 'react';
import { selectCurrentUserRole, selectUserSessionState, UserRole } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { readOnlyGetRemainingBlocksJoin } from '../../../consts/readOnly';
import { ContractAddPending } from '../../../consts/smartContractFunctions';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';

const MoreInfoAboutContainerPendingMiner = () => {
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const userSession = useAppSelector(selectUserSessionState);
  const userAddress = userSession.loadUserData().profile.stxAddress.testnet;
  const [blocksLeftUntilJoin, setBlocksLeftUntilJoin] = useState<number | null>(null);
  const { currentTheme } = useCurrentTheme();
  useEffect(() => {
    const fetchBlocksLeft = async () => {
      const blocksLeft = await readOnlyGetRemainingBlocksJoin();
      setBlocksLeftUntilJoin(blocksLeft);
    };
    fetchBlocksLeft();
  }, [blocksLeftUntilJoin]);

  return (
    <>
      <div className="content-sections-title-info-container bottom-margins">
        <span className="bold-font">Status: </span>
        <span>waiting to join pool </span>
      </div>
      <div className="content-sections-title-info-container">
        <span className="bold-font">Blocks until you join pool: </span>
        <span>{blocksLeftUntilJoin !== null && blocksLeftUntilJoin}</span>
      </div>
      <div className="content-sections-title-info-container">
        <button
          style={{
            background: `linear-gradient(135deg, ${colors[currentTheme].defaultYellow} 30%, ${colors[currentTheme].defaultOrange}) 60%`,
            color: colors[currentTheme].buttonWriting,
            border: `1px solid ${colors[currentTheme].defaultOrange}`,
          }}
          disabled={blocksLeftUntilJoin === 0 && currentRole === 'Pending' ? false : true}
          className="customButton width-100"
          onClick={() => {
            ContractAddPending();
          }}
        >
          join pool from pending to miners
        </button>
      </div>
    </>
  );
};

export default MoreInfoAboutContainerPendingMiner;
