"use server";

export async function getFullEmailBody(messageId: string, accessToken: string) {
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const data = await response.json();
    let encodedBody = "";
    
    if (data.payload.parts) {
      const htmlPart = data.payload.parts.find((part: any) => part.mimeType === "text/html");
      const textPart = data.payload.parts.find((part: any) => part.mimeType === "text/plain");
      
      if (htmlPart && htmlPart.body.data) {
        encodedBody = htmlPart.body.data;
      } else if (textPart && textPart.body.data) {
        encodedBody = textPart.body.data;
      }
    } else if (data.payload?.body?.data) {
      encodedBody = data.payload.body.data;
    }

    if (!encodedBody) return "No readable content found.";

    const base64 = encodedBody.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    return "Failed to load email content.";
  }
}
