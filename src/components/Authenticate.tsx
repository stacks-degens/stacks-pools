import MainPage from './MainPage';

import { Connect } from '@stacks/connect-react';
import { useAppSelector } from '../redux/store';
import { selectUserSessionState } from '../redux/reducers/user-state';
import colors from '../consts/colorPallete';
import useCurrentTheme from '../consts/theme';

const Authenticate = () => {
  const { currentTheme } = useCurrentTheme();
  const userSession = useAppSelector(selectUserSessionState);

  return (
    <div
      className="default-page-container"
      style={{ backgroundColor: colors[currentTheme].accent2, color: colors[currentTheme].colorWriting }}
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
