import ScraperUI from "@/components/ScraperUI";

export default function ScraperPage() {
  return (
    <main className="min-h-screen bg-[#0e0e10] p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Web Scraper</h1>
      <div className="w-full max-w-xl">
        <ScraperUI />
      </div>
    </main>
  );
}
