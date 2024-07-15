import Dexie, { Table } from "dexie";

export interface PathEntry {
  id?: number;
  path: string;
}

class PathDatabase extends Dexie {
  paths!: Table<PathEntry>;

  constructor() {
    super("PathDatabase");
    this.version(1).stores({
      paths: "++id, path",
    });
  }
}

const db = new PathDatabase();

export async function addPath(path: string): Promise<number> {
  return await db.paths.add({ path });
}

export async function getAllPaths(): Promise<string[]> {
  const pathEntries = await db.paths.toArray();
  return pathEntries.map((entry) => entry.path);
}

export async function deletePath(path: string): Promise<void> {
  await db.paths.where("path").equals(path).delete();
}

export default db;
