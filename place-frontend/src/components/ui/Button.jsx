import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

const base =
  "pb-primary-button inline-flex min-h-11 items-center justify-center rounded-xl bg-gold-gradient px-5 text-[13px] font-bold text-[#1a1408] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";

export function ButtonLink({ className, ...props }) {
  return <Link className={cn(base, className)} {...props} />;
}

export function Button({ className, type = "button", ...props }) {
  return <button type={type} className={cn(base, "cursor-pointer", className)} {...props} />;
}