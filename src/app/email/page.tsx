"use client";

import { useState, useEffect } from "react";
import { getEmails } from "@/actions/email";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

export default function EmailHub() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    const fetchMail = async () => {
      const res = await getEmails();
      if (res.data) setEmails(res.data);
      setLoading(false);
    };
    fetchMail();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[85vh]">
      <Loader2 className="w-8 h-8 text-[#87FFC5] animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 text-white max-w-5xl mx-auto h-[85vh] flex flex-col">
      {selectedEmail ? (
        // DETAILED READING VIEW
        <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center gap-4">
            <button 
              onClick={() => setSelectedEmail(null)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-100" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-zinc-100 truncate">{selectedEmail.subject}</h1>
              <p className="text-sm text-zinc-400 truncate">From: {selectedEmail.from} • {selectedEmail.date}</p>
            </div>
          </div>
          {/* We use a white background for the iframe because most HTML emails assume a white canvas */}
          <div className="flex-1 bg-white">
            <iframe 
              srcDoc={selectedEmail.html} 
              className="w-full h-full border-none"
              sandbox="allow-popups allow-same-origin"
            />
          </div>
        </div>
      ) : (
        // INBOX LIST VIEW
        <div className="flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#87FFC5]" />
            Recent Emails
          </h1>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-10">
            {emails.length === 0 && (
              <p className="text-zinc-400 p-4 bg-zinc-900 rounded-lg border border-zinc-800">No emails found in this inbox.</p>
            )}
            {emails.map((email) => (
              <div 
                key={email.id} 
                onClick={() => setSelectedEmail(email)}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 cursor-pointer transition-all hover:bg-zinc-800/80 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1 gap-4">
                  <h2 className="font-bold text-[#87FFC5] truncate">{email.subject}</h2>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">{email.date}</span>
                </div>
                <p className="text-sm text-zinc-300 font-medium truncate">{email.from}</p>
                <p className="text-zinc-500 line-clamp-2 text-sm mt-2">{email.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
