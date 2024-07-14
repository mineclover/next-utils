import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { StreamLanguage } from "@codemirror/language";
import { yaml as yamlMode } from "@codemirror/legacy-modes/mode/yaml";
import jsYaml from "js-yaml";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface YamlEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

const YamlEditor: React.FC<YamlEditorProps> = ({ initialValue, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (val: string) => {
      setValue(val);
      try {
        jsYaml.load(val);
        setError(null);
        onChange(val);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    },
    [onChange]
  );

  const extensions = [
    basicSetup(),
    oneDark,
    EditorView.lineWrapping,
    StreamLanguage.define(yamlMode),
  ];

  return (
    <div>
      <CodeMirror
        value={value}
        height="200px"
        extensions={extensions}
        onChange={handleChange}
        theme={oneDark}
      />
      {error && (
        <div style={{ color: "red", marginTop: "5px" }}>Error: {error}</div>
      )}
    </div>
  );
};

export default YamlEditor;
