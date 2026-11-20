import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { ProductoRead, ProductosPaginados } from '../types';

interface UseProductosParams {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export interface ProductoPayload {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string;
  stock: number;
  disponible: boolean;
}

export interface ProductoStockPayload {
  stock: number;
  disponible: boolean;
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

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductoPayload) => {
      const response = await axiosInstance.post<ProductoRead>('/productos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductoPayload> }) => {
      const response = await axiosInstance.put<ProductoRead>(`/productos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useActualizarStockProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductoStockPayload }) => {
      const response = await axiosInstance.patch<ProductoRead>(`/productos/${id}/stock`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}