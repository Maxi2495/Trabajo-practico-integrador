import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { PedidoRead, PedidosPaginados, ResumenPedidos } from '../types';

interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

interface PedidoCreateData {
  items: ItemPedidoCreate[];
  forma_pago: 'EFECTIVO' | 'TRANSFERENCIA';
  direccion_entrega: string;
  notas?: string;
}

export function useCrearPedido() {
  return useMutation({
    mutationFn: async (data: PedidoCreateData) => {
      const response = await axiosInstance.post<PedidoRead>('/pedidos', data);
      return response.data;
    },
  });
}

export function useMisPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'mios'],
    queryFn: async () => {
      const response = await axiosInstance.get<PedidosPaginados>('/pedidos');
      return response.data;
    },
  });
}

export function useCancelarPedido() {
  return useMutation({
    mutationFn: async (pedidoId: number) => {
      const response = await axiosInstance.patch<PedidoRead>(`/pedidos/${pedidoId}/cancelar`);
      return response.data;
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: async () => {
      const response = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
      return response.data;
    },
  });
}