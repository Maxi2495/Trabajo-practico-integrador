import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { ProductosPaginados } from '../types';

interface UseProductosParams {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export function useProductos(params: UseProductosParams = {}) {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: async () => {
      const response = await axiosInstance.get<ProductosPaginados>('/productos', {
        params,
      });
      return response.data;
    },
  });
}