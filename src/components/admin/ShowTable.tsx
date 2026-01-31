"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Show } from "@/types/database";
import { Edit, ExternalLink, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import Image from "next/image";
import { useState } from "react";

interface ShowTableProps {
  shows: Show[];
}

function CoverImage({ src, alt }: { src: string | null; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-12 h-12 rounded bg-surface-muted flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-text-secondary" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="w-12 h-12 rounded object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export function ShowTable({ shows }: ShowTableProps) {
  return (
    <Table className="bg-surface">
      <TableHeader>
        <TableRow className="border-border-subtle">
          <TableHead className="text-text-primary w-16">封面</TableHead>
          <TableHead className="text-text-primary">名稱</TableHead>
          <TableHead className="text-text-primary">Slug</TableHead>
          <TableHead className="text-text-primary">建立時間</TableHead>
          <TableHead className="text-right text-text-primary">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shows.length === 0 ? (
          <TableRow className="border-border-subtle">
            <TableCell colSpan={5} className="text-center text-text-secondary">
              尚無節目
            </TableCell>
          </TableRow>
        ) : (
          shows.map((show) => (
            <TableRow key={show.id} className="border-border-subtle hover:bg-hover">
              <TableCell>
                <CoverImage src={show.cover_image_url} alt={show.name} />
              </TableCell>
              <TableCell className="font-medium text-text-primary">
                {show.name}
              </TableCell>
              <TableCell className="text-text-secondary">{show.slug}</TableCell>
              <TableCell className="text-text-secondary">
                {format(new Date(show.created_at), "yyyy-MM-dd", {
                  locale: zhTW,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/shows/${show.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  {show.original_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={show.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
