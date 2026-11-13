import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { getFirebaseAuth } from './firebaseAuth';
import { getFirebaseFirestore } from './firebase';

export interface Notebook {
  id: string;
  uid: string;
  name: string;
  createdAt: Timestamp;
}

export interface Flashcard {
  id: string;
  uid: string;
  notebookId: string;
  deckId: string;
  deckTitle: string;
  front: string;
  back: string;
  createdAt: Timestamp;
}

export interface StudyNote {
  id: string;
  uid: string;
  notebookId: string;
  name: string;
  content: string;
  createdAt: Timestamp;
}

export interface FlashcardInput {
  id?: string;
  title: string;
  content: string;
}

export interface UserStreak {
  currentStreak: number;
  lastActivityDate: string | null;
}

const MAX_FLASHCARDS_PER_DECK = 200;
const MAX_NOTE_CONTENT_LENGTH = 10000;

export class DuplicateNotebookError extends Error {
  constructor() {
    super('Ya existe un cuaderno con ese nombre.');
    this.name = 'DuplicateNotebookError';
  }
}

function userDocument(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid);
}

function notebookCollection(uid: string) {
  return collection(getFirebaseFirestore(), 'users', uid, 'notebooks');
}

function flashcardCollection(uid: string) {
  return collection(getFirebaseFirestore(), 'users', uid, 'flashcards');
}

function noteCollection(uid: string) {
  return collection(getFirebaseFirestore(), 'users', uid, 'notes');
}

function activityDayDocument(uid: string, dateKey: string) {
  return doc(collection(getFirebaseFirestore(), 'users', uid, 'activityDays'), dateKey);
}

function streakDocument(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'streak', 'current');
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function previousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}

function parseStreak(data: Record<string, unknown>): UserStreak {
  const currentStreak = data.currentStreak;
  if (
    typeof currentStreak !== 'number' ||
    !Number.isInteger(currentStreak) ||
    currentStreak < 1 ||
    typeof data.lastActivityDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.lastActivityDate) ||
    !(data.updatedAt instanceof Timestamp)
  ) {
    throw new Error('La racha guardada tiene un formato inválido.');
  }

  return {
    currentStreak,
    lastActivityDate: data.lastActivityDate,
  };
}

function assertRegisteredUser(uid: string): void {
  const user = getFirebaseAuth().currentUser;
  if (!user || user.uid !== uid || user.isAnonymous) {
    throw new Error('Inicia sesión con una cuenta registrada para usar tu racha.');
  }
}

function parseNotebook(id: string, data: Record<string, unknown>, uid: string): Notebook {
  if (
    data.uid !== uid ||
    typeof data.name !== 'string' ||
    !(data.createdAt instanceof Timestamp)
  ) {
    throw new Error('Un cuaderno guardado tiene un formato inválido.');
  }

  return { id, uid, name: data.name, createdAt: data.createdAt };
}

function parseFlashcard(
  id: string,
  data: Record<string, unknown>,
  uid: string
): Flashcard {
  if (
    data.uid !== uid ||
    typeof data.notebookId !== 'string' ||
    typeof data.deckId !== 'string' ||
    typeof data.deckTitle !== 'string' ||
    typeof data.front !== 'string' ||
    typeof data.back !== 'string' ||
    !(data.createdAt instanceof Timestamp)
  ) {
    throw new Error('Una flashcard guardada tiene un formato inválido.');
  }

  return {
    id,
    uid,
    notebookId: data.notebookId,
    deckId: data.deckId,
    deckTitle: data.deckTitle,
    front: data.front,
    back: data.back,
    createdAt: data.createdAt,
  };
}

function parseNote(id: string, data: Record<string, unknown>, uid: string): StudyNote {
  if (
    data.uid !== uid ||
    typeof data.notebookId !== 'string' ||
    typeof data.name !== 'string' ||
    typeof data.content !== 'string' ||
    !(data.createdAt instanceof Timestamp)
  ) {
    throw new Error('Una nota guardada tiene un formato inválido.');
  }

  return {
    id,
    uid,
    notebookId: data.notebookId,
    name: data.name,
    content: data.content,
    createdAt: data.createdAt,
  };
}

function validateDeck(
  deckTitle: string,
  cards: FlashcardInput[]
): { deckTitle: string; cards: FlashcardInput[] } {
  const normalizedTitle = deckTitle.trim();
  if (!normalizedTitle || normalizedTitle.length > 100) {
    throw new Error('El título debe tener entre 1 y 100 caracteres.');
  }
  if (cards.length < 1 || cards.length > MAX_FLASHCARDS_PER_DECK) {
    throw new Error(`El set debe tener entre 1 y ${MAX_FLASHCARDS_PER_DECK} tarjetas.`);
  }

  const normalizedCards = cards.map((card) => ({
    ...(card.id ? { id: card.id } : {}),
    title: card.title.trim(),
    content: card.content.trim(),
  }));
  if (
    normalizedCards.some(
      (card) =>
        !card.title ||
        card.title.length > 2000 ||
        !card.content ||
        card.content.length > 2000
    )
  ) {
    throw new Error('Cada tarjeta necesita título y contenido de hasta 2000 caracteres.');
  }

  return { deckTitle: normalizedTitle, cards: normalizedCards };
}

export async function ensureUserProfile(uid: string): Promise<void> {
  const db = getFirebaseFirestore();
  const profileRef = userDocument(uid);

  await runTransaction(db, async (transaction) => {
    const profile = await transaction.get(profileRef);
    if (!profile.exists()) {
      transaction.set(profileRef, {
        uid,
        createdAt: serverTimestamp(),
      });
    } else if (profile.data().uid !== uid) {
      throw new Error('El perfil no coincide con la sesión actual.');
    }
  });
}

export async function getUserStreak(uid: string): Promise<UserStreak> {
  assertRegisteredUser(uid);
  const snapshot = await getDoc(streakDocument(uid));
  if (!snapshot.exists()) {
    return { currentStreak: 0, lastActivityDate: null };
  }

  const streak = parseStreak(snapshot.data());
  const today = localDateKey(new Date());
  const yesterday = previousDateKey(today);
  return {
    ...streak,
    currentStreak:
      streak.lastActivityDate === today || streak.lastActivityDate === yesterday
        ? streak.currentStreak
        : 0,
  };
}

