import { useState, useEffect } from 'react';

const useCurrentTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme ? storedTheme : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  return { currentTheme, setTheme };
};

export default useCurrentTheme;
