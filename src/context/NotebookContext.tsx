import { createContext, useContext, useState, ReactNode } from 'react';

export type FlashcardSet = {
  id: string;
  name: string;
  cards: string[];
};

export type Note = {
  id: string;
  name: string;
};

export type Notebook = {
  id: string;
  name: string;
  flashcardSets: FlashcardSet[];
  notes: Note[];
};

type NotebookContextValue = {
  notebooks: Notebook[];
  addNotebook: (name: string) => void;
  deleteNotebook: (notebookId: string) => void;
  getNotebook: (notebookId?: string) => Notebook | undefined;
  addFlashcardSet: (notebookId: string, name: string, cards?: string[]) => void;
};

const NotebookContext = createContext<NotebookContextValue | null>(null);

// TODO: borrar cuando exista la pantalla para crear sets de flashcards.
function crearSetDemo(): FlashcardSet {
  return {
    id: `${Date.now()}-demo`,
    name: 'Tipos de escenarios',
    cards: ['Escenario en H', 'Escenario a la italiana', 'Escenario circular'],
  };
}

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  function addNotebook(name: string) {
    setNotebooks((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        name,
        flashcardSets: [crearSetDemo()],
        notes: [],
      },
    ]);
  }

  function deleteNotebook(notebookId: string) {
    setNotebooks((current) => current.filter((n) => n.id !== notebookId));
  }

  function getNotebook(notebookId?: string) {
    return notebooks.find((n) => n.id === notebookId);
  }

  function addFlashcardSet(notebookId: string, name: string, cards: string[] = []) {
    setNotebooks((current) =>
      current.map((n) =>
        n.id === notebookId
          ? {
              ...n,
              flashcardSets: [
                ...n.flashcardSets,
                { id: `${Date.now()}-${n.flashcardSets.length}`, name, cards },
              ],
            }
          : n,
      ),
    );
  }

  return (
    <NotebookContext.Provider
      value={{ notebooks, addNotebook, deleteNotebook, getNotebook, addFlashcardSet }}
    >
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