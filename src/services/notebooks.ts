import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@studysmart/notebooks';

export const DEFAULT_NOTEBOOKS = [
  'Teatro',
  'Matemáticas',
  'Estudios filosofales',
  'Cocina',
];

export class DuplicateNotebookError extends Error {
  constructor() {
    super('Ya existe un cuaderno con ese nombre.');
    this.name = 'DuplicateNotebookError';
  }
}

export async function getNotebooks(): Promise<string[]> {
  const storedNotebooks = await AsyncStorage.getItem(STORAGE_KEY);

  if (storedNotebooks === null) {
    return [...DEFAULT_NOTEBOOKS];
  }

  const parsedNotebooks: unknown = JSON.parse(storedNotebooks);
  if (
    !Array.isArray(parsedNotebooks) ||
    !parsedNotebooks.every((notebook) => typeof notebook === 'string')
  ) {
    throw new Error('Los cuadernos guardados tienen un formato inválido.');
  }

  return parsedNotebooks;
}

export async function addNotebook(name: string): Promise<void> {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new Error('Escribe un nombre para el cuaderno.');
  }

  const notebooks = await getNotebooks();
  if (notebooks.some((notebook) => notebook.toLowerCase() === normalizedName.toLowerCase())) {
    throw new DuplicateNotebookError();
  }

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...notebooks, normalizedName])
  );
}
