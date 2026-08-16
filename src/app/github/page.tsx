"use client";

import { useState, useEffect } from "react";
import { getRepositories, getRepoContents, getFileContent, commitFile } from "@/actions/github";
import Workspace, { FileData } from "@/components/Workspace";
import { Folder, FileCode, GitBranch, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function GitHubPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Navigation State
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [contents, setContents] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]); // To go "back" in folders

  // Workspace State
  const [openFiles, setOpenFiles] = useState<FileData[]>([]);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoading(true);
    const res = await getRepositories();
    if (res.error) setError(res.error);
    else setRepos(res.data);
    setLoading(false);
  };

  const openRepo = async (repo: any) => {
    setSelectedRepo(repo);
    setCurrentPath("");
    setHistory([]);
    loadContents(repo.owner.login, repo.name, "");
  };

  const loadContents = async (owner: string, repo: string, path: string) => {
    setLoading(true);
    const res = await getRepoContents(owner, repo, path);
    if (res.error) setError(res.error);
    else setContents(res.data);
    setCurrentPath(path);
    setLoading(false);
  };

  const handleItemClick = async (item: any) => {
    if (item.type === "dir") {
      setHistory([...history, currentPath]);
      loadContents(selectedRepo.owner.login, selectedRepo.name, item.path);
    } else if (item.type === "file") {
      setLoading(true);
      const res = await getFileContent(selectedRepo.owner.login, selectedRepo.name, item.path);
      setLoading(false);
      
      if (res.error) {
        setError(res.error);
        return;
      }

      // Determine language for Monaco editor
      let language = "plaintext";
      if (item.name.endsWith(".java")) language = "java";
      else if (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) language = "typescript";
      else if (item.name.endsWith(".js") || item.name.endsWith(".jsx")) language = "javascript";
      else if (item.name.endsWith(".md")) language = "markdown";
      else if (item.name.endsWith(".json")) language = "json";
      else if (item.name.endsWith(".html")) language = "html";
      else if (item.name.endsWith(".css")) language = "css";

      const newFile: FileData = {
        id: item.sha, // Use GitHub SHA as unique ID
        name: item.name,
        content: res.data.decodedContent,
        language,
        sha: item.sha,
        repo: selectedRepo.name,
        path: item.path
      };

      setOpenFiles([newFile]); // This sends the file to the Workspace!
    }
  };

  const handleBack = () => {
    const previousPath = history[history.length - 1] || "";
    setHistory(history.slice(0, -1));
    loadContents(selectedRepo.owner.login, selectedRepo.name, previousPath);
  };

  // Phase 2: Commit handler
  const handleCommit = async (file: FileData) => {
    if (!file.sha || !file.path || !selectedRepo) return;
    
    const message = prompt(`Enter commit message for ${file.name}:`, `Update ${file.name}`);
    if (!message) return;

    setLoading(true);
    const res = await commitFile(
      selectedRepo.owner.login, 
      selectedRepo.name, 
      file.path, 
      file.content, 
      message, 
      file.sha
    );
    
    if (res.error) alert(`Commit failed: ${res.error}`);
    else alert("Successfully pushed to GitHub!");
    
    setLoading(false);
  };

  return (
    <div className="flex h-[85vh] gap-6 max-w-[1600px] mx-auto">
      
      {/* LEFT PANEL: File Explorer */}
      <div className="w-80 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl shrink-0">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <h2 className="font-bold text-zinc-100 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#87FFC5]" />
            {selectedRepo ? selectedRepo.name : "Repositories"}
          </h2>
          {selectedRepo && (
            <button onClick={() => setSelectedRepo(null)} className="text-zinc-400 hover:text-white text-xs bg-zinc-800 px-2 py-1 rounded">
              Switch
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading && !error && (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 text-[#87FFC5] animate-spin" />
            </div>
          )}

          {!loading && !selectedRepo && repos.map((repo) => (
            <div 
              key={repo.id} 
              onClick={() => openRepo(repo)}
              className="p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-zinc-700 mb-1"
            >
              <div className="font-medium text-zinc-200">{repo.name}</div>
              <div className="text-xs text-zinc-500 truncate mt-1">{repo.description || "No description"}</div>
            </div>
          ))}

          {!loading && selectedRepo && (
            <div className="space-y-1">
              {currentPath && (
                <div onClick={handleBack} className="flex items-center gap-2 p-2 hover:bg-zinc-800/50 rounded cursor-pointer text-zinc-400">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </div>
              )}
              
              {contents.map((item) => (
                <div 
                  key={item.sha} 
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors group"
                >
                  {item.type === "dir" ? (
                    <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                  ) : (
                    <FileCode className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                  )}
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100 truncate">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: The Shared Workspace Engine */}
      <div className="flex-1 min-w-0">
        <Workspace initialFiles={openFiles} onCommit={handleCommit} />
      </div>

    </div>
  );
}
