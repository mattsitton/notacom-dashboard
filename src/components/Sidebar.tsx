"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CloudSun, Mail, Code2, GitBranch, Server, Sparkles, LogOut, LayoutDashboard, ChevronLeft, Menu } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: CloudSun },
  { name: "AI Assistant", href: "/chat", icon: Sparkles },
  { name: "Email Hub", href: "/email", icon: Mail },
  { name: "Code Editor", href: "/editor", icon: Code2 },
  { name: "GitHub", href: "/github", icon: GitBranch },
  { name: "Remote Access", href: "/pi", icon: Server },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hide sidebar entirely on the login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside 
      className={`bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* Header Area */}
        <div className={`p-6 border-b border-zinc-800 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <LayoutDashboard className="w-6 h-6 text-indigo-400 shrink-0" />
              <span className="font-bold text-zinc-100 text-lg tracking-wide whitespace-nowrap">NOTACOM</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors flex items-center justify-center"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all overflow-hidden ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Log Out" : ""}
          className={`w-full flex items-center gap-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all overflow-hidden ${
            isCollapsed ? "justify-center px-0" : "px-4"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
