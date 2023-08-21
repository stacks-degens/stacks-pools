import '../styles.css';
import colors from '../../../../consts/colorPallete';
import { SelfImprovement } from '@mui/icons-material';
import { useAppSelector } from '../../../../redux/store';
import { selectCurrentTheme } from '../../../../redux/reducers/user-state';

interface RoleIntroMinerDetailsProps {
  currentRole: string | null;
}

const RoleIntroMinerDetails = ({ currentRole }: RoleIntroMinerDetailsProps) => {
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
        <div className="intro-sides"></div>
        <h3 className="intro-center-side ">
          {currentRole === null ? 'Incorrect Address' : currentRole === 'NormalUser' ? 'Normal User' : currentRole}
        </h3>
        <div className="intro-sides"></div>
      </div>
    </div>
  );
};

export default RoleIntroMinerDetails;
