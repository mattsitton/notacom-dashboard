"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, LogOut, Inbox, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function EmailHubPage() {
  const [token, setToken] = useState<string | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => { document.body.removeChild(script); };
  }, []);

  const handleAuth = () => {
    if (!window.google) return;
    
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: 'select_account', // Forces Google to show the account chooser every time
      callback: (response: any) => {
        if (response.error) {
          setError(`Auth Error: ${response.error}`);
          return;
        }
        setToken(response.access_token);
        fetchEmails(response.access_token);
      },
    });
    client.requestAccessToken();
  };

  const fetchEmails = async (accessToken: string) => {
    setLoading(true);
    setError("");
    try {
      const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!listRes.ok) {
        const errorData = await listRes.json();
        throw new Error(errorData.error?.message || `HTTP Error ${listRes.status}`);
      }
      
      const listData = await listRes.json();
      
      if (!listData.messages) {
        setEmails([]);
        setLoading(false);
        return;
      }

      const detailedEmails = await Promise.all(
        listData.messages.map(async (msg: { id: string }) => {
          const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const msgData = await msgRes.json();
          
          const headers = msgData.payload.headers;
          const subject = headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
          const fromRaw = headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
          const date = headers.find((h: any) => h.name === "Date")?.value;
          
          const from = fromRaw.split("<")[0].replace(/"/g, "").trim();

          return {
            id: msgData.id,
            subject,
            from,
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            snippet: msgData.snippet
          };
        })
      );
      
      setEmails(detailedEmails);
    } catch (err: any) {
      setError(`Google API Rejected: ${err.message}`);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setEmails([]);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
          <Mail className="w-8 h-8" />
          Email Hub
        </h1>
        
        {token && (
          <div className="flex gap-3">
            <button 
              onClick={() => fetchEmails(token)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-mono">{error}</p>
        </div>
      )}

      {!token ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center shadow-lg flex flex-col items-center justify-center h-[50vh]">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-[#87FFC5]" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Secure Inbox Access</h2>
          <p className="text-zinc-400 mb-8 max-w-md">
            Connect your matthewat77t@gmail.com account to securely view your latest emails directly in your dashboard.
          </p>
          <button
            onClick={handleAuth}
            disabled={!scriptLoaded}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <Inbox className="w-4 h-4" />
            Recent Messages
          </div>
          <div className="divide-y divide-zinc-800/50">
            {emails.map((email) => (
              <div key={email.id} className="p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-zinc-100 group-hover:text-[#87FFC5] transition-colors">{email.from}</span>
                  <span className="text-xs text-zinc-500 whitespace-nowrap ml-4">{email.date}</span>
                </div>
                <h3 className="text-sm font-medium text-zinc-300 mb-1">{email.subject}</h3>
                <p className="text-sm text-zinc-500 line-clamp-1" dangerouslySetInnerHTML={{ __html: email.snippet }}></p>
              </div>
            ))}
            {emails.length === 0 && (
              <div className="p-8 text-center text-zinc-500">No recent messages found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
