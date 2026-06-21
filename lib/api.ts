import axios from 'axios';

let apiURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();
// Enlever les guillemets accidentels
apiURL = apiURL.replace(/^['"]|['"]$/g, '');

// Si l'URL ne commence pas par http://, https:// ou /, on rajoute https://
if (!apiURL.startsWith('http://') && !apiURL.startsWith('https://') && !apiURL.startsWith('/')) {
  apiURL = 'https://' + apiURL;
}

const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Redirect to /login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

// ─── Files ───────────────────────────────────────────────────────────────────

export const filesAPI = {
  upload: (formData: FormData) =>
    api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e,
    }),
  applyMapping: (data: { file_id: string; mapping: Record<string, string | null> }) =>
    api.post('/api/files/apply-mapping', data),
  list: () => api.get('/api/files'),
  delete: (id: string) => api.delete(`/api/files/${id}`),
};

// ─── Data ────────────────────────────────────────────────────────────────────

export const dataAPI = {
  consolidated: (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    sort_by?: string;
    sort_dir?: string;
  }) => api.get('/api/data/consolidated', { params }),
  stats: () => api.get('/api/data/stats'),
  reset: () => api.post('/api/data/reset'),
  consolidate: () => api.get('/api/data/consolidate'),
};

// ─── Analysis ────────────────────────────────────────────────────────────────

export const analysisAPI = {
  run: (custom_prompt?: string) =>
    api.post('/api/analysis/run', { custom_prompt }),
  latest: () => api.get('/api/analysis/latest'),
  history: () => api.get('/api/analysis/history'),
  getById: (id: string) => api.get(`/api/analysis/${id}`),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const exportAPI = {
  excel: (options: {
    include_ai_analysis?: boolean;
    include_stats?: boolean;
    include_logs?: boolean;
  }) =>
    api.post('/api/export/excel', options, { responseType: 'blob' }),
};

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsAPI = {
  get: () => api.get('/api/settings'),
  changePassword: (current_password: string, new_password: string) =>
    api.post('/api/settings/password', { current_password, new_password }),
  updateApiKey: (api_key: string) =>
    api.post('/api/settings/api-key', { api_key }),
  updatePreferences: (date_format: string, language: string) =>
    api.post('/api/settings/preferences', null, {
      params: { date_format, language },
    }),
};

export default api;
