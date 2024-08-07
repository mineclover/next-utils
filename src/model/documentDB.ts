import Dexie, { Table } from "dexie";

export interface Document {
  id?: number;
  name: string;
  yaml: string;
  markdown: string;
  timestamp: Date;
}

class DocumentDatabase extends Dexie {
  documents!: Table<Document>;

  constructor() {
    super("DocumentDatabase");
    this.version(1).stores({
      documents: "++id, name, yaml, markdown, timestamp",
    });
  }
}

const db = new DocumentDatabase();

export async function saveDocument(
  name: string,
  yaml: string,
  markdown: string
): Promise<number> {
  return await db.documents.add({
    name,
    yaml,
    markdown,
    timestamp: new Date(),
  });
}

export async function updateDocument(
  id: number,
  name: string,
  yaml: string,
  markdown: string
): Promise<void> {
  await db.documents.update(id, {
    name,
    yaml,
    markdown,
    timestamp: new Date(),
  });
}

export async function updateDocumentName(
  id: number,
  name: string
): Promise<void> {
  await db.documents.update(id, { name });
}

export async function loadDocument(id: number): Promise<Document | undefined> {
  return await db.documents.get(id);
}

export async function loadLatestDocument(): Promise<Document | undefined> {
  return await db.documents.orderBy("timestamp").last();
}

export async function getAllDocuments(): Promise<Document[]> {
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
