"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function OfflineBanner() {
  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>注意：</strong>
        目前無法連線至資料庫服務，顯示的內容可能不是最新的。留言等即時功能暫時停用。
      </AlertDescription>
    </Alert>
  );
}
