import logo from "@/assets/logo.png";
import { cn } from "@/lib/cn";

export function Logo({ className, ...props }) {
  return (
    <img
      src={logo}
      alt="Place Brokers"
      decoding="async"
      className={cn(
        "block h-auto max-h-12 w-auto max-w-full object-contain",
        className
      )}
      {...props}
    />
  );
}
