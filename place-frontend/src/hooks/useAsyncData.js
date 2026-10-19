import { useEffect, useState } from "react";

/**
 * @returns {{ data: any, loading: boolean, error: Error | null }}
 */
export function useAsyncData(fetcher) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, [fetcher]);

  return state;
}