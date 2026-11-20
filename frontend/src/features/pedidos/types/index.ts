export interface DetallePedidoRead {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface PedidoRead {
  id: number;
  usuario_id: number;
  estado: string;
  forma_pago: string;
  direccion_entrega: string;
  notas?: string;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedidoRead[];
}

export interface PedidosPaginados {
  total: number;
  items: PedidoRead[];
}