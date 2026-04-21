export interface Product {
  nama: string;
  stok: number;
  harga: number;
  diskon: number;
  gambarUrl: string;
}

export type Page = 'home' | 'login' | 'admin';
