import Link from "next/link";
import Image from "next/image";
import { Sparkles, Podcast } from "lucide-react";

export function HomeHero() {
  return (
    <div className="max-w-7xl mx-auto py-12 md:py-24 px-4 md:px-10">
      <div className="mb-24 md:mb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cta/10 rounded-full mb-8">
            <Sparkles className="text-cta" size={16} />
            <span className="text-[10px] font-black text-cta uppercase tracking-[0.3em]">
              Podcast After Listening
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 md:mb-10 tracking-tighter leading-[1.1] text-text-primary">
            Podcast 聽了以後
          </h2>
          <p className="text-text-secondary text-lg md:text-xl font-bold leading-relaxed mb-10 md:mb-12 max-w-xl mx-auto lg:mx-0">
            記下那些改變我的，
            <br />
            也找回那些你聽過的。
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6">
            <Link
              href="/#最新單集"
              className="px-8 md:px-10 py-4 md:py-5 bg-cta hover:opacity-90 text-text-primary rounded-[1.8rem] font-black text-sm hover:scale-105 transition-all shadow-sm uppercase tracking-[0.2em]"
            >
              開始探索
            </Link>
            <Link
              href="/search"
              className="px-8 md:px-10 py-4 md:py-5 bg-surface text-text-primary border border-cta rounded-[1.8rem] font-black text-sm hover:bg-cta hover:opacity-90 transition-all uppercase tracking-[0.2em]"
            >
              進階搜尋
            </Link>
          </div>
        </div>

        <div className="flex-1 relative group w-full max-w-lg">
          <div className="absolute -inset-8 bg-cta/20 rounded-[4rem] blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative z-10 bg-surface p-4 rounded-[4rem] shadow-sm border border-border-subtle/5 hover:rotate-2 transition-transform duration-700">
            <Image
              src="/images/podcast-hero.png"
              alt="PodcastHub 主視覺 - 播客主持人插畫"
              width={600}
              height={400}
              className="w-full h-auto rounded-[3.5rem] shadow-inner"
              priority
            />
            <div className="absolute -bottom-6 -right-6 w-20 h-20 md:w-24 md:h-24 bg-cta rounded-full flex items-center justify-center shadow-sm text-text-primary animate-bounce pointer-events-none">
              <Podcast size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
