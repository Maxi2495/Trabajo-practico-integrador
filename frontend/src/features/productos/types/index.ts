export interface CategoriaReadRef {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface ProductoRead {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: CategoriaReadRef;
}

export interface ProductosPaginados {
  total: number;
  items: ProductoRead[];
}