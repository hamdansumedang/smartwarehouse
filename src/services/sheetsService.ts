import Papa from 'papaparse';
import { Product } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQopq-9JvlH5VrMPCHTB-8UURXcng7hltgnRLq7kFWlDz0Pym0g6KFFiOs_vOLIweajBcSD9Qy3-ylj/pub?output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiGCo0wNSADt-rIRcpBVgbbEf2jnqrklM2UF_4vE75dhEtXypQp3ThBSAg5AnKzSSHSg/exec';

export const fetchProducts = (): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products: Product[] = results.data.map((row: any) => {
          const rawDiskon = row['Diskon'] || '0';
          let diskonVal = parseFloat(rawDiskon.toString().replace('%', ''));
          
          // Google Sheets often exports 1% as 0.01 in CSV if formatted as percent
          if (!rawDiskon.toString().includes('%') && diskonVal > 0 && diskonVal < 1) {
            diskonVal = diskonVal * 100;
          }

          return {
            nama: row['Nama Produk'] || '',
            stok: parseInt(row['Stok'] || '0') || 0,
            harga: parseInt(row['Harga'] || '0') || 0,
            diskon: Math.round(diskonVal),
            gambarUrl: row['URL Gambar'] || '',
          };
        }).filter((prod: Product) => prod.nama);
        resolve(products);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const saveToSheet = async (action: 'insert' | 'update' | 'delete', product: Product) => {
  const payload = {
    action,
    nama: product.nama,
    stok: product.stok,
    harga: product.harga,
    diskon: product.diskon,
    image: product.gambarUrl, // Script expects 'image'
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error("Error saving to sheet:", error);
    throw error;
  }
};
