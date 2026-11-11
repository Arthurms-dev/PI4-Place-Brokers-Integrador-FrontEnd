import { useEffect, useRef, useState } from "react";

/** `as` troca a tag do invólucro (ex.: "li" dentro de <ol>/<ul>, para a lista continuar válida). */
export default function Reveal({ children, atraso = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} style={{ animationDelay: `${atraso}ms` }} className={`${visivel ? "animate-fade-up" : "opacity-0"} ${className}`}>
      {children}
    </Tag>
  );
}
