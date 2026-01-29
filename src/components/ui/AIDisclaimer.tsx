import { Info } from "lucide-react";

export function AIDisclaimer() {
  return (
    <div className="bg-surface-muted border border-border-subtle rounded-2xl px-6 py-4 flex items-center gap-4">
      <div className="w-8 h-8 bg-info/10 rounded-xl flex items-center justify-center shrink-0">
        <Info className="text-info" size={16} />
      </div>
      <p className="text-[11px] md:text-xs text-text-secondary font-bold leading-relaxed">
        <span className="text-text-primary font-black">重要提示：</span>
        以下內容由 AI 自動解析產生，僅供參考，一切以原始 Podcast 節目內容為準。
      </p>
    </div>
  );
}
