import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface OriginalLinkButtonProps {
  url: string;
  label?: string;
}

export function OriginalLinkButton({
  url,
  label = "收聽原始節目",
}: OriginalLinkButtonProps) {
  return (
    <Button asChild variant="default" size="lg" className="rounded-[1.5rem]">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {label}
        <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}
