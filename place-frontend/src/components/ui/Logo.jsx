import { cn } from "@/lib/cn";

export function Logo({ className }) {
  return (
    <svg viewBox="0 0 150 46" role="img" aria-label="Place Brokers" className={cn("h-9 w-auto", className)}>
      <circle cx="19" cy="19" r="14.5" fill="none" stroke="#e9ad5a" strokeWidth="4" />
      <path d="M19 44c-5-6-9-10-9-15h18c0 5-4 9-9 15z" fill="#e9ad5a" />
      <text x="14.3" y="26" fontFamily="Roboto, Arial" fontWeight="700" fontSize="20" fill="#fff">P</text>
      <text x="42" y="17" fontFamily="Roboto, Arial" fontWeight="700" fontSize="17" fill="#fff" letterSpacing=".4">PLACE</text>
      <text x="42" y="34" fontFamily="Roboto, Arial" fontWeight="700" fontSize="17" fill="#fff" letterSpacing=".4">BROKERS</text>
      <text x="42" y="43" fontFamily="Roboto, Arial" fontSize="4.6" fill="#c3cee0" letterSpacing=".8">NEGÓCIOS IMOBILIÁRIOS</text>
    </svg>
  );
}
