"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  saveFile,
  updateFile,
  updateFileName,
  updateFilePath,
  getFile,
  getAllFiles,
  deleteFile,
  getFileVersions,
  TypeScriptFile,
  TypeScriptVersion,
  checkDatabaseConnection,
} from "@/model/typescriptDB";
import { addPath, getAllPaths, deletePath } from "@/model/pathDB";
import styles from "@/styles/EditorStyles.module.css";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import FileVersions from "@/components/FileVersions";

function generateAnonymousName(): string {
  return `Untitled_${new Date().toISOString().replace(/[-:\.]/g, "_")}`;
}

export default function TypeScriptEditorPage() {
  const [currentFileId, setCurrentFileId] = useState<number | undefined>();
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState(
    "// Start typing your TypeScript code here"
  );
  const [commitName, setCommitName] = useState("");
  const [description, setDescription] = useState("");
  const [savedFiles, setSavedFiles] = useState<
    Array<{ file: TypeScriptFile; latestVersion: TypeScriptVersion }>
  >([]);
  const [fileVersions, setFileVersions] = useState<TypeScriptVersion[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [availablePaths, setAvailablePaths] = useState<string[]>(["/"]);
  const [selectedSidebarPath, setSelectedSidebarPath] = useState<string>("/");
  const [pathFileCount, setPathFileCount] = useState<Record<string, number>>(
    {}
  );

  const loadAllFiles = useCallback(async () => {
    try {
      const files = await getAllFiles();
      setSavedFiles(files);

      const counts: Record<string, number> = {};
      files.forEach(({ file }) => {
        const pathParts = file.path.split("/").filter(Boolean);
        let currentPath = "/";
        counts[currentPath] = (counts[currentPath] || 0) + 1;
        pathParts.forEach((part) => {
          currentPath += part + "/";
          counts[currentPath] = (counts[currentPath] || 0) + 1;
        });
      });
      setPathFileCount(counts);
    } catch (error) {
      console.error("Error loading files:", error);
      setDbError("Failed to load files. Please refresh the page.");
    }
  }, []);

  const loadAllPaths = useCallback(async () => {
    try {
      const paths = await getAllPaths();
      setAvailablePaths(["/", ...paths]);
    } catch (error) {
      console.error("Error loading paths:", error);
      setDbError("Failed to load paths. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    const initDb = async () => {
      const isConnected = await checkDatabaseConnection();
      if (isConnected) {
        await loadAllFiles();
        await loadAllPaths();
      } else {
        setDbError(
          "Failed to connect to the database. Please refresh the page."
        );
      }
    };

    initDb();
  }, [loadAllFiles, loadAllPaths]);

  const handleSave = useCallback(async () => {
    try {
      let finalFileName = fileName || generateAnonymousName();
      let finalCommitName = commitName || "Update file";

      // 현재 경로와 파일 이름으로 이미 존재하는 파일 찾기
      const existingFile = savedFiles.find(
        ({ file }) => file.path === currentPath && file.name === finalFileName
      );

      if (existingFile) {
        // 파일이 이미 존재하면 업데이트
        await updateFile(
          existingFile.file.id!,
          content,
          finalCommitName,
          description
        );
        setCurrentFileId(existingFile.file.id);
      } else {
        // 새 파일 저장
        const newId = await saveFile(
          currentPath,
          finalFileName,
          content,
          finalCommitName,
          description
        );
        setCurrentFileId(newId);
      }

      await loadAllFiles();
      if (currentFileId !== undefined) {
        const versions = await getFileVersions(currentFileId);
        setFileVersions(versions);
      }
      setCommitName("");
      setDescription("");
      console.log("File saved!");
    } catch (error) {
      console.error("Error saving file:", error);
      setDbError("Failed to save the file. Please try again.");
    }
  }, [
    currentPath,
    fileName,
    content,
    commitName,
    description,
    loadAllFiles,
    savedFiles,
    currentFileId,
  ]);

  const handleAddPath = async (newPath: string) => {
    if (newPath && newPath !== "/") {
      await addPath(newPath);
      await loadAllPaths();
      await loadAllFiles();
    }
  };

  const handleDeletePath = async (path: string) => {
    if (path !== "/") {
      await deletePath(path);
      await loadAllPaths();
      await loadAllFiles();
      if (currentPath === path) {
        setCurrentPath("/");
      }
      if (selectedSidebarPath === path) {
        setSelectedSidebarPath("/");
      }
    }
  };

  const handleSelectPath = (path: string) => {
    setSelectedSidebarPath(path);
  };

  const handleLoadFile = async (fileId: number) => {
    try {
      const fileData = await getFile(fileId);
      if (fileData) {
        setCurrentFileId(fileData.file.id);
        setFileName(fileData.file.name);
        setContent(fileData.latestVersion.content);
        setCurrentPath(fileData.file.path);
        const versions = await getFileVersions(fileId);
        setFileVersions(versions);
      }
    } catch (error) {
      console.error("Error loading file:", error);
      setDbError("Failed to load the file. Please try again.");
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteFile(fileId);
      await loadAllFiles();
      if (fileId === currentFileId) {
        setCurrentFileId(undefined);
        setFileName("");
        setContent("// Start typing your TypeScript code here");
        setFileVersions([]);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setDbError("Failed to delete the file. Please try again.");
    }
  };

  const handleLoadVersion = (version: TypeScriptVersion) => {
    setContent(version.content);
    setCommitName(`Revert to: ${version.commitName}`);
    setDescription(
      `Reverted to version from ${version.timestamp.toLocaleString()}`
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  if (dbError) {
    return <div className={styles.error}>{dbError}</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <Sidebar
        availablePaths={availablePaths}
        savedFiles={savedFiles}
        pathFileCount={pathFileCount}
        selectedSidebarPath={selectedSidebarPath}
        onSelectPath={handleSelectPath}
        onDeletePath={handleDeletePath}
        onLoadFile={handleLoadFile}
        onDeleteFile={handleDeleteFile}
        onAddPath={handleAddPath}
      />
      <div className={styles.mainContent}>
        <Editor
          currentPath={currentPath}
          fileName={fileName}
          content={content}
          commitName={commitName}
          description={description}
          onChangeFileName={setFileName}
          onChangeContent={setContent}
          onChangeCommitName={setCommitName}
          onChangeDescription={setDescription}
          onSave={handleSave}
          onChangePath={setCurrentPath}
          availablePaths={availablePaths}
        />
        <FileVersions
          versions={fileVersions}
          onLoadVersion={handleLoadVersion}
        />
      </div>
    </div>
  );
}
