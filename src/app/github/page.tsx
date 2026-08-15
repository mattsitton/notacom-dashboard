"use client";

import { useState, useEffect } from "react";
import { GitBranch, Search, BookOpen, Star, GitFork, ExternalLink, Users, Lock, Home } from "lucide-react";

export default function GithubPage() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isViewingSelf, setIsViewingSelf] = useState(true);

  const fetchGithubData = async (searchUsername?: string) => {
    setLoading(true);
    setError("");
    try {
      if (searchUsername) {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${searchUsername}`),
          fetch(`https://api.github.com/users/${searchUsername}/repos?sort=updated&per_page=6`)
        ]);
        if (!profileRes.ok) throw new Error("User not found on GitHub.");
        setProfile(await profileRes.json());
        setRepos(await reposRes.json());
        setIsViewingSelf(false);
      } else {
        const res = await fetch('/api/github');
        
        // SAFETY CHECK: Ensure the server sent JSON, not an HTML error page
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Server returned HTML instead of JSON (HTTP Status: ${res.status}). Ensure your server was restarted!`);
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch from backend");
        
        setProfile(data.profile);
        setRepos(data.repos);
        setIsViewingSelf(true);
        setUsername("");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGithubData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) fetchGithubData(username.trim());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
          <GitBranch className="w-8 h-8" />
          {isViewingSelf ? "My GitHub" : "GitHub Search"}
        </h1>
        
        <div className="flex items-center gap-2">
          {!isViewingSelf && (
            <button 
              onClick={() => fetchGithubData()} 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              My Profile
            </button>
          )}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Search username..."
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors w-64"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              Fetch
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-900/50 animate-pulse">
          <p className="text-zinc-500 font-medium">Fetching GitHub data...</p>
        </div>
      ) : profile && !error ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg h-fit">
            <div className="flex items-center gap-4 mb-6">
              <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full border border-zinc-700" />
              <div>
                <h2 className="text-xl font-bold text-zinc-100">{profile.name || profile.login}</h2>
                <a href={profile.html_url} target="_blank" rel="noreferrer" className="text-[#87FFC5] text-sm hover:underline">@{profile.login}</a>
              </div>
            </div>
            
            {profile.bio && <p className="text-zinc-400 text-sm mb-6 pb-6 border-b border-zinc-800">{profile.bio}</p>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase">Followers</p>
                  <p className="text-lg font-bold text-zinc-100">{profile.followers}</p>
                </div>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase">Repos</p>
                  <p className="text-lg font-bold text-zinc-100">{profile.public_repos + (profile.total_private_repos || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              Recently Updated
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repos.map((repo) => (
                <a 
                  key={repo.id} 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm hover:border-zinc-600 transition-colors group flex flex-col justify-between h-40"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-[#87FFC5] truncate pr-4 group-hover:underline flex items-center gap-2">
                        {repo.private && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {repo.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                    </div>
                    <p className="text-zinc-400 text-sm line-clamp-2">{repo.description || "No description provided."}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repo.forks_count}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          
        </div>
      ) : null}
    </div>
  );
}
