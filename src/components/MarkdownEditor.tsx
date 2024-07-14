import { useCallback } from "react";
import dynamic from "next/dynamic";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const handleChange = useCallback(
    (val: string) => {
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
