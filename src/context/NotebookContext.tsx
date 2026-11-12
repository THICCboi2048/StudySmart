import { createContext, useContext, useState, ReactNode } from 'react';

export type Card = {
  id: string;
  title: string;
  content: string;
};

export type FlashcardInput = {
  id?: string;
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
  content: string;
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
  deleteFlashcardSet: (notebookId: string, flashcardSetId: string) => void;
  deleteNote: (notebookId: string, noteId: string) => void;
  getNotebook: (notebookId?: string) => Notebook | undefined;
  addFlashcardSet: (notebookId: string, name: string, cards?: Omit<Card, 'id'>[]) => void;
  updateFlashcardSet: (
    notebookId: string,
    flashcardSetId: string,
    name: string,
    cards: FlashcardInput[],
  ) => void;
  addNote: (notebookId: string, name: string, content: string) => void;
  updateNote: (notebookId: string, noteId: string, name: string, content: string) => void;
};

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  function addNotebook(name: string) {
    setNotebooks((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        name,
        flashcardSets: [],
        notes: [],
      },
    ]);
  }

  function deleteNotebook(notebookId: string) {
    setNotebooks((current) => current.filter((n) => n.id !== notebookId));
  }

  function deleteFlashcardSet(notebookId: string, flashcardSetId: string) {
    setNotebooks((current) =>
      current.map((notebook) =>
        notebook.id === notebookId
          ? {
            ...notebook,
            flashcardSets: notebook.flashcardSets.filter(
              (flashcardSet) => flashcardSet.id !== flashcardSetId,
            ),
          }
          : notebook,
      ),
    );
  }

  function deleteNote(notebookId: string, noteId: string) {
    setNotebooks((current) =>
      current.map((notebook) =>
        notebook.id === notebookId
          ? {
            ...notebook,
            notes: notebook.notes.filter((note) => note.id !== noteId),
          }
          : notebook,
      ),
    );
  }

  function updateFlashcardSet(
    notebookId: string,
    flashcardSetId: string,
    name: string,
    cards: FlashcardInput[],
  ) {
    const now = Date.now();
    setNotebooks((current) =>
      current.map((notebook) =>
        notebook.id === notebookId
          ? {
            ...notebook,
            flashcardSets: notebook.flashcardSets.map((flashcardSet) =>
              flashcardSet.id === flashcardSetId
                ? {
                  ...flashcardSet,
                  name,
                  cards: cards.map((card, index) => ({
                    ...card,
                    id: card.id ?? `${now}-c${index}`,
                  })),
                }
                : flashcardSet,
            ),
          }
          : notebook,
      ),
    );
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

  function addNote(notebookId: string, name: string, content: string) {
    setNotebooks((current) =>
      current.map((notebook) =>
        notebook.id === notebookId
          ? {
            ...notebook,
            notes: [
              ...notebook.notes,
              {
                id: `${Date.now()}-${notebook.notes.length}`,
                name,
                content,
              },
            ],
          }
          : notebook,
      ),
    );
  }

  function updateNote(notebookId: string, noteId: string, name: string, content: string) {
    setNotebooks((current) =>
      current.map((notebook) =>
        notebook.id === notebookId
          ? {
            ...notebook,
            notes: notebook.notes.map((note) =>
              note.id === noteId ? { ...note, name, content } : note,
            ),
          }
          : notebook,
      ),
    );
  }

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        addNotebook,
        deleteNotebook,
        deleteFlashcardSet,
        deleteNote,
        getNotebook,
        addFlashcardSet,
        updateFlashcardSet,
        addNote,
        updateNote,
      }}
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