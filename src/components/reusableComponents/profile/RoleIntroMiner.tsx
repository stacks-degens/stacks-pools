import './styles.css';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { SelfImprovement } from '@mui/icons-material';
import { useEffect, useState } from 'react';

interface IRoleIntroMiner {
  currentRole: string;
}

const RoleIntroMiner = ({ currentRole }: IRoleIntroMiner) => {
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
        <div className="intro-sides"></div>
        <h3 className="intro-center-side ">{currentRole}</h3>
        <div className="intro-sides"></div>
      </div>
    </div>
  );
};

export default RoleIntroMiner;
