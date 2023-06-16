interface Theme {
  [key: string]: {
    primary: string;
    secondary: string;
    accent1: string;
    accent2: string;
    buttons: string;
    buttonBackground: string;
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
  },
  dark: {
    primary: '#000000',
    secondary: '#dddddd',
    accent1: '#ffffff',
    accent2: '#222222',
    buttons: '#1976d2',
    buttonBackground: '#777777',
  },
};

export default theme;
