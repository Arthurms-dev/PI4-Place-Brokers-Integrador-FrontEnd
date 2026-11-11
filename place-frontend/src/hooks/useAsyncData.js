
import { useEffect, useState } from "react";
import { getToken } from "@/lib/authToken";

const consultasEmAndamento = new WeakMap();

function executarConsulta(fetcher) {
  const token = getToken() ?? "";
  const existente = consultasEmAndamento.get(fetcher);

  if (existente && existente.token === token) {
    return existente.promise;
  }

  const promise = Promise.resolve().then(() => fetcher());

  const registro = {
    token,
    promise,
  };

  consultasEmAndamento.set(fetcher, registro);

  const limpar = () => {
    if (consultasEmAndamento.get(fetcher) === registro) {
      consultasEmAndamento.delete(fetcher);
    }
  };

  promise.then(limpar, limpar);

  return promise;
}

/**
 *
 * @returns {{
 *   data: any,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useAsyncData(fetcher) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
    }));

    executarConsulta(fetcher)
      .then((data) => {
        if (active) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [fetcher]);

  return state;
}
