import { ShowForm } from "@/components/admin/ShowForm";

export default function NewShowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">新增節目</h1>
        <p className="text-text-secondary mt-2">建立新的 Podcast 節目系列</p>
      </div>
      <ShowForm />
    </div>
  );
}
