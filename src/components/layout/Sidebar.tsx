"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Podcast, Home, Search, Zap } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 fixed left-0 top-0 h-screen bg-surface border-r border-border-subtle p-10 hidden lg:flex flex-col shadow-sm z-40">
      <Link href="/" className="flex flex-col gap-4 mb-16">
        <div className="w-14 h-14 bg-cta rounded-2xl flex items-center justify-center shadow-sm">
          <Podcast className="text-text-primary" size={32} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none text-text-primary">
            PODCAST <span className="text-cta">聽了以後</span>
          </h1>
          <span className="text-[10px] font-bold text-cta/80 tracking-widest uppercase">
            After Listening
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-10">
        <div>
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-6">
            EXPLORE
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold ${
                  pathname === "/"
                    ? "bg-selected text-text-primary"
                    : "text-text-primary hover:text-cta hover:bg-hover"
                }`}
              >
                <Home size={20} /> 探索集數
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold ${
                  pathname.startsWith("/search")
                    ? "bg-selected text-text-primary"
                    : "text-text-primary hover:text-cta hover:bg-hover"
                }`}
              >
                <Search size={20} /> 進階搜尋
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-6">
            CHANNELS
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/#節目系列"
                className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold transition-all text-text-primary hover:text-cta"
              >
                <span className="w-1 h-4 rounded-full bg-transparent" />
                瀏覽節目系列
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="mt-auto pt-4">
        <div className="p-6 rounded-[2rem] bg-surface-muted border border-border-subtle">
          <div className="flex items-center gap-2 text-cta mb-3">
            <Zap size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Powered by AI
            </span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed font-bold">
            一人開發維護，內容由 AI 解析。若有錯誤請回報。
          </p>
        </div>
      </div>
    </aside>
  );
}
