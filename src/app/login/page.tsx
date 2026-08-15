"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <form onSubmit={handleSubmit} className="p-8 bg-zinc-900 rounded-xl shadow-2xl flex flex-col gap-4 border border-zinc-800 w-80">
        <h1 className="text-zinc-100 text-xl font-semibold text-center mb-2">Restricted Access</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          className="px-4 py-2 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded focus:outline-none focus:border-zinc-500"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm text-center">Incorrect password.</p>}
        <button type="submit" className="px-4 py-2 bg-zinc-100 text-zinc-900 font-medium rounded hover:bg-zinc-300 transition-colors">
          Unlock
        </button>
      </form>
    </div>
  );
}
