import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (producto_id: number) => void;
  updateQuantity: (producto_id: number, cantidad: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.producto_id === item.producto_id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.producto_id === item.producto_id
                ? { ...i, cantidad: i.cantidad + item.cantidad }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (producto_id) =>
        set({ items: get().items.filter((i) => i.producto_id !== producto_id) }),
      updateQuantity: (producto_id, cantidad) =>
        set({
          items: get().items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad } : i
          ),
        }),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0),
    }),
    { name: 'cart-storage' }
  )
);