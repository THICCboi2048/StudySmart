import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
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
  deckTitle: string;
  front: string;
  back: string;
  createdAt: Timestamp;
}

export interface UserStreak {
  currentStreak: number;
  lastActivityDate: string | null;
}

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

function activityDayDocument(uid: string, dateKey: string) {
  return doc(collection(getFirebaseFirestore(), 'users', uid, 'activityDays'), dateKey);
}

function streakDocument(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'streak', 'current');
}

function localDateKey(date: Date): string {
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
    deckTitle: data.deckTitle,
    front: data.front,
    back: data.back,
    createdAt: data.createdAt,
  };
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
  const snapshot = await getDocs(notebookCollection(uid));
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
    query(flashcardCollection(uid), where('notebookId', '==', notebookId))
  );

  return snapshot.docs
    .map((item) => parseFlashcard(item.id, item.data(), uid))
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

export async function createUserFlashcard(
  uid: string,
  notebookId: string,
  deckTitle: string,
  front: string,
  back: string
): Promise<void> {
  const normalizedDeckTitle = deckTitle.trim();
  const normalizedFront = front.trim();
  const normalizedBack = back.trim();

  if (!normalizedDeckTitle || normalizedDeckTitle.length > 100) {
    throw new Error('El título debe tener entre 1 y 100 caracteres.');
  }
  if (!normalizedFront || normalizedFront.length > 2000) {
    throw new Error('El frente debe tener entre 1 y 2000 caracteres.');
  }
  if (!normalizedBack || normalizedBack.length > 2000) {
    throw new Error('El reverso debe tener entre 1 y 2000 caracteres.');
  }

  const notebook = await getUserNotebook(uid, notebookId);
  if (!notebook) {
    throw new Error('No se encontró el cuaderno seleccionado.');
  }

  await addDoc(flashcardCollection(uid), {
    uid,
    notebookId,
    deckTitle: normalizedDeckTitle,
    front: normalizedFront,
    back: normalizedBack,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
