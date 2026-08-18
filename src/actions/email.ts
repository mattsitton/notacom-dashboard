"use server";

import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { unstable_noStore as noStore } from 'next/cache';

// TypeScript Fix #3: Add "timestamp?: number" back so the Refresh button can pass Date.now() without TS getting mad
export async function getEmails(timestamp?: number) {
  noStore();
  
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER as string,
      pass: process.env.GMAIL_APP_PASSWORD as string
    },
    logger: false
  });

  const emails: any[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      const uids = await client.search({ all: true }, { uid: true });
      
      // TypeScript Fix #1 & #2: Explicitly check if uids is an Array before using .length or .slice
      if (Array.isArray(uids) && uids.length > 0) {
        const newestUids = uids.slice(-20);
        const range = newestUids.join(',');

        for await (const message of client.fetch(range, { source: true }, { uid: true })) {
          if (!message.source) continue;

          const parsed = await simpleParser(message.source) as ParsedMail;
          
          emails.push({
            id: message.uid.toString(),
            subject: parsed.subject || "No Subject",
            from: parsed.from?.text || "Unknown Sender",
            date: parsed.date ? parsed.date.toLocaleDateString() : "Unknown Date",
            text: parsed.text || "", 
            html: parsed.html || parsed.textAsHtml || `<div style="font-family: sans-serif; padding: 20px;">${parsed.text || ""}</div>`,
          });
        }
        
        emails.reverse();
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return { data: emails };

  } catch (error: any) {
    console.error("IMAP Error:", error);
    return { error: "Failed to fetch emails securely from the server." };
  }
}
