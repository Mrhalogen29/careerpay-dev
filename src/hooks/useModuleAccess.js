import { useEffect, useState } from "react";
import API from "../services/api";

// Short cache so the sidebar and a page guard don't both hit the server.
// Keyed by token so a different login never sees someone else's result.
let cache = { token: null, at: 0, promise: null };
const TTL_MS = 30 * 1000;

const fetchAccess = () => {
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch {}

  if (
    cache.promise &&
    cache.token === token &&
    Date.now() - cache.at < TTL_MS
  ) {
    return cache.promise;
  }

  const promise = API.get("/subscriptions/access").then(
    (res) => res.data?.data || {},
  );
  cache = { token, at: Date.now(), promise };
  // Don't keep a failed request in the cache
  promise.catch(() => {
    if (cache.promise === promise)
      cache = { token: null, at: 0, promise: null };
  });
  return promise;
};

const useModuleAccess = () => {
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stop = false;
    fetchAccess()
      .then((a) => !stop && setAccess(a))
      .catch(() => !stop && setFailed(true))
      .finally(() => !stop && setLoading(false));
    return () => {
      stop = true;
    };
  }, []);

  const hasModule = (name) => (failed || !access ? true : !!access[name]);

  return { access, loading, hasModule };
};

export default useModuleAccess;
