"use server";

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export async function getEmails() {
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
      for await (const message of client.fetch('1:10', { source: true }, { uid: true, reverse: true })) {
        const parsed = await simpleParser(message.source);
        emails.push({
          id: message.uid,
          subject: parsed.subject || "No Subject",
          from: parsed.from?.text || "Unknown Sender",
          date: parsed.date?.toISOString(),
          text: parsed.text, 
          html: parsed.html,
        });
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
