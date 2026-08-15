"use client";

import { useState, useEffect } from "react";
import { Clock as ClockIcon } from "lucide-react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-24 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse"></div>;

  const standard = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  const military = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg flex items-center gap-6">
      <div className="p-4 bg-indigo-500/10 rounded-full">
        <ClockIcon className="w-8 h-8 text-indigo-400" />
      </div>
      <div>
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Local Time</p>
        <div className="flex items-baseline gap-4">
          <h2 className="text-3xl font-bold text-zinc-100">{standard}</h2>
          <span className="text-zinc-500 font-mono text-xl">{military} (24H)</span>
        </div>
      </div>
    </div>
  );
}
