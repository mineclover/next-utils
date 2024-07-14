import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { highlightSpecialChars } from "@codemirror/view";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(
    (val: string) => {
      setValue(val);
      onChange(val);
    },
    [onChange]
  );

  const extensions = [
    basicSetup(),
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      addKeymap: true,
    }),
    oneDark,
    EditorView.lineWrapping,
    highlightSpecialChars({
      render: (code, description, placeholder) => {
        const el = document.createElement("span");
        el.textContent = placeholder;
        el.title = description || "";
        el.setAttribute("aria-label", description || "");
        el.className = "cm-specialChar";
        return el;
      },
      specialChars: /[\n\t\u00a0]/g,
    }),
  ];

  return (
    <CodeMirror
      value={value}
      height="400px"
      extensions={extensions}
      onChange={handleChange}
      theme={oneDark}
    />
  );
};

export default MarkdownEditor;
