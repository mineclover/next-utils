import Dexie, { Table } from "dexie";

export interface TypeScriptFile {
  id?: number;
  path: string;
  name: string;
}

export interface TypeScriptVersion {
  id?: number;
  fileId: number;
  content: string;
  commitName: string;
  description: string;
  timestamp: Date;
}

class TypeScriptDatabase extends Dexie {
  files!: Table<TypeScriptFile>;
  versions!: Table<TypeScriptVersion>;

  constructor() {
    super("TypeScriptDatabase");
    this.version(1).stores({
      files: "++id, path, name",
      versions: "++id, fileId, timestamp",
    });
  }
}

const db = new TypeScriptDatabase();

export async function saveFile(
  path: string,
  name: string,
  content: string,
  commitName: string,
  description: string
): Promise<number> {
  const fileId = await db.files.add({
    path,
    name,
  });

  await db.versions.add({
    fileId,
    content,
    commitName,
    description,
    timestamp: new Date(),
  });

  return fileId;
}

export async function updateFile(
  fileId: number,
  content: string,
  commitName: string,
  description: string
): Promise<void> {
  await db.versions.add({
    fileId,
    content,
    commitName,
    description,
    timestamp: new Date(),
  });
}

export async function updateFileName(
  fileId: number,
  newName: string
): Promise<void> {
  await db.files.update(fileId, { name: newName });
  await db.versions.add({
    fileId,
    content: "", // No content change
    commitName: "File renamed",
    description: `File renamed to ${newName}`,
    timestamp: new Date(),
  });
}

export async function updateFilePath(
  fileId: number,
  newPath: string
): Promise<void> {
  await db.files.update(fileId, { path: newPath });
  await db.versions.add({
    fileId,
    content: "", // No content change
    commitName: "File moved",
    description: `File moved to ${newPath}`,
    timestamp: new Date(),
  });
}

export async function getFile(
  fileId: number
): Promise<
  { file: TypeScriptFile; latestVersion: TypeScriptVersion } | undefined
> {
  const file = await db.files.get(fileId);
  if (!file) return undefined;

  const versions = await db.versions
    .where("fileId")
    .equals(fileId)
    .reverse()
    .sortBy("timestamp");
  const latestVersion = versions[0];

  return { file, latestVersion };
}

export async function getAllFiles(
  path?: string
): Promise<Array<{ file: TypeScriptFile; latestVersion: TypeScriptVersion }>> {
  let files;
  if (path) {
    files = await db.files.where("path").equals(path).toArray();
  } else {
    files = await db.files.toArray();
  }

  const result = await Promise.all(
    files.map(async (file) => {
      const versions = await db.versions
        .where("fileId")
        .equals(file.id!)
        .reverse()
        .sortBy("timestamp");
      return { file, latestVersion: versions[0] };
    })
  );

  return result.sort(
    (a, b) =>
      b.latestVersion.timestamp.getTime() - a.latestVersion.timestamp.getTime()
  );
}

export async function getFileVersions(
  fileId: number
): Promise<TypeScriptVersion[]> {
  return await db.versions
    .where("fileId")
    .equals(fileId)
    .reverse()
    .sortBy("timestamp");
}

export async function deleteFile(fileId: number): Promise<void> {
  await db.versions.where("fileId").equals(fileId).delete();
  await db.files.delete(fileId);
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.files.count();
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

export default db;
