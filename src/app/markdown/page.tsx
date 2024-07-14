"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MarkdownIt from "markdown-it";
import jsYaml from "js-yaml";
import {
  saveDocument,
  loadLatestDocument,
  getAllDocuments,
  deleteDocument,
  Document,
} from "@/model/documentDB";
import styles from "@/styles/Home.module.css";

const MarkdownEditor = dynamic(() => import("@/components/MarkdownEditor"), {
  ssr: false,
});

const YamlEditor = dynamic(() => import("@/components/YamlEditor"), {
  ssr: false,
});

// markdown-it 인스턴스 생성 및 설정
const md = new MarkdownIt({
  breaks: true,
  html: true,
});

export default function Home() {
  const [yamlContent, setYamlContent] = useState(
    "title: My Document\ndate: 2023-07-15"
  );
  const [markdownContent, setMarkdownContent] = useState(
    "# Hello, Markdown!\n\nThis is a **bold** text.\nThis is a new line."
  );
  const [html, setHtml] = useState("");
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadLatestDocument().then((doc) => {
      if (doc) {
        setYamlContent(doc.yaml);
        setMarkdownContent(doc.markdown);
      }
    });

    getAllDocuments().then(setSavedDocuments);
  }, []);

  useEffect(() => {
    const renderedHtml = md
      .render(markdownContent)
      .replace(/\n/g, "<br>")
      .replace(/\\/g, "&#92;");
    setHtml(renderedHtml);
  }, [markdownContent]);

  const handleYamlChange = (value: string) => {
    try {
      jsYaml.load(value);
      setYamlContent(value);
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

  const handleSave = async () => {
    await saveDocument(yamlContent, markdownContent);
    const documents = await getAllDocuments();
    setSavedDocuments(documents);
  };

  const handleLoad = (doc: Document) => {
    setYamlContent(doc.yaml);
    setMarkdownContent(doc.markdown);
  };

  const handleDelete = async (id: number) => {
    await deleteDocument(id);
    const documents = await getAllDocuments();
    setSavedDocuments(documents);
  };

  return (
    <div className={styles.container}>
      <div className={styles.editorSection}>
        <h1>YAML and Markdown Editor</h1>
        <button onClick={handleSave}>Save Current Document</button>
        <h2>YAML Frontmatter:</h2>
        <YamlEditor initialValue={yamlContent} onChange={handleYamlChange} />
        {yamlError && (
          <div className={styles.error}>YAML Error: {yamlError}</div>
        )}
        <h2>Markdown Content:</h2>
        <MarkdownEditor
          initialValue={markdownContent}
          onChange={(value) => setMarkdownContent(value)}
        />
        <h2>Preview:</h2>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className={styles.sidebar}>
        <h2>Saved Documents</h2>
        <ul className={styles.documentList}>
          {savedDocuments.map((doc) => (
            <li key={doc.id}>
              <span>{new Date(doc.timestamp).toLocaleString()}</span>
              <div>
                <button onClick={() => handleLoad(doc)}>Load</button>
                <button onClick={() => doc.id && handleDelete(doc.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
