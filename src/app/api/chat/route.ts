import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "YOUR_KEY_HERE") {
    return NextResponse.json(
      { error: "AI is sleeping! Add your GEMINI_API_KEY to the .env.local file and restart your server to wake it up." }, 
      { status: 401 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { message, history } = await req.json();
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
