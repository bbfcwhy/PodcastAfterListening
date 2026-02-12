import { getShowById } from "@/lib/services/admin/shows";
import { ShowForm } from "@/components/admin/ShowForm";
import { notFound } from "next/navigation";

interface EditShowPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditShowPage({ params }: EditShowPageProps) {
  // Note: 'slug' here is actually the show ID, named to match Next.js route group requirements
  const { slug: id } = await params;
  const show = await getShowById(id);

  if (!show) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">編輯節目</h1>
        <p className="text-text-secondary mt-2">修改節目資訊</p>
      </div>
      <ShowForm show={show} />
    </div>
  );
}
