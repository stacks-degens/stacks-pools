interface Theme {
  [key: string]: {
    primary: string;
    secondary: string;
    accent1: string;
    accent2: string;
    buttons: string;
    buttonBackground: string;
    defaultYellow: string;
    defaultOrange: string;
    colorWriting: string;
    lightYellow: string;
    infoContainers: string;
    introRoleWriting: string;
    buttonWriting: string;
    borderButton: string;
    headerIcon: string;
  };
}

const theme: Theme = {
  light: {
    primary: '#ffffff',
    secondary: '#333333',
    accent1: '#000000',
    accent2: '#eeeeee',
    buttons: '#229fff',
    buttonBackground: '#bbbbbb',
    defaultYellow: '#fdc60b',
    defaultOrange: '#ed693c',
    colorWriting: '#2f2f2f',
    lightYellow: '#fef9f7',
    infoContainers: '#fef9f7',
    introRoleWriting: '#2f2f2f',
    buttonWriting: '#2f2f2f',
    borderButton: '#ed693c',
    headerIcon: 'f9b11c',
  },

  dark: {
    primary: '#000000',
    secondary: '#dddddd',
    accent1: '#ffffff',
    accent2: '#222222',
    buttons: '#1976d2',
    buttonBackground: '#777777',
    defaultYellow: '#fdc60b',
    defaultOrange: '#ed693c',
    colorWriting: '#eeeeee',
    lightYellow: '#fef9f7',
    infoContainers: '#121212',
    introRoleWriting: '#2f2f2f',
    buttonWriting: '#2f2f2f',
    borderButton: '#fdc60b',
    headerIcon: 'f9b11c',
  },
};

export default theme;
