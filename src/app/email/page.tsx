"use client";

import { useState, useEffect } from "react";
import { getEmails } from "@/actions/email";

export default function EmailHub() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMail = async () => {
      const res = await getEmails();
      if (res.data) setEmails(res.data);
      setLoading(false);
    };
    fetchMail();
  }, []);

  if (loading) return <div className="p-8 text-[#87FFC5]">Fetching secure messages...</div>;

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Secure Email Hub</h1>
      <div className="flex flex-col gap-4">
        {emails.length === 0 && !loading && (
          <p className="text-zinc-400">No emails found or missing environment variables.</p>
        )}
        {emails.map((email) => (
          <div key={email.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <h2 className="font-bold text-[#87FFC5]">{email.subject}</h2>
            <p className="text-sm text-zinc-400 mb-2">From: {email.from}</p>
            <p className="text-zinc-300 line-clamp-3 text-sm">{email.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
