// src/utils/api.js  (or wherever your api.js is)
const BACKEND = (typeof window !== 'undefined')
  ? (window?.__NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL)
  : (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL);

const API_URL = BACKEND || 'http://localhost:3001';

function buildUrl(endpoint){
  // ensure endpoint starts with /
  const e = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // avoid double // when joining
  return `${API_URL.replace(/\/+$/, '')}/api${e}`;
}

export const api = {
  async request(endpoint, options = {}) {
    const url = buildUrl(endpoint);
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      // keep other options (signal, etc.)
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // try parse json safely
      let data = null;
      const text = await response.text();
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!response.ok) {
        // prefer server message if any
        const msg = data && (data.error || data.message) ? (data.error || data.message) : `HTTP ${response.status}`;
        const err = new Error(msg);
        err.status = response.status;
        err.response = data;
        throw err;
      }

      return data;
    } catch (error) {
      // network errors / CORS / fetch failures end up here
      console.error('API request failed:', error, 'url:', url);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
