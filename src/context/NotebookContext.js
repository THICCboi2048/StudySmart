import { createContext, useContext, useState } from 'react';

const NotebookContext = createContext(null);

export function NotebookProvider({ children }) {
  const [notebooks, setNotebooks] = useState([]);

  function addNotebook(name) {
    setNotebooks((currentNotebooks) => [
      ...currentNotebooks,
      { id: `${Date.now()}-${currentNotebooks.length}`, name },
    ]);
  }

  return (
    <NotebookContext.Provider value={{ notebooks, addNotebook }}>
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebooks() {
  const context = useContext(NotebookContext);

  if (!context) {
    throw new Error('useNotebooks must be used within a NotebookProvider');
  }

  return context;
}
