import axios from 'axios';

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((err) => err.msg).join(', ');
    }
    return error.message || 'Ocurrió un error en el servidor';
  }
  return 'Ocurrió un error inesperado';
}