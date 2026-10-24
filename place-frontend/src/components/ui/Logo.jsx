import logo from "@/assets/logo.png";
import { cn } from "@/lib/cn";

export function Logo({ className = "h-10", ...props }) {
  return (
    <img
      src={logo}
      alt="Place Brokers"
      width={600}
      height={258}
      decoding="async"
      className={cn(
        "block w-auto max-w-full object-contain",
        className
      )}
      {...props}
    />
  );
}
