import Dexie, { Table } from "dexie";

export interface TypeScriptDocument {
  id?: number;
  name: string;
  content: string;
  timestamp: Date;
}

class TypeScriptDatabase extends Dexie {
  documents!: Table<TypeScriptDocument>;

  constructor() {
    super("TypeScriptDatabase");
    this.version(1).stores({
      documents: "++id, name, content, timestamp",
    });
  }
}

const db = new TypeScriptDatabase();

export async function saveDocument(
  name: string,
  content: string
): Promise<number> {
  return await db.documents.add({
    name,
    content,
    timestamp: new Date(),
  });
}

export async function updateDocument(
  id: number,
  name: string,
  content: string
): Promise<void> {
  await db.documents.update(id, {
    name,
    content,
    timestamp: new Date(),
  });
}

export async function updateDocumentName(
  id: number,
  name: string
): Promise<void> {
  await db.documents.update(id, { name });
}

export async function loadDocument(
  id: number
): Promise<TypeScriptDocument | undefined> {
  return await db.documents.get(id);
}

export async function loadLatestDocument(): Promise<
  TypeScriptDocument | undefined
> {
  return await db.documents.orderBy("timestamp").last();
}

export async function getAllDocuments(): Promise<TypeScriptDocument[]> {
  return await db.documents.orderBy("timestamp").reverse().toArray();
}

export async function deleteDocument(id: number): Promise<void> {
  await db.documents.delete(id);
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.documents.count();
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

export default db;
