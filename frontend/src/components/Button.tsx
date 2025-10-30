import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "yellow"|"primary"|"ghost" };
export default function Button({ variant="yellow", className="", ...props }: Props) {
  const base="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles= variant==="primary"
    ? "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700"
    : variant==="ghost"
    ? "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
    : "bg-amber-400 text-black hover:bg-amber-300 active:bg-amber-500";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
