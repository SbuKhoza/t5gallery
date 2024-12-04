import React, { createContext, useState, useContext } from 'react';

// Create a refresh context
const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

// Custom hook to use refresh functionality
export const useRefresh = () => {
  return useContext(RefreshContext);
};