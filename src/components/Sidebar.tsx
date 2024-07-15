import React, { useState } from "react";
import { TypeScriptFile, TypeScriptVersion } from "@/model/typescriptDB";
import styles from "@/styles/EditorStyles.module.css";

interface SidebarProps {
  availablePaths: string[];
  savedFiles: Array<{ file: TypeScriptFile; latestVersion: TypeScriptVersion }>;
  pathFileCount: Record<string, number>;
  selectedSidebarPath: string;
  onSelectPath: (path: string) => void;
  onDeletePath: (path: string) => void;
  onLoadFile: (fileId: number) => void;
  onDeleteFile: (fileId: number) => void;
  onAddPath: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  availablePaths,
  savedFiles,
  pathFileCount,
  selectedSidebarPath,
  onSelectPath,
  onDeletePath,
  onLoadFile,
  onDeleteFile,
  onAddPath,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["/"])
  );
  const [newPath, setNewPath] = useState<string>("");

  const togglePathExpansion = (path: string) => {
    setExpandedPaths((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return newExpanded;
    });
  };

  const handleAddPath = () => {
    if (newPath && !availablePaths.includes(newPath)) {
      onAddPath(newPath);
      setNewPath("");
    }
  };

  const renderPathTree = (paths: string[]) => {
    const pathTree: Record<string, string[]> = { "/": [] };
    paths.forEach((path) => {
      if (path === "/") return;
      const parts = path.split("/").filter(Boolean);
      let currentPath = "";
      parts.forEach((part) => {
        const parentPath = currentPath;
        currentPath += "/" + part;
        if (!pathTree[currentPath]) {
          pathTree[currentPath] = [];
          pathTree[parentPath || "/"].push(currentPath);
        }
      });
    });

    const renderPathNode = (path: string, depth = 0) => {
      const hasChildren = pathTree[path] && pathTree[path].length > 0;
      const isExpanded = expandedPaths.has(path);

      return (
        <li key={path} className={styles.pathNode}>
          <div className={styles.pathNodeContent}>
            {hasChildren && (
              <span
                className={`${styles.expandIcon} ${
                  isExpanded ? styles.expanded : ""
                }`}
                onClick={() => togglePathExpansion(path)}
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            )}
            <span
              className={`${styles.pathName} ${
                selectedSidebarPath === path ? styles.selectedPath : ""
              }`}
              onClick={() => onSelectPath(path)}
            >
              {path.split("/").pop() || "/"} ({pathFileCount[path] || 0})
            </span>
            {path !== "/" && (
              <button
                onClick={() => onDeletePath(path)}
                className={styles.deletePathButton}
              >
                Delete
              </button>
            )}
          </div>
          {hasChildren && isExpanded && (
            <ul className={styles.pathList}>
              {pathTree[path].map((childPath) =>
                renderPathNode(childPath, depth + 1)
              )}
            </ul>
          )}
        </li>
      );
    };

    return <ul className={styles.pathList}>{renderPathNode("/")}</ul>;
  };

  const isChildPath = (childPath: string, parentPath: string) => {
    if (parentPath === "/") return true;
    return childPath.startsWith(parentPath + "/") || childPath === parentPath;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Directory</h2>
      <div className={styles.addPathContainer}>
        <input
          type="text"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="New Path"
          className={styles.addPathInput}
        />
        <button onClick={handleAddPath} className={styles.addPathButton}>
          Add Path
        </button>
      </div>
      {renderPathTree(availablePaths)}
      <h2 className={styles.sidebarTitle}>
        {selectedSidebarPath === "/"
          ? "All Files"
          : `Files in ${selectedSidebarPath}`}
      </h2>
      <ul className={styles.fileList}>
        {savedFiles
          .filter(({ file }) => isChildPath(file.path, selectedSidebarPath))
          .map(({ file, latestVersion }) => (
            <li key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span
                  onClick={() => file.id && onLoadFile(file.id)}
                  className={styles.fileName}
                >
                  {file.name}
                </span>
                <span className={styles.filePath}>{file.path}</span>
                <span className={styles.fileTimestamp}>
                  {formatDate(latestVersion.timestamp)}
                </span>
              </div>
              <p className={styles.fileDescription}>
                {latestVersion.description}
              </p>
              <div className={styles.fileActions}>
                <button
                  onClick={() => file.id && onLoadFile(file.id)}
                  className={styles.actionButton}
                >
                  Load
                </button>
                <button
                  onClick={() => file.id && onDeleteFile(file.id)}
                  className={styles.actionButton}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
