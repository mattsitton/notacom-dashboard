"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CloudSun, Mail, Code2, GitBranch, LogOut, LayoutDashboard } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: CloudSun },
  { name: "Email Hub", href: "/email", icon: Mail },
  { name: "Code Editor", href: "/editor", icon: Code2 },
  { name: "GitHub", href: "/github", icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide sidebar on the login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-zinc-100 text-lg tracking-wide">NOTACOM</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
