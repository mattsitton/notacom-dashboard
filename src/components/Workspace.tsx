"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { FileCode, FileText, Plus, X, Download, LayoutTemplate, UploadCloud } from "lucide-react";

export type FileData = {
  id: string;
  name: string;
  content: string;
  language: string;
  sha?: string; // Needed for GitHub commits
  repo?: string; // Needed to know where to push
  path?: string; // The file path in the repo
};

interface WorkspaceProps {
  initialFiles: FileData[];
  onCommit?: (file: FileData) => void; // A function we can pass from the GitHub page to handle saving
}

export default function Workspace({ initialFiles, onCommit }: WorkspaceProps) {
  const [files, setFiles] = useState<FileData[]>(initialFiles);
  const [activeId, setActiveId] = useState<string>(initialFiles[0]?.id || "");

  // If new files are passed in from a parent (like opening a GitHub file), update our tabs!
  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        initialFiles.forEach(newFile => {
          if (!newFiles.find(f => f.id === newFile.id)) {
            newFiles.push(newFile);
          }
        });
        return newFiles;
      });
      // Automatically switch focus to the newest file added
      setActiveId(initialFiles[initialFiles.length - 1].id);
    }
  }, [initialFiles]);

  const activeFile = files.find(f => f.id === activeId);

  const handleCreateFile = () => {
    const fileName = prompt("Enter file name (e.g., notes.txt, script.java, readme.md):");
    if (!fileName) return;

    let language = "plaintext";
    if (fileName.endsWith(".java")) language = "java";
    else if (fileName.endsWith(".md")) language = "markdown";
    else if (fileName.endsWith(".txt")) language = "plaintext";
    else if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) language = "typescript";
    else if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) language = "javascript";
    else if (fileName.endsWith(".json")) language = "json";

    const newFile: FileData = {
      id: Date.now().toString(),
      name: fileName,
      content: "",
      language
    };

    setFiles([...files, newFile]);
    setActiveId(newFile.id);
  };

  const handleCloseFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeId === id && newFiles.length > 0) {
      setActiveId(newFiles[0].id);
    } else if (newFiles.length === 0) {
      setActiveId("");
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(files.map(f => f.id === activeId ? { ...f, content: value } : f));
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getIcon = (name: string) => {
    if (name.endsWith('.java')) return <FileCode className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.md')) return <LayoutTemplate className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 p-2">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {files.map(file => (
            <div
              key={file.id}
              onClick={() => setActiveId(file.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors whitespace-nowrap ${
                activeId === file.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
            >
              {getIcon(file.name)}
              {file.name}
              {file.sha && <span className="w-2 h-2 rounded-full bg-green-500 ml-1" title="GitHub File" />}
              <button onClick={(e) => handleCloseFile(e, file.id)} className="hover:bg-zinc-700 p-0.5 rounded-md ml-1 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button onClick={handleCreateFile} className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0" title="New Local File">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="pl-4 flex items-center gap-2 pr-2">
          <button onClick={handleDownload} disabled={!activeFile} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
          
          {/* Show a Commit Button if the active file came from GitHub */}
          {activeFile?.sha && onCommit && (
            <button 
              onClick={() => onCommit(activeFile)} 
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Commit
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-zinc-950 relative">
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            theme="vs-dark"
            value={activeFile.content}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false }, fontSize: 15, wordWrap: "on", padding: { top: 16 }, smoothScrolling: true }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
            <FileCode className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Create or open a file to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
