import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          找不到您要的頁面
        </p>
        <Link href="/">
          <Button>返回首頁</Button>
        </Link>
      </div>
    </MainLayout>
  );
}
