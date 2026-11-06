import { createContext, useContext, useState, ReactNode } from 'react';

export type Card = {
  id: string;
  title: string;
  content: string;
};

export type FlashcardSet = {
  id: string;
  name: string;
  cards: Card[];
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

function crearSetDemo(): FlashcardSet {
  const now = Date.now();
  return {
    id: `${now}-demo`,
    name: 'Tipos de escenarios',
    cards: [
      { id: `${now}-c0`, title: 'Escenario en H', content: 'El publico se encuentra al lateral izquierdo y derecho del escenario' },
      { id: `${now}-c1`, title: 'Escenario circular', content: 'El público rodea el escenario por todos los lados.' },
    ],
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

  function addFlashcardSet(
    notebookId: string,
    name: string,
    cards: Omit<Card, 'id'>[] = [],
  ) {
    const now = Date.now();
    setNotebooks((current) =>
      current.map((n) =>
        n.id === notebookId
          ? {
            ...n,
            flashcardSets: [
              ...n.flashcardSets,
              {
                id: `${now}-${n.flashcardSets.length}`,
                name,
                cards: cards.map((c, i) => ({ id: `${now}-c${i}`, ...c })),
              },
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