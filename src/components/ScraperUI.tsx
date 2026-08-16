"use client";
import { useState } from "react";
import { scrapeUrl } from "@/actions/scrape";

export default function ScraperUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    const data = await scrapeUrl(url);
    setResult(data);
    setLoading(false);
    setUrl("");
  };

  return (
    <div className="bg-[#18181b] border border-[#202124] rounded-lg p-6 w-full shadow-xl">
      <h2 className="text-[#87FFC5] text-xl font-bold mb-4">Read It Later Scraper</h2>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL here (e.g. github.com)"
          className="flex-1 bg-[#202124] text-zinc-300 border border-zinc-700 rounded p-2 outline-none focus:border-[#87FFC5]"
        />
        <button 
          onClick={handleScrape}
          disabled={loading || !url}
          className="bg-[#87FFC5] text-[#202124] px-4 py-2 rounded font-bold hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Scraping..." : "Save"}
        </button>
      </div>

      {result && !result.error && (
        <div className="bg-[#202124] rounded-lg p-4 border border-zinc-800 mt-4">
          {result.image && <img src={result.image} alt="Cover" className="w-full h-48 object-cover rounded mb-4" />}
          <h3 className="text-zinc-100 font-bold text-lg">{result.title}</h3>
          <p className="text-zinc-400 text-sm mt-2">{result.description}</p>
          <a href={result.url} target="_blank" rel="noreferrer" className="text-[#87FFC5] text-xs mt-4 inline-block hover:underline">
            Visit Original Link ↗
          </a>
        </div>
      )}

      {result?.error && (
        <div className="text-red-400 bg-red-400/10 p-3 rounded mt-4">
          {result.error}
        </div>
      )}
    </div>
  );
}
