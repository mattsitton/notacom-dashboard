"use client";
import { useState } from "react";
import { getFullEmailBody } from "@/actions/gmail";

export default function ExpandingEmailList({ emails, accessToken }: { emails: any[], accessToken: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [emailBodies, setEmailBodies] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleEmail = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);

    if (!emailBodies[id]) {
      setLoadingId(id);
      try {
        const bodyHtml = await getFullEmailBody(id, accessToken);
        setEmailBodies((prev) => ({ ...prev, [id]: bodyHtml }));
      } catch (error) {
        setEmailBodies((prev) => ({ ...prev, [id]: "Error loading email." }));
      }
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {emails.map((email: any) => (
        <div key={email.id} className="bg-[#18181b] border border-[#202124] rounded-lg overflow-hidden shadow-md">
          <div onClick={() => toggleEmail(email.id)} className="p-4 cursor-pointer hover:bg-[#202124] flex justify-between items-center text-zinc-200 transition-colors">
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-[#87FFC5] truncate">{email.from}</span>
              <span className="text-sm truncate">{email.subject}</span>
            </div>
            <span className="text-zinc-500 text-xs ml-4 whitespace-nowrap">
              {expandedId === email.id ? "▲ Collapse" : "▼ Expand"}
            </span>
          </div>

          {expandedId === email.id && (
            <div className="p-4 border-t border-zinc-800 bg-[#e5e5e5] text-black overflow-x-auto">
              {loadingId === email.id ? (
                <div className="animate-pulse text-zinc-600 font-mono text-sm">Decrypting payload...</div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: emailBodies[email.id] || "No content found." }} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
