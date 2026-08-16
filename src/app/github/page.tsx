"use client";

import { useState, useEffect } from "react";
import { getProfile, getRepositories, getRepoContents, getFileContent, commitFile } from "@/actions/github";
import Workspace, { FileData } from "@/components/Workspace";
import { GitBranch, Search, BookOpen, Star, GitFork, ExternalLink, Users, Lock, Home, Folder, FileCode, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function GitHubPage() {
  const [profile, setProfile] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isViewingSelf, setIsViewingSelf] = useState(true);
  
  // Navigation State
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [contents, setContents] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Workspace State
  const [openFiles, setOpenFiles] = useState<FileData[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (searchUser?: string) => {
    setLoading(true);
    setError("");
    
    const profileRes = await getProfile(searchUser);
    const reposRes = await getRepositories(searchUser);
    
    if (profileRes.error) {
      setError(profileRes.error);
    } else {
      setProfile(profileRes.data || null);
      setRepos(reposRes.data || []);
      setIsViewingSelf(!searchUser);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery) {
      if (searchQuery.includes('/')) {
        const [owner, name] = searchQuery.split('/');
        openRepo({ owner: { login: owner }, name });
      } else {
        loadDashboard(searchQuery);
      }
    }
  };

  const openRepo = async (repo: any) => {
    setError("");
    setSelectedRepo(repo);
    setCurrentPath("");
    setHistory([]);
    loadContents(repo.owner.login, repo.name, "");
  };

  const loadContents = async (owner: string, repo: string, path: string) => {
    setLoading(true);
    const res = await getRepoContents(owner, repo, path);
    if (res.error) setError(res.error);
    else {
      // FIX: Added '|| []' to satisfy TypeScript's strict rules!
      setContents(res.data || []);
      setCurrentPath(path);
    }
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
      
      if (res.error) return setError(res.error);

      let language = "plaintext";
      if (item.name.endsWith(".java")) language = "java";
      else if (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) language = "typescript";
      else if (item.name.endsWith(".js") || item.name.endsWith(".jsx")) language = "javascript";
      else if (item.name.endsWith(".md")) language = "markdown";
      else if (item.name.endsWith(".json")) language = "json";
      else if (item.name.endsWith(".html")) language = "html";
      else if (item.name.endsWith(".css")) language = "css";

      const newFile: FileData = {
        id: item.sha,
        name: item.name,
        // FIX: Added fallback to satisfy TypeScript
        content: res.data?.decodedContent || "",
        language,
        sha: item.sha,
        repo: selectedRepo.name,
        path: item.path
      };
      setOpenFiles([newFile]);
    }
  };

  const handleBack = () => {
    const previousPath = history[history.length - 1] || "";
    setHistory(history.slice(0, -1));
    loadContents(selectedRepo.owner.login, selectedRepo.name, previousPath);
  };

  const handleCommit = async (file: FileData) => {
    if (!file.sha || !file.path || !selectedRepo) return;
    const message = prompt(`Enter commit message for ${file.name}:`, `Update ${file.name}`);
    if (!message) return;

    setLoading(true);
    const res = await commitFile(selectedRepo.owner.login, selectedRepo.name, file.path, file.content, message, file.sha);
    if (res.error) alert(`Commit failed: ${res.error}`);
    else alert("Successfully pushed to GitHub!");
    setLoading(false);
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-[85vh] gap-6 max-w-[1600px] mx-auto">
      
      {/* LEFT PANEL: Sidebar */}
      <div className="w-80 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl shrink-0">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-zinc-100 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#87FFC5]" />
              {selectedRepo ? selectedRepo.name : (isViewingSelf ? "My Github" : `${profile?.login || 'User'}'s Github`)}
            </h2>
            {selectedRepo ? (
              <button onClick={() => { setSelectedRepo(null); setError(""); }} className="text-zinc-400 hover:text-white text-xs bg-zinc-800 px-2 py-1 rounded">
                Back to Profile
              </button>
            ) : (!isViewingSelf && (
              <button onClick={() => { setSearchQuery(""); loadDashboard(); }} className="p-1 text-zinc-400 hover:text-white bg-zinc-800 rounded">
                <Home className="w-4 h-4" />
              </button>
            ))}
          </div>

          {!selectedRepo && (
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Filter or press Enter to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#87FFC5] transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded mb-4 flex items-start gap-2 m-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="break-all">{error}</p>
            </div>
          )}
          {loading && !error && <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-[#87FFC5] animate-spin" /></div>}

          {!loading && !selectedRepo && filteredRepos.map((repo) => (
            <div key={repo.id} onClick={() => openRepo(repo)} className="p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-zinc-700 mb-1">
              <div className="font-medium text-zinc-200 flex items-center gap-2">
                {repo.private ? <Lock className="w-3 h-3 text-zinc-500" /> : <BookOpen className="w-3 h-3 text-[#87FFC5]" />}
                {repo.name}
              </div>
            </div>
          ))}

          {!loading && selectedRepo && !error && (
            <div className="space-y-1">
              {currentPath && (
                <div onClick={handleBack} className="flex items-center gap-2 p-2 hover:bg-zinc-800/50 rounded cursor-pointer text-zinc-400">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </div>
              )}
              {contents.map((item) => (
                <div key={item.sha} onClick={() => handleItemClick(item)} className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors group">
                  {item.type === "dir" ? <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> : <FileCode className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />}
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic View */}
      <div className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        {selectedRepo ? (
          <Workspace initialFiles={openFiles} onCommit={handleCommit} />
        ) : (
          <div className="h-full overflow-y-auto p-8">
            {profile && (
              <div className="flex items-center gap-6 mb-10 pb-10 border-b border-zinc-800">
                <img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-full border-4 border-zinc-800 shadow-lg" />
                <div>
                  <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
                    {profile.name || profile.login}
                    <a href={profile.html_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#87FFC5] transition-colors"><ExternalLink className="w-5 h-5" /></a>
                  </h1>
                  <p className="text-zinc-400 mt-1 max-w-xl">{profile.bio || "No bio available."}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm font-medium text-zinc-300">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-400" /> {profile.followers} Followers</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-emerald-400" /> {profile.public_repos} Repos</span>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#87FFC5]" />
              {isViewingSelf ? "Your Recent Repositories" : "Public Repositories"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map(repo => (
                <div key={repo.id} onClick={() => openRepo(repo)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all cursor-pointer group shadow-md hover:shadow-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-zinc-100 text-lg group-hover:text-[#87FFC5] transition-colors flex items-center gap-2 truncate">
                      {repo.private ? <Lock className="w-4 h-4 text-zinc-500" /> : <BookOpen className="w-4 h-4 text-indigo-400" />}
                      <span className="truncate">{repo.name}</span>
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-400 mb-6 line-clamp-2 min-h-[40px]">{repo.description || "No description provided."}</p>
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                    {repo.language && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> {repo.language}</span>}
                    <span className="flex items-center gap-1.5 hover:text-zinc-300"><Star className="w-3.5 h-3.5" /> {repo.stargazers_count}</span>
                    <span className="flex items-center gap-1.5 hover:text-zinc-300"><GitFork className="w-3.5 h-3.5" /> {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>

            {!loading && filteredRepos.length === 0 && (
               <div className="text-zinc-500 text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                 <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                 <p>No matches found in this profile.</p>
                 <p className="text-sm mt-1">Press <strong>Enter</strong> to search all of GitHub for <b>"{searchQuery}"</b>.</p>
               </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
