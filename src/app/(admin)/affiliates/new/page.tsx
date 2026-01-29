import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AffiliateForm } from "@/components/admin/AffiliateForm";

export default async function NewAffiliatePage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新增聯盟行銷內容</h1>
        <p className="text-muted-foreground mt-2">
          建立新的聯盟行銷內容
        </p>
      </div>
      <AffiliateForm />
    </div>
  );
}
