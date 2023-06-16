import './styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';

interface IAboutContainerProps {
  currentRole: string;
  connectedWallet: string | null;
  explorerLink: string | undefined;
}
const ActivityContainer = () => {
  const { currentTheme } = useCurrentTheme();

  return (
    <div className="info-container-profile-page">
      <div className="heading-info-container">
        <div className="heading-title-info-container">
          <div className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container" />
          </div>
          <div className="title-info-continer">ACTIVITY</div>
        </div>
      </div>
      <div className="content-info-container">
        <div className="content-sections-title-info-container">Balance SC:</div>
        <div className="content-sections-title-info-container">Total withdrawl of SC:</div>
      </div>
    </div>
  );
};

export default ActivityContainer;
