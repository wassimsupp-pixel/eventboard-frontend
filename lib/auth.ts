import { authAPI } from './api';

export async function logout() {
  try {
    await authAPI.logout();
  } catch (e) {
    // ignore
  }
  window.location.href = '/login';
}

export async function getCurrentUser(): Promise<{ username: string } | null> {
  try {
    const res = await authAPI.me();
    return res.data;
  } catch {
    return null;
  }
}
