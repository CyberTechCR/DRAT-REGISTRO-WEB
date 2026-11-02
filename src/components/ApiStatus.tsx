import { useEffect, useState } from 'react';

import { getApiHealth } from '../services/api';

export function ApiStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getApiHealth(controller.signal)
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
    return () => controller.abort();
  }, []);

  const label = connected === null
    ? 'Comprobando API…'
    : connected
      ? 'API conectada · datos reales'
      : 'API sin conexión';

  return <div className={`sync-status ${connected === false ? 'offline' : ''}`}><span /> {label}</div>;
}
