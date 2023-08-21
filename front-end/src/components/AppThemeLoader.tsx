import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/store';
import { updateAppThemeAction } from '../redux/actions';

const AppThemeLoader: FC<PropsWithChildren> = (props) => {
  const dispatch = useAppDispatch();
  const [firstLoad, setFirstLoad] = useState<boolean>(false);
  const localStorageTheme = localStorage.getItem('theme');
  const [loadApp, setLoadApp] = useState<boolean>(false);

  useEffect(() => {
    if (!localStorageTheme) {
      localStorage.setItem('theme', 'light');
      setFirstLoad(true);
    }
  }, []);

  useEffect(() => {
    if (localStorageTheme) {
      dispatch(updateAppThemeAction(localStorageTheme));
      setLoadApp(true);
    }
  }, [firstLoad]);

  return <>{loadApp && props.children}</>;
};

export default AppThemeLoader;
