import './styles.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { SelfImprovement } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { readOnlyGetRemainingBlocksJoin } from '../../../consts/readOnly';

interface IRoleIntroPending {
  currentRole: string;
}

const RoleIntroPending = ({ currentRole }: IRoleIntroPending) => {
  const [blocksLeftUntilJoin, setBlocksLeftUntilJoin] = useState<number | null>(null);
  useEffect(() => {
    const fetchBlocksLeft = async () => {
      const blocksLeft = await readOnlyGetRemainingBlocksJoin();
      setBlocksLeftUntilJoin(blocksLeft);
    };
    fetchBlocksLeft();
  }, [blocksLeftUntilJoin]);

  const { currentTheme } = useCurrentTheme();

  return (
    <div
      className="intro-container-profile-page"
      style={{
        background: `linear-gradient(135deg, ${colors[currentTheme].defaultYellow} 30%, ${colors[currentTheme].defaultOrange}) 60%`,
        color: colors[currentTheme].introRoleWriting,
      }}
    >
      <filter id="round">
        <div className="intro-icon-container">
          <SelfImprovement className="role-icon" />
        </div>
      </filter>
      <div className="intro-informations-profile-page">
        <div className="intro-sides">
          <>
            <h5 className="margin-block-0 width-100 align-left">Status</h5>
            <div className="top-margins width-100">waiting to join pool</div>
          </>
        </div>
        <h3 className="intro-center-side ">{currentRole}</h3>
        <div className="intro-sides">
          <>
            <h5 className="margin-block-0 align-right width-100">Blocks until you join pool</h5>
            <div className="flex-right top-margins width-100">
              {blocksLeftUntilJoin !== null && blocksLeftUntilJoin}
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default RoleIntroPending;