export async function recordUserActivity(uid: string): Promise<void> {
  assertRegisteredUser(uid);

  const db = getFirebaseFirestore();
  const today = localDateKey(new Date());
  const todayRef = activityDayDocument(uid, today);
  const streakRef = streakDocument(uid);

  await runTransaction(db, async (transaction) => {
    const [todaySnapshot, streakSnapshot] = await Promise.all([
      transaction.get(todayRef),
      transaction.get(streakRef),
    ]);
    const previousStreak = streakSnapshot.exists()
      ? parseStreak(streakSnapshot.data())
      : null;

    if (todaySnapshot.exists() && previousStreak?.lastActivityDate === today) {
      return;
    }

    const nextStreak =
      previousStreak?.lastActivityDate === today
        ? previousStreak.currentStreak
        : previousStreak?.lastActivityDate === previousDateKey(today)
          ? previousStreak.currentStreak + 1
          : 1;

    if (!todaySnapshot.exists()) {
      transaction.set(todayRef, {
        dateKey: today,
        createdAt: serverTimestamp(),
      });
    }
    transaction.set(streakRef, {
      currentStreak: nextStreak,
      lastActivityDate: today,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getUserNotebooks(uid: string): Promise<Notebook[]> {
  const snapshot = await getDocs(
    query(notebookCollection(uid), where('uid', '==', uid))
  );
  return snapshot.docs
    .map((item) => parseNotebook(item.id, item.data(), uid))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

export async function getUserNotebook(
  uid: string,
  notebookId: string
): Promise<Notebook | null> {
  const snapshot = await getDoc(doc(notebookCollection(uid), notebookId));
  return snapshot.exists()
    ? parseNotebook(snapshot.id, snapshot.data(), uid)
    : null;
}

export async function createUserNotebook(uid: string, name: string): Promise<void> {
  const normalizedName = name.trim();
  if (!normalizedName || normalizedName.length > 80) {
    throw new Error('El nombre del cuaderno debe tener entre 1 y 80 caracteres.');
  }

  const notebooks = await getUserNotebooks(uid);
  if (
    notebooks.some(
      (notebook) => notebook.name.toLowerCase() === normalizedName.toLowerCase()
    )
  ) {
    throw new DuplicateNotebookError();
  }

  await addDoc(notebookCollection(uid), {
    uid,
    name: normalizedName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserFlashcards(
  uid: string,
  notebookId: string
): Promise<Flashcard[]> {
  const snapshot = await getDocs(
    query(
      flashcardCollection(uid),
      where('uid', '==', uid),
      where('notebookId', '==', notebookId)
    )
  );

  return snapshot.docs
    .map((item) => parseFlashcard(item.id, item.data(), uid))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

export async function getAllUserFlashcards(uid: string): Promise<Flashcard[]> {
  const snapshot = await getDocs(
    query(flashcardCollection(uid), where('uid', '==', uid))
  );
  return snapshot.docs
    .map((item) => parseFlashcard(item.id, item.data(), uid))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

export async function createUserFlashcardSet(
  uid: string,
  notebookId: string,
  deckTitle: string,
  cards: FlashcardInput[]
): Promise<void> {
  const normalized = validateDeck(deckTitle, cards);
  const notebook = await getUserNotebook(uid, notebookId);
  if (!notebook) {
    throw new Error('No se encontró el cuaderno seleccionado.');
  }

  const db = getFirebaseFirestore();
  const collectionRef = flashcardCollection(uid);
  const deckId = doc(collectionRef).id;
  const batch = writeBatch(db);

  normalized.cards.forEach((card) => {
    batch.set(doc(collectionRef), {
      uid,
      notebookId,
      deckId,
      deckTitle: normalized.deckTitle,
      front: card.title,
      back: card.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function updateUserFlashcardSet(
  uid: string,
  notebookId: string,
  deckId: string,
  deckTitle: string,
  cards: FlashcardInput[]
): Promise<void> {
  const normalized = validateDeck(deckTitle, cards);
  const existing = (await getUserFlashcards(uid, notebookId)).filter(
    (card) => card.deckId === deckId
  );
  if (existing.length === 0) {
    throw new Error('No se encontró la flashcard que quieres editar.');
  }

  const existingById = new Map(existing.map((card) => [card.id, card]));
  const retainedIds = new Set<string>();
  const db = getFirebaseFirestore();
  const collectionRef = flashcardCollection(uid);
  const batch = writeBatch(db);

  normalized.cards.forEach((card) => {
    if (card.id) {
      const current = existingById.get(card.id);
      if (!current) {
        throw new Error('Una tarjeta no pertenece a este set.');
      }
      retainedIds.add(card.id);
      batch.update(doc(collectionRef, card.id), {
        deckTitle: normalized.deckTitle,
        front: card.title,
        back: card.content,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(doc(collectionRef), {
        uid,
        notebookId,
        deckId,
        deckTitle: normalized.deckTitle,
        front: card.title,
        back: card.content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });

  existing.forEach((card) => {
    if (!retainedIds.has(card.id)) {
      batch.delete(doc(collectionRef, card.id));
    }
  });

  await batch.commit();
}

export async function deleteUserFlashcardSet(
  uid: string,
  notebookId: string,
  deckId: string
): Promise<void> {
  const cards = (await getUserFlashcards(uid, notebookId)).filter(
    (card) => card.deckId === deckId
  );
  if (cards.length === 0) return;

  const batch = writeBatch(getFirebaseFirestore());
  cards.forEach((card) => batch.delete(doc(flashcardCollection(uid), card.id)));
  await batch.commit();
}

export async function getUserNotes(
  uid: string,
  notebookId: string
): Promise<StudyNote[]> {
  const snapshot = await getDocs(
    query(
      noteCollection(uid),
      where('uid', '==', uid),
      where('notebookId', '==', notebookId)
    )
  );

  return snapshot.docs
    .map((item) => parseNote(item.id, item.data(), uid))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

export async function getAllUserNotes(uid: string): Promise<StudyNote[]> {
  const snapshot = await getDocs(query(noteCollection(uid), where('uid', '==', uid)));
  return snapshot.docs
    .map((item) => parseNote(item.id, item.data(), uid))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

export async function createUserNote(
  uid: string,
  notebookId: string,
  name: string,
  content: string
): Promise<void> {
  const normalizedName = name.trim();
  const normalizedContent = content.trim();
  if (!normalizedName || normalizedName.length > 100) {
    throw new Error('El título de la nota debe tener entre 1 y 100 caracteres.');
  }
  if (normalizedContent.length > MAX_NOTE_CONTENT_LENGTH) {
    throw new Error('El contenido de la nota es demasiado largo.');
  }
  if (!(await getUserNotebook(uid, notebookId))) {
    throw new Error('No se encontró el cuaderno seleccionado.');
  }

  await addDoc(noteCollection(uid), {
    uid,
    notebookId,
    name: normalizedName,
    content: normalizedContent,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserNote(
  uid: string,
  notebookId: string,
  noteId: string,
  name: string,
  content: string
): Promise<void> {
  const normalizedName = name.trim();
  const normalizedContent = content.trim();
  if (!normalizedName || normalizedName.length > 100) {
    throw new Error('El título de la nota debe tener entre 1 y 100 caracteres.');
  }
  if (normalizedContent.length > MAX_NOTE_CONTENT_LENGTH) {
    throw new Error('El contenido de la nota es demasiado largo.');
  }

  const noteRef = doc(noteCollection(uid), noteId);
  const snapshot = await getDoc(noteRef);
  if (!snapshot.exists()) {
    throw new Error('No se encontró la nota que quieres editar.');
  }
  const note = parseNote(snapshot.id, snapshot.data(), uid);
  if (note.notebookId !== notebookId) {
    throw new Error('La nota no pertenece a este cuaderno.');
  }

  await updateDoc(noteRef, {
    name: normalizedName,
    content: normalizedContent,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserNote(
  uid: string,
  notebookId: string,
  noteId: string
): Promise<void> {
  const noteRef = doc(noteCollection(uid), noteId);
  const snapshot = await getDoc(noteRef);
  if (!snapshot.exists()) return;
  const note = parseNote(snapshot.id, snapshot.data(), uid);
  if (note.notebookId !== notebookId) {
    throw new Error('La nota no pertenece a este cuaderno.');
  }
  await deleteDoc(noteRef);
}

export async function deleteUserNotebook(uid: string, notebookId: string): Promise<void> {
  const notebook = await getUserNotebook(uid, notebookId);
  if (!notebook) return;

  const [flashcards, notes] = await Promise.all([
    getUserFlashcards(uid, notebookId),
    getUserNotes(uid, notebookId),
  ]);
  const db = getFirebaseFirestore();
  const refs = [
    ...flashcards.map((card) => doc(flashcardCollection(uid), card.id)),
    ...notes.map((note) => doc(noteCollection(uid), note.id)),
  ];

  for (let index = 0; index < refs.length; index += 400) {
    const batch = writeBatch(db);
    refs.slice(index, index + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  await deleteDoc(doc(notebookCollection(uid), notebookId));
}

export async function createUserFlashcard(
  uid: string,
  notebookId: string,
  deckTitle: string,
  front: string,
  back: string
): Promise<void> {
  await createUserFlashcardSet(uid, notebookId, deckTitle, [
    { title: front, content: back },
  ]);
}
