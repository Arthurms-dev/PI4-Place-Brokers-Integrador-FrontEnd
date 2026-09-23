import { useEffect, useRef, useState } from "react";

export function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    setWidth(node.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}