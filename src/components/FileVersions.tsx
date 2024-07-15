import React from "react";
import { TypeScriptVersion } from "@/model/typescriptDB";
import styles from "@/styles/EditorStyles.module.css";

interface FileVersionsProps {
  versions: TypeScriptVersion[];
  onLoadVersion: (version: TypeScriptVersion) => void;
}

const FileVersions: React.FC<FileVersionsProps> = ({
  versions,
  onLoadVersion,
}) => {
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
    <div className={styles.fileVersions}>
      <h2 className={styles.sidebarTitle}>File Versions</h2>
      <ul className={styles.versionList}>
        {versions.map((version) => (
          <li key={version.id} className={styles.versionItem}>
            <div className={styles.versionInfo}>
              <span
                onClick={() => onLoadVersion(version)}
                className={styles.versionName}
              >
                {version.commitName}
              </span>
              <span className={styles.versionTimestamp}>
                {formatDate(version.timestamp)}
              </span>
            </div>
            <p className={styles.versionDescription}>{version.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileVersions;
