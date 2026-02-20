import type { AxiosInstance } from 'axios';

/**
 * Executa uma requisição com retry automático em caso de falha de rede/timeout.
 * Até 2 retries com 5s de espera entre eles.
 */
export async function requestWithRetry(
  api: AxiosInstance,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any,
  config?: any
): Promise<any> {
  const maxRetries = 2;
  let lastErr: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (method === 'get') return await api.get(url, config);
      if (method === 'post') return await api.post(url, data, config);
      if (method === 'put') return await api.put(url, data, config);
      if (method === 'patch') return await api.patch(url, data, config);
      if (method === 'delete') return await api.delete(url, config);
    } catch (err: any) {
      lastErr = err;
      const isNetwork = !err.response && (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED');
      if (isNetwork && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
