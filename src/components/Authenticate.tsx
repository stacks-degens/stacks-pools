import MainPage from './MainPage';
import { Connect } from '@stacks/connect-react';
import { useAppSelector } from '../redux/store';
import { selectCurrentTheme, selectUserSessionState } from '../redux/reducers/user-state';
import colors from '../consts/colorPallete';

const Authenticate = () => {
  const userSession = useAppSelector(selectUserSessionState);
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      className="default-page-container"
      style={{ backgroundColor: colors[appCurrentTheme].accent2, color: colors[appCurrentTheme].colorWriting }}
    >
      <Connect
        authOptions={{
          appDetails: {
            name: 'Stacks React Template',
            // todo:
            icon: window.location.origin + '/logo.png',
          },
          redirectTo: '/',
          onFinish: () => {
            window.location.reload();
          },
          userSession,
        }}
      >
        <MainPage />
      </Connect>
    </div>
  );
};

export default Authenticate;
