"use server";

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

// We pass a timestamp here to bust Vercel's aggressive cache!
export async function getEmails(timestamp?: number) {
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

  const emails = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      const totalMessages = client.mailbox.exists;
      
      if (totalMessages > 0) {
        const start = Math.max(1, totalMessages - 19);
        const range = `${start}:*`;

        for await (const message of client.fetch(range, { source: true }, { uid: false, reverse: true })) {
          const parsed = await simpleParser(message.source);
          emails.push({
            id: message.uid.toString(),
            subject: parsed.subject || "No Subject",
            from: parsed.from?.text || "Unknown Sender",
            date: parsed.date ? parsed.date.toLocaleDateString() : "Unknown Date",
            text: parsed.text, 
            html: parsed.html || parsed.textAsHtml || `<div style="font-family: sans-serif; padding: 20px;">${parsed.text}</div>`,
          });
        }
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
