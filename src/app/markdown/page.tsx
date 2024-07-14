"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import MarkdownIt from "markdown-it";
import jsYaml from "js-yaml";
import {
  saveDocument,
  updateDocument,
  loadDocument,
  loadLatestDocument,
  getAllDocuments,
  deleteDocument,
  Document,
  checkDatabaseConnection,
  updateDocumentName,
} from "@/model/documentDB";
import styles from "@/styles/EditorStyles.module.css";

const MarkdownEditor = dynamic(() => import("@/components/MarkdownEditor"), {
  ssr: false,
});

const YamlEditor = dynamic(() => import("@/components/YamlEditor"), {
  ssr: false,
});

const md = new MarkdownIt({
  breaks: true,
  html: true,
});

export default function Home() {
  const [currentDocId, setCurrentDocId] = useState<number | undefined>();
  const [documentName, setDocumentName] = useState("Untitled Document");
  const [yamlContent, setYamlContent] = useState(
    "title: My Document\ndate: 2023-07-15"
  );
  const [markdownContent, setMarkdownContent] = useState(
    "# Hello, Markdown!\n\nThis is a **bold** text.\nThis is a new line."
  );
  const [html, setHtml] = useState("");
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<Document[]>([]);
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
              setYamlContent(doc.yaml);
              setMarkdownContent(doc.markdown);
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

  useEffect(() => {
    const renderedHtml = md
      .render(markdownContent)
      .replace(/\n/g, "<br>")
      .replace(/\\/g, "&#92;");
    setHtml(renderedHtml);
  }, [markdownContent]);

  const handleYamlChange = (value: string) => {
    setYamlContent(value);
    try {
      jsYaml.load(value);
      setYamlError(null);
    } catch (e) {
      console.error("Invalid YAML:", e);
      if (e instanceof Error) {
        setYamlError(e.message);
      } else {
        setYamlError("An unknown error occurred");
      }
    }
  };

  const handleSave = useCallback(async () => {
    try {
      const newId = await saveDocument(
        documentName,
        yamlContent,
        markdownContent
      );
      setCurrentDocId(newId);
      await loadAllDocuments();
      console.log("Document saved!");
    } catch (error) {
      console.error("Error saving document:", error);
      setDbError("Failed to save the document. Please try again.");
    }
  }, [documentName, yamlContent, markdownContent, loadAllDocuments]);

  const handleLoad = async (id: number) => {
    try {
      const doc = await loadDocument(id);
      if (doc) {
        setCurrentDocId(doc.id);
        setDocumentName(doc.name);
        setYamlContent(doc.yaml);
        setMarkdownContent(doc.markdown);
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
        setDocumentName("Untitled Document");
        setYamlContent("title: My Document\ndate: 2023-07-15");
        setMarkdownContent(
          "# Hello, Markdown!\n\nThis is a **bold** text.\nThis is a new line."
        );
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
        <h1 className={styles.editorTitle}>YAML and Markdown Editor</h1>
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
        <h2 className={styles.sectionTitle}>YAML Frontmatter:</h2>
        <div className={styles.yamlEditor}>
          <YamlEditor value={yamlContent} onChange={handleYamlChange} />
        </div>
        {yamlError && (
          <div className={styles.error}>YAML Error: {yamlError}</div>
        )}
        <h2 className={styles.sectionTitle}>Markdown Content:</h2>
        <div className={styles.markdownEditor}>
          <MarkdownEditor
            value={markdownContent}
            onChange={setMarkdownContent}
          />
        </div>
        <h2 className={styles.sectionTitle}>Preview:</h2>
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: html }}
        />
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
                  onKeyDown={(e) => {
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
