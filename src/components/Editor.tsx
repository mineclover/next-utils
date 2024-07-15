import React from "react";
import dynamic from "next/dynamic";
import styles from "@/styles/EditorStyles.module.css";

const TypeScriptEditor = dynamic(
  () => import("@/components/TypeScriptEditor"),
  {
    ssr: false,
  }
);

interface EditorProps {
  currentPath: string;
  fileName: string;
  content: string;
  commitName: string;
  description: string;
  availablePaths: string[];
  onChangeFileName: (name: string) => void;
  onChangeContent: (content: string) => void;
  onChangeCommitName: (name: string) => void;
  onChangeDescription: (desc: string) => void;
  onChangePath: (path: string) => void;
  onSave: () => void;
}

const Editor: React.FC<EditorProps> = ({
  currentPath,
  fileName,
  content,
  commitName,
  description,
  availablePaths,
  onChangeFileName,
  onChangeContent,
  onChangeCommitName,
  onChangeDescription,
  onChangePath,
  onSave,
}) => {
  return (
    <div className={styles.editorSection}>
      <h1 className={styles.editorTitle}>TypeScript Editor</h1>
      <div className={styles.editorControls}>
        <select
          value={currentPath}
          onChange={(e) => onChangePath(e.target.value)}
          className={styles.pathSelect}
        >
          {availablePaths.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={fileName}
          onChange={(e) => onChangeFileName(e.target.value)}
          placeholder="File Name (optional)"
          className={styles.fileNameInput}
        />
        <input
          type="text"
          value={commitName}
          onChange={(e) => onChangeCommitName(e.target.value)}
          placeholder="Commit Name (optional)"
          className={styles.commitNameInput}
        />
        <input
          type="text"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Description (optional)"
          className={styles.descriptionInput}
        />
        <button onClick={onSave} className={styles.saveButton}>
          Save File
        </button>
      </div>
      <p className={styles.currentPath}>Current Path: {currentPath}</p>
      <p className={styles.shortcutInfo}>
        Use Ctrl+S (Windows/Linux) or Cmd+S (Mac) to save
      </p>
      <div className={styles.typescriptEditor}>
        <TypeScriptEditor value={content} onChange={onChangeContent} />
      </div>
    </div>
  );
};

export default Editor;
