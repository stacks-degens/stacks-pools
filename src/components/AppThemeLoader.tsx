import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/store';
import { updateAppThemeAction } from '../redux/actions';

const AppThemeLoader: FC<PropsWithChildren> = (props) => {
  const dispatch = useAppDispatch();
  const localStorageTheme = localStorage.getItem('theme');
  const [loadApp, setLoadApp] = useState<boolean>(false);

  useEffect(() => {
    if (localStorageTheme) {
      dispatch(updateAppThemeAction(localStorageTheme));
      setLoadApp(true);
    }
  }, []);

  return <>{loadApp && props.children}</>;
};

export default AppThemeLoader;
