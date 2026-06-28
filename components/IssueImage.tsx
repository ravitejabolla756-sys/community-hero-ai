"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { IssueCategory } from "@/lib/types";

export function IssueImage({
  src,
  alt,
  category,
  className = ""
}: {
  src?: string;
  alt: string;
  category: IssueCategory;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-slate-100 to-civic-blue/10 ${className}`}>
        <div className="text-center text-civic-navy">
          <ImageOff className="mx-auto text-civic-blue" size={30} />
          <p className="mt-2 text-sm font-black">{category}</p>
          <p className="text-xs text-slate-500">No image evidence</p>
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
