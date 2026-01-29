import { Alert, AlertDescription } from "@/components/ui/alert";

export function AIDisclaimer() {
  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <AlertDescription className="text-sm">
        <strong>重要提示：</strong>
        以下內容由 AI 自動解析產生，僅供參考，一切以原始 Podcast 節目內容為準。
      </AlertDescription>
    </Alert>
  );
}
