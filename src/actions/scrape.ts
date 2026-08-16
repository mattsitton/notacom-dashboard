"use server";
import * as cheerio from "cheerio";

export async function scrapeUrl(url: string) {
  try {
    if (!url) return { error: "Please provide a URL." };
    if (!url.startsWith("http")) url = "https://" + url;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    
    if (!res.ok) throw new Error("Failed to load page");
    const html = await res.text();
    
    const $ = cheerio.load(html);
    
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || 'No Title Found';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || 'No description available.';
    const image = $('meta[property="og:image"]').attr('content') || '';
    
    return { title, description, image, url };
  } catch (error) {
    return { error: "Could not scrape that URL. It might be blocking bots." };
  }
}
