import React from 'react';

export const ThemeContext = React.createContext({
  colors: {
    background: '#ffffff',
    text: '#000000',
    border: '#cccccc',
    primary: '#007bff',
    card: '#f8f9fa'
  },
  darkMode: false,
  toggleTheme: () => {}
});

// Optional: If you want to add theme toggling functionality
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  const theme = {
    colors: darkMode ? {
      background: '#121212',
      text: '#ffffff',
      border: '#333333',
      primary: '#BB86FC',
      card: '#1E1E1E'
    } : {
      background: '#ffffff',
      text: '#000000',
      border: '#cccccc',
      primary: '#007bff',
      card: '#f8f9fa'
    },
    darkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};