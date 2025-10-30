import React from "react";
export default function Badge({ children }: {children: React.ReactNode}) {
  return <span className="rounded-lg bg-neutral-100 text-neutral-700 text-xs px-2 py-1">{children}</span>;
}
