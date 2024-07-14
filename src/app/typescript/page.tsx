"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  saveDocument,
  updateDocument,
  updateDocumentName,
  loadDocument,
  loadLatestDocument,
  getAllDocuments,
  deleteDocument,
  TypeScriptDocument,
  checkDatabaseConnection,
} from "@/model/typescriptDB";
import styles from "@/styles/EditorStyles.module.css";

const TypeScriptEditor = dynamic(
  () => import("@/components/TypeScriptEditor"),
  {
    ssr: false,
  }
);

export default function TypeScriptEditorPage() {
  const [currentDocId, setCurrentDocId] = useState<number | undefined>();
  const [documentName, setDocumentName] = useState(
    "Untitled TypeScript Document"
  );
  const [content, setContent] = useState(
    "// Start typing your TypeScript code here"
  );
  const [savedDocuments, setSavedDocuments] = useState<TypeScriptDocument[]>(
    []
  );
  const [dbError, setDbError] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);

  const loadAllDocuments = useCallback(async () => {
    try {
      const documents = await getAllDocuments();
      setSavedDocuments(documents);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDbError("Failed to load documents. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    const initDb = async () => {
      const isConnected = await checkDatabaseConnection();
      if (isConnected) {
        loadLatestDocument()
          .then((doc) => {
            if (doc) {
              setCurrentDocId(doc.id);
              setDocumentName(doc.name);
              setContent(doc.content);
            }
          })
          .catch((error) => {
            console.error("Error loading latest document:", error);
            setDbError("Failed to load the latest document.");
          });

        loadAllDocuments();
      } else {
        setDbError(
          "Failed to connect to the database. Please refresh the page."
        );
      }
    };

    initDb();
  }, [loadAllDocuments]);

  const handleSave = useCallback(async () => {
    try {
      const newId = await saveDocument(documentName, content);
      setCurrentDocId(newId);
      await loadAllDocuments();
      console.log("Document saved!");
    } catch (error) {
      console.error("Error saving document:", error);
      setDbError("Failed to save the document. Please try again.");
    }
  }, [documentName, content, loadAllDocuments]);

  const handleLoad = async (id: number) => {
    try {
      const doc = await loadDocument(id);
      if (doc) {
        setCurrentDocId(doc.id);
        setDocumentName(doc.name);
        setContent(doc.content);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      setDbError("Failed to load the document. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      await loadAllDocuments();
      if (id === currentDocId) {
        setCurrentDocId(undefined);
        setDocumentName("Untitled TypeScript Document");
        setContent("// Start typing your TypeScript code here");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setDbError("Failed to delete the document. Please try again.");
    }
  };

  const handleNameEdit = (id: number) => {
    setEditingDocId(id);
  };

  const handleNameSave = async (id: number, newName: string) => {
    try {
      await updateDocumentName(id, newName);
      setEditingDocId(null);
      await loadAllDocuments();
    } catch (error) {
      console.error("Error updating document name:", error);
      setDbError("Failed to update the document name. Please try again.");
    }
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
    <>
      <div className={styles.editorSection}>
        <h1 className={styles.editorTitle}>TypeScript Editor</h1>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Document Name"
          className={styles.documentNameInput}
        />
        <button onClick={handleSave} className={styles.saveButton}>
          Save Document
        </button>
        <p className={styles.shortcutInfo}>
          Use Ctrl+S (Windows/Linux) or Cmd+S (Mac) to save
        </p>
        <div className={styles.typescriptEditor}>
          <TypeScriptEditor value={content} onChange={setContent} />
        </div>
      </div>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Saved Documents</h2>
        <ul className={styles.documentList}>
          {savedDocuments.map((doc) => (
            <li key={doc.id} className={styles.documentItem}>
              {editingDocId === doc.id ? (
                <input
                  type="text"
                  defaultValue={doc.name}
                  onBlur={(e) =>
                    doc.id && handleNameSave(doc.id, e.target.value)
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      doc.id && handleNameSave(doc.id, e.currentTarget.value);
                    }
                  }}
                  autoFocus
                  className={styles.editNameInput}
                />
              ) : (
                <span
                  onClick={() => handleNameEdit(doc.id!)}
                  className={styles.documentName}
                >
                  {doc.name}
                </span>
              )}
              <span className={styles.documentTimestamp}>
                {" "}
                - {new Date(doc.timestamp).toLocaleString()}
              </span>
              <div className={styles.documentActions}>
                <button
                  onClick={() => doc.id && handleLoad(doc.id)}
                  className={styles.actionButton}
                >
                  Load
                </button>
                <button
                  onClick={() => doc.id && handleDelete(doc.id)}
                  className={styles.actionButton}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
