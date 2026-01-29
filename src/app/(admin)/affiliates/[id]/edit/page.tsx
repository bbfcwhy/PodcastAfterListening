import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AffiliateForm } from "@/components/admin/AffiliateForm";

interface EditAffiliatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAffiliatePage({
  params,
}: EditAffiliatePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Fetch affiliate
  const { data: affiliate, error } = await supabase
    .from("affiliate_contents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !affiliate) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">編輯聯盟行銷內容</h1>
        <p className="text-muted-foreground mt-2">
          修改聯盟行銷內容資訊
        </p>
      </div>
      <AffiliateForm affiliate={affiliate} />
    </div>
  );
}
