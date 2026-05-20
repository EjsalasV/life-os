import React from "react";
import { Info } from "lucide-react";

export default function FormErrorBanner({ errorMsg }) {
  if (!errorMsg) return null;

  return (
    <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl flex gap-2 items-center animate-in fade-in zoom-in-95">
      <Info size={14} /> {errorMsg}
    </div>
  );
}
