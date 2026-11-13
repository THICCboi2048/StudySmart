import { FirebaseError } from 'firebase/app';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuthSession } from '../hooks/use-auth-session';
import {
  createUserFlashcardSet,
  createUserNote,
  createUserNotebook,
  deleteUserFlashcardSet,
  deleteUserNote,
  deleteUserNotebook,
  getAllUserFlashcards,
  getAllUserNotes,
  getUserNotebooks,
  updateUserFlashcardSet,
  updateUserNote,
  type FlashcardInput as StoredFlashcardInput,
} from '../services/study-data';

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
  loadStatus: 'loading' | 'ready' | 'error';
  isSignedIn: boolean;
  error: string;
  clearError: () => void;
  addNotebook: (name: string) => Promise<void>;
  deleteNotebook: (notebookId: string) => Promise<void>;
  deleteFlashcardSet: (notebookId: string, flashcardSetId: string) => Promise<void>;
  deleteNote: (notebookId: string, noteId: string) => Promise<void>;
  getNotebook: (notebookId?: string) => Notebook | undefined;
  addFlashcardSet: (
    notebookId: string,
    name: string,
    cards?: Omit<Card, 'id'>[]
  ) => Promise<void>;
  updateFlashcardSet: (
    notebookId: string,
    flashcardSetId: string,
    name: string,
    cards: FlashcardInput[]
  ) => Promise<void>;
  addNote: (notebookId: string, name: string, content: string) => Promise<void>;
  updateNote: (
    notebookId: string,
    noteId: string,
    name: string,
    content: string
  ) => Promise<void>;
};

const NotebookContext = createContext<NotebookContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Firebase rechazó la operación. Verifica las reglas de Firestore.';
  }
  if (error instanceof FirebaseError && error.code === 'unavailable') {
    return 'No se pudo conectar con Firebase. Revisa tu conexión.';
  }
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error al guardar los datos.';
}

async function loadNotebookData(uid: string): Promise<Notebook[]> {
  const [storedNotebooks, storedFlashcards, storedNotes] = await Promise.all([
    getUserNotebooks(uid),
    getAllUserFlashcards(uid),
    getAllUserNotes(uid),
  ]);
  const flashcardsByNotebook = new Map<string, Map<string, FlashcardSet>>();
  const notesByNotebook = new Map<string, Note[]>();

  storedFlashcards.forEach((card) => {
    let decks = flashcardsByNotebook.get(card.notebookId);
    if (!decks) {
      decks = new Map();
      flashcardsByNotebook.set(card.notebookId, decks);
    }

    let deck = decks.get(card.deckId);
    if (!deck) {
      deck = { id: card.deckId, name: card.deckTitle, cards: [] };
      decks.set(card.deckId, deck);
    }
    deck.cards.push({ id: card.id, title: card.front, content: card.back });
  });

  storedNotes.forEach((note) => {
    const notes = notesByNotebook.get(note.notebookId) ?? [];
    notes.push({ id: note.id, name: note.name, content: note.content });
    notesByNotebook.set(note.notebookId, notes);
  });

  return storedNotebooks.map((notebook) => ({
    id: notebook.id,
    name: notebook.name,
    flashcardSets: [...(flashcardsByNotebook.get(notebook.id)?.values() ?? [])],
    notes: notesByNotebook.get(notebook.id) ?? [],
  }));
}

export function NotebookProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loadedUid, setLoadedUid] = useState('');
  const [loadError, setLoadError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const uid = session.status === 'signedIn' ? session.user.uid : null;

  useEffect(() => {
    let active = true;

    if (!uid) return () => {
      active = false;
    };

    void loadNotebookData(uid)
      .then((loadedNotebooks) => {
        if (active) {
          setNotebooks(loadedNotebooks);
          setLoadedUid(uid);
          setLoadError('');
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setLoadedUid(uid);
          setLoadError(getErrorMessage(loadError));
        }
      });

    return () => {
      active = false;
    };
  }, [uid]);

  const loadStatus: NotebookContextValue['loadStatus'] =
    session.status === 'loading' || (uid !== null && loadedUid !== uid)
      ? 'loading'
      : session.status === 'error' || (!!uid && !!loadError)
        ? 'error'
        : 'ready';
  const error =
    session.status === 'error'
      ? session.error
      : uid
        ? mutationError || (uid === loadedUid ? loadError : '')
        : '';
  const visibleNotebooks =
    uid && loadedUid === uid ? notebooks : [];

  async function performMutation(
    mutation: (currentUid: string) => Promise<void>
  ): Promise<void> {
    if (!uid) {
      const signInError = new Error('Inicia sesión para guardar tus datos.');
      setMutationError(signInError.message);
      throw signInError;
    }

    setMutationError('');
    try {
      await mutation(uid);
      const updatedNotebooks = await loadNotebookData(uid);
      setNotebooks(updatedNotebooks);
      setLoadedUid(uid);
      setLoadError('');
    } catch (mutationError) {
      setMutationError(getErrorMessage(mutationError));
      throw mutationError;
    }
  }

  function addNotebook(name: string): Promise<void> {
    return performMutation((currentUid) => createUserNotebook(currentUid, name));
  }

  function deleteNotebook(notebookId: string): Promise<void> {
    return performMutation((currentUid) =>
      deleteUserNotebook(currentUid, notebookId)
    );
  }

  function deleteFlashcardSet(
    notebookId: string,
    flashcardSetId: string
  ): Promise<void> {
    return performMutation((currentUid) =>
      deleteUserFlashcardSet(currentUid, notebookId, flashcardSetId)
    );
  }

  function deleteNote(notebookId: string, noteId: string): Promise<void> {
    return performMutation((currentUid) =>
      deleteUserNote(currentUid, notebookId, noteId)
    );
  }

  function getNotebook(notebookId?: string) {
    return visibleNotebooks.find((notebook) => notebook.id === notebookId);
  }

  function addFlashcardSet(
    notebookId: string,
    name: string,
    cards: Omit<Card, 'id'>[] = []
  ): Promise<void> {
    const storedCards: StoredFlashcardInput[] = cards.map((card) => ({
      title: card.title,
      content: card.content,
    }));
    return performMutation((currentUid) =>
      createUserFlashcardSet(currentUid, notebookId, name, storedCards)
    );
  }

  function updateFlashcardSet(
    notebookId: string,
    flashcardSetId: string,
    name: string,
    cards: FlashcardInput[]
  ): Promise<void> {
    return performMutation((currentUid) =>
      updateUserFlashcardSet(
        currentUid,
        notebookId,
        flashcardSetId,
        name,
        cards
      )
    );
  }

  function addNote(
    notebookId: string,
    name: string,
    content: string
  ): Promise<void> {
    return performMutation((currentUid) =>
      createUserNote(currentUid, notebookId, name, content)
    );
  }

  function updateNote(
    notebookId: string,
    noteId: string,
    name: string,
    content: string
  ): Promise<void> {
    return performMutation((currentUid) =>
      updateUserNote(currentUid, notebookId, noteId, name, content)
    );
  }

  return (
    <NotebookContext.Provider
      value={{
        notebooks: visibleNotebooks,
        loadStatus,
        isSignedIn: session.status === 'signedIn',
        error,
        clearError: () => setMutationError(''),
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
