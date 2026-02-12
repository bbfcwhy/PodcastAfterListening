import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { getShows } from "@/lib/services/shows"; // Server-side fetch
import { AIDisclaimer } from "@/components/ui/AIDisclaimer";
import { SearchBar } from "@/components/search/SearchBar";
import { UserMenu } from "@/components/navbar/UserMenu";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server";
import { AlertCircle, Podcast } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function MainLayout({ children }: MainLayoutProps) {
  // This is a Server Component, so it can safely call getShows() (which uses cookies())
  const shows = await getShows();
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* Pass data to Client Component */}
      <Sidebar shows={shows} />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 glass-header px-4 md:px-10 py-4 md:py-6 flex justify-between items-center gap-4">
          <div className="lg:hidden flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-cta rounded-xl flex items-center justify-center shadow-sm">
              <Podcast className="text-text-primary" size={20} />
            </div>
            <Link href="/" className="font-black tracking-tighter text-text-primary text-lg">
              Podcast 聽了以後
            </Link>
          </div>

          <div className="relative max-w-md w-full hidden md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdilfVxnkGT4aB3kkgtQ71xUH5AsW8L8yKtitYjCwK92HxFag/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-cta flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all hidden sm:flex"
            >
              <AlertCircle size={18} /> FEEDBACK
            </a>
            <div className="h-6 w-px bg-border-subtle hidden sm:block" />
            <UserMenu user={user} profile={profile} />
          </div>
        </header>

        <div className="md:hidden px-4 py-2">
          <SearchBar />
        </div>

        <div className="px-4 md:px-10 py-3">
          <AIDisclaimer />
        </div>

        <div className="flex-1">{children}</div>

        <footer className="mt-24 md:mt-32 border-t border-border-subtle/10 py-16 md:py-20 px-4 md:px-10 bg-cta/5">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center gap-4 items-center text-text-secondary">
              <Podcast size={32} />
              <span className="font-black tracking-tighter uppercase text-text-primary text-xl md:text-2xl">
                Podcast 聽了以後
              </span>
            </div>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto font-bold">
              我的 Podcast 筆記網站，也是給大家回顧聽過的 Podcast 內容的地方。內容由 AI 協助彙整，實際內容請以原節目為準。
            </p>
            <div className="flex justify-center gap-8 text-[10px] font-black text-text-primary uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-cta transition-colors">隱私</a>
              <a href="#" className="hover:text-cta transition-colors">條款</a>
              <a href="#" className="hover:text-cta transition-colors">聯絡</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
