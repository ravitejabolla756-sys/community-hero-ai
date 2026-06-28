"use client";

import { AlertCircle } from "lucide-react";
import { firebaseEnabled, firebaseSetupMessage } from "@/lib/firebase/config";

export function FirebaseSetupNotice() {
  if (firebaseEnabled) return null;

  return (
    <div className="border-b border-amber-200/70 bg-white/82 backdrop-blur">
      <div className="shell flex items-center gap-3 py-2 text-xs text-slate-600">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-black uppercase text-amber-800 ring-1 ring-amber-200">
          <AlertCircle size={13} />
          Demo Mode
        </span>
        <p className="line-clamp-1 font-semibold">{firebaseSetupMessage}</p>
      </div>
    </div>
  );
}
