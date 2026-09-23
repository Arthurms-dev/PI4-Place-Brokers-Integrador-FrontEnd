import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

const base =
  "inline-flex h-8 items-center justify-center rounded-md bg-gold-gradient px-5 text-xs font-medium text-[#1a1408] transition hover:brightness-110";

export function ButtonLink({ className, ...props }) {
  return <Link className={cn(base, className)} {...props} />;
}

export function Button({ className, type = "button", ...props }) {
  return <button type={type} className={cn(base, "cursor-pointer", className)} {...props} />;
}