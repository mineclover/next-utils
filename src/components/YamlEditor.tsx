import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { StreamLanguage } from "@codemirror/language";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange }) => {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const extensions = [
    basicSetup(),
    oneDark,
    EditorView.lineWrapping,
    StreamLanguage.define(yaml),
  ];

  return (
    <CodeMirror
      value={value}
      height="200px"
      extensions={extensions}
      onChange={handleChange}
      theme={oneDark}
    />
  );
};

export default YamlEditor;
