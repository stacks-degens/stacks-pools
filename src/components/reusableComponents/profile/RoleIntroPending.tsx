import './styles.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { SelfImprovement } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { readOnlyGetRemainingBlocksJoin } from '../../../consts/readOnly';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';

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

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      className="intro-container-profile-page"
      style={{
        background: `linear-gradient(135deg, ${colors[appCurrentTheme].defaultYellow} 30%, ${colors[appCurrentTheme].defaultOrange}) 60%`,
        color: colors[appCurrentTheme].introRoleWriting,
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
            <div className="top-margins width-100">Waiting to join pool</div>
          </>
        </div>
        <h3 className="intro-center-side ">{currentRole}</h3>
        <div className="intro-sides">
          <>
            <h5 className="margin-block-0 align-right width-100">Blocks until you can join</h5>
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
