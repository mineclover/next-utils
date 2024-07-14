import Dexie, { Table } from "dexie";

export interface Document {
  id?: number;
  yaml: string;
  markdown: string;
  timestamp: Date;
}

class DocumentDatabase extends Dexie {
  documents!: Table<Document>;

  constructor() {
    super("DocumentDatabase");
    this.version(1).stores({
      documents: "++id, timestamp",
    });
  }
}

const db = new DocumentDatabase();

export async function saveDocument(
  yaml: string,
  markdown: string
): Promise<number> {
  return await db.documents.add({
    yaml,
    markdown,
    timestamp: new Date(),
  });
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

export async function updateDocument(
  id: number,
  yaml: string,
  markdown: string
): Promise<number> {
  return await db.documents.update(id, {
    yaml,
    markdown,
    timestamp: new Date(),
  });
}

export default db;
