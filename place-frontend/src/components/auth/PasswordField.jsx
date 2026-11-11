import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fieldInputClass } from "@/components/auth/FormField";

export default function PasswordField({ value, onChange, autoComplete, error, inputClassName, ...props }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visivel ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={inputClassName ?? `${fieldInputClass(error)} pr-12`}
      />
      <button
        type="button"
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        title={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        onClick={() => setVisivel((v) => !v)}
        className="absolute inset-y-0 right-1 flex min-w-10 items-center justify-center rounded-lg text-ink-3 transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
      >
        <Icon name={visivel ? "eyeOff" : "eye"} className="size-[18px]" />
      </button>
    </div>
  );
}
