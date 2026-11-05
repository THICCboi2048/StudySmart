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

  function deleteNotebook(notebookId) {
    setNotebooks((currentNotebooks) =>
      currentNotebooks.filter((notebook) => notebook.id !== notebookId),
    );
  }

  return (
    <NotebookContext.Provider value={{ notebooks, addNotebook, deleteNotebook }}>
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
