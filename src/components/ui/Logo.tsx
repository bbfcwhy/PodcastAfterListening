"use client";

import Image from "next/image";
import Link from "next/link";

type LogoVariant = "horizontal" | "icon";
type LogoSize = "sm" | "md" | "lg";

const sizeConfig: Record<LogoSize, { icon: number; enText: string; zhText: string; gap: string }> = {
  sm: { icon: 28, enText: "text-[9px]", zhText: "text-xs", gap: "gap-2" },
  md: { icon: 36, enText: "text-[10px]", zhText: "text-base", gap: "gap-2.5" },
  lg: { icon: 48, enText: "text-xs", zhText: "text-xl", gap: "gap-3" },
};

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  className?: string;
}

export function Logo({ variant = "horizontal", size = "md", href, className = "" }: LogoProps) {
  const config = sizeConfig[size];

  const iconElement = (
    <Image
      src="/logos/logo-chat-icon.svg"
      alt="Podcast 聽了以後"
      width={config.icon}
      height={config.icon}
      className="shrink-0"
    />
  );

  const textElement = (
    <div className="leading-tight">
      <div className={`${config.enText} font-bold tracking-[0.15em] text-[#664129]`}>
        Podcast
      </div>
      <div className={`${config.zhText} font-bold text-[#664129]`}>
        聽了以後
      </div>
    </div>
  );

  const content = (
    <div className={`inline-flex items-center ${config.gap} ${className}`}>
      {iconElement}
      {variant !== "icon" && textElement}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex no-underline hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
