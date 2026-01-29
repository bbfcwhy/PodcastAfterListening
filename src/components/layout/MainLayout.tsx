import Link from "next/link";
import { AIDisclaimer } from "@/components/ui/AIDisclaimer";
import { SearchBar } from "@/components/search/SearchBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold">
              Podcast 聽後回顧
            </Link>
            <div className="flex-1 w-full md:max-w-md">
              <SearchBar />
            </div>
            <div className="flex gap-4">
              <Link href="/search" className="hover:underline text-sm md:text-base">
                進階搜尋
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <AIDisclaimer />

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Podcast 聽後回顧網站。所有內容僅供參考。</p>
        </div>
      </footer>
    </div>
  );
}
