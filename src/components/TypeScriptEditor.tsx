import React, { useCallback } from "react";
import dynamic from "next/dynamic";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface TypeScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TypeScriptEditor: React.FC<TypeScriptEditorProps> = ({
  value,
  onChange,
}) => {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const extensions = [
    basicSetup(),
    javascript({ typescript: true }),
    oneDark,
    EditorView.lineWrapping,
  ];

  return (
    <CodeMirror
      value={value}
      height="600px"
      extensions={extensions}
      onChange={handleChange}
      theme={oneDark}
    />
  );
};

export default TypeScriptEditor;
