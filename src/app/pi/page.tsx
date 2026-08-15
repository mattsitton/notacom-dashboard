"use client";

import { useState, useEffect } from "react";
import { MonitorSmartphone, Plug, Unplug, Maximize, ExternalLink, MonitorPlay } from "lucide-react";

export default function RemoteDesktopPage() {
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem("guac-tunnel-url");
    if (savedUrl) setTunnelUrl(savedUrl);
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tunnelUrl.trim()) return;
    
    let formattedUrl = tunnelUrl.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    setTunnelUrl(formattedUrl);
    localStorage.setItem("guac-tunnel-url", formattedUrl);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`mx-auto space-y-6 ${isFullscreen ? "max-w-full fixed inset-0 z-50 bg-zinc-950 p-4" : "max-w-7xl"}`}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
          <MonitorSmartphone className="w-7 h-7 text-indigo-400" />
          Remote Access
        </h1>
        
        <form onSubmit={handleConnect} className="flex items-center gap-2">
          <input
            type="text"
            value={tunnelUrl}
            onChange={(e) => setTunnelUrl(e.target.value)}
            disabled={isConnected}
            placeholder="e.g., remote.yourdomain.com/guacamole"
            className="w-72 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
          />
          
          {!isConnected ? (
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Plug className="w-4 h-4" />
              Connect
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleDisconnect} className="flex items-center gap-2 px-4 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 text-sm font-medium rounded-lg transition-colors">
                <Unplug className="w-4 h-4" />
                Disconnect
              </button>
              <button type="button" onClick={toggleFullscreen} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors" title="Toggle Fullscreen">
                <Maximize className="w-4 h-4" />
              </button>
              <a href={tunnelUrl} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors" title="Open in New Tab">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </form>
      </div>

      <div className={`relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-all ${isFullscreen ? "h-[calc(100vh-100px)]" : "h-[70vh]"}`}>
        
        {!isConnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <MonitorPlay className="w-20 h-20 mb-6 opacity-20" />
            <p className="text-lg font-medium text-zinc-300">Awaiting Connection</p>
            <p className="max-w-md text-center mt-2 text-sm">
              Enter your Cloudflare Tunnel URL to securely stream your Apache Guacamole interface directly into this dashboard.
            </p>
          </div>
        ) : (
          <iframe 
            src={tunnelUrl} 
            className="w-full h-full border-none"
            title="Guacamole Remote Desktop"
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        )}
      </div>
      
    </div>
  );
}
