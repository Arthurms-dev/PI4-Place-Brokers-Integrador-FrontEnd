import logo from "@/assets/logo.webp";
import { cn } from "@/lib/cn";

export function Logo({ className, ...props }) {
  return (
    <img
      src={logo}
      alt="Place Brokers"
      width={600}
      height={258}
      decoding="async"
      className={cn("h-9 w-auto select-none", className)}
      {...props}
    />
  );
}