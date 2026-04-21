import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Search, LogIn, Warehouse, Package, MessageCircle, Plus, 
  Trash2, Edit, X, Image as ImageIcon, ArrowRight, Filter,
  ChevronRight, LayoutGrid, List, MoreVertical, RefreshCcw,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Page } from './types';
import { fetchProducts, saveToSheet } from './services/sheetsService';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Product>({
    nama: '',
    stok: 0,
    harga: 0,
    diskon: 0,
    gambarUrl: ''
  });

  const adminWhatsapp = "+628557271197";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const action = editingIndex !== null ? 'update' : 'insert';
      await saveToSheet(action, formData);
      await loadData(); // Refresh actual data
      setShowModal(false);
    } catch (error) {
      alert('Gagal menyimpan ke Google Sheets.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (confirm('Hapus produk ini secara permanen?')) {
      setIsSaving(true);
      try {
        await saveToSheet('delete', products[index]);
        await loadData();
      } catch (error) {
        alert('Gagal menghapus data.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const openModal = (product?: Product, index?: number) => {
    if (product && index !== undefined) {
      setFormData(product);
      setEditingIndex(index);
    } else {
      setFormData({ nama: '', stok: 0, harga: 0, diskon: 0, gambarUrl: '' });
      setEditingIndex(null);
    }
    setShowModal(true);
  };

  const handleBuy = (product: Product) => {
    const message = `Halo Admin Brontolano, saya ingin membeli:\n\nProduk: ${product.nama}\nHarga: Rp${product.harga.toLocaleString()}\n\nApakah stok masih tersedia?`;
    const url = `https://wa.me/${adminWhatsapp.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background */}
      {page === 'admin' && <div className="fixed inset-0 admin-grid-pattern opacity-40 pointer-events-none" />}
      
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div 
            className="group flex cursor-pointer items-center gap-3"
            onClick={() => setPage('home')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform group-hover:scale-105">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">BRONTOLANO</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Smart Warehouse</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {page === 'home' && (
              <>
                <button 
                  onClick={() => setPage('login')}
                  className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <LogIn className="h-4 w-4" />
                  Staff Access
                </button>
                <button 
                  onClick={() => setPage('login')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white sm:hidden"
                  title="Staff Access"
                >
                  <LogIn className="h-5 w-5" />
                </button>
              </>
            )}
            {page === 'admin' && (
              <button 
                onClick={() => setPage('home')}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Hero & Search area */}
              <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wider text-indigo-600 uppercase">
                    Inventaris Gudang Realtime
                  </span>
                  <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                    Katalog <span className="text-indigo-600">Digital.</span>
                  </h2>
                  <p className="mt-4 text-lg text-slate-500 leading-relaxed">
                    Sistem pemantauan stok mandiri untuk mempermudah operasional gudang dan kenyamanan belanja Anda.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative group min-w-[300px]">
                    <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                    <input 
                      type="text"
                      placeholder="Cari item di gudang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-4 pl-12 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                  <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* View Control */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <p className="text-sm font-medium text-slate-400">
                  Menampilkan <span className="font-bold text-slate-900">{filteredProducts.length}</span> barang
                </p>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      layout
                      key={idx}
                      className={`group relative overflow-hidden bg-white transition-all ${
                        viewMode === 'grid' 
                        ? 'rounded-[32px] border border-slate-100 p-3 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/40' 
                        : 'flex items-center gap-6 rounded-2xl border border-slate-100 p-4 hover:border-indigo-100'
                      }`}
                    >
                      <div className={`relative overflow-hidden bg-slate-50 ${viewMode === 'grid' ? 'aspect-[4/5] rounded-[24px]' : 'h-24 w-24 rounded-xl flex-shrink-0'}`}>
                        <img 
                          src={product.gambarUrl || `https://picsum.photos/seed/${product.nama}/800/1000`}
                          alt={product.nama}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        {product.diskon > 0 && (
                          <div className="absolute top-4 left-4 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black tracking-wider text-white shadow-lg">
                            -{product.diskon}% OFF
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex flex-col justify-between ${viewMode === 'grid' ? 'p-4' : 'flex-1'}`}>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              #{idx + 1} STOCK-READY
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className={`h-1.5 w-1.5 rounded-full ${product.stok > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                              <span className="text-[10px] font-bold text-slate-500">{product.stok} UNIT</span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {product.nama}
                          </h3>
                        </div>
                        
                        <div className={`flex items-end justify-between ${viewMode === 'grid' ? 'mt-6' : 'mt-2'}`}>
                          <div>
                            <p className="text-xl font-black text-slate-900">
                              Rp{product.harga.toLocaleString()}
                            </p>
                            {product.diskon > 0 && (
                              <p className="text-[10px] font-medium text-slate-400 line-through">
                                Rp{Math.round(product.harga / (1 - product.diskon/100)).toLocaleString()}
                              </p>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => handleBuy(product)}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-slate-900 hover:rotate-12 active:scale-90"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && !loading && (
                <div className="mt-20 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50">
                    <Search className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Produk Tidak Ditemukan</h3>
                  <p className="mt-2 text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
                </div>
              )}
            </motion.div>
          )}

          {page === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto mt-20 max-w-sm"
            >
              <div className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/50">
                <div className="mb-10 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                    <Warehouse className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">Staff Portal</h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">Authorized personnel only</p>
                </div>

                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  if (fd.get('user') === 'admin' && fd.get('pass') === 'brontolano') {
                    setPage('admin');
                  } else {
                    alert('Invalid credentials');
                  }
                }}>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID STAFF</label>
                    <input 
                      name="user"
                      type="text" 
                      required
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PASSWORD</label>
                    <input 
                      name="pass"
                      type="password" 
                      required
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-sm font-black tracking-wider text-white uppercase transition-all hover:gap-5 active:scale-95"
                  >
                    Authenticate
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
              
              <button 
                onClick={() => setPage('home')}
                className="mt-8 flex w-full items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900"
              >
                Back to Public Catalog
              </button>
            </motion.div>
          )}

          {page === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Live Cloud Database</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Control Center.</h2>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={loadData}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-100 transition-all hover:shadow-indigo-200 active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    NEW ENTRY
                  </button>
                </div>
              </div>

              {/* Advanced Stats */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                <div className="rounded-3xl border border-slate-100 bg-white p-6">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Items</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{products.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-6">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Low Stock Alerts</p>
                  <p className="mt-1 text-3xl font-black text-rose-500">{products.filter(p => p.stok <= 5).length}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-6">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Value (Est)</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">Rp{(products.reduce((acc, p) => acc + (p.harga * p.stok), 0) / 1000000).toFixed(1)}M</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-100/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Production Name</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Inventory Status</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Unit Price</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Disc</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map((p, i) => (
                        <tr key={i} className="group transition-colors hover:bg-slate-50/80">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <img src={p.gambarUrl || 'https://picsum.photos/seed/placeholder/100'} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <span className="font-bold text-slate-900">{p.nama}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${p.stok <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              <span className={`text-xs font-black ${p.stok <= 5 ? 'text-rose-600' : 'text-slate-600'}`}>{p.stok} UNIT</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-mono text-sm">Rp{p.harga.toLocaleString()}</td>
                          <td className="px-8 py-6">
                            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-white">-{p.diskon}%</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                               <button 
                                onClick={() => openModal(p, i)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(i)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Management Produk */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-50 p-8">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{editingIndex !== null ? 'Modify Entry' : 'New Entry'}</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Warehouse Record</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="rounded-full bg-slate-50 p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Assignment</label>
                      <input 
                        required
                        value={formData.nama}
                        onChange={e => setFormData({...formData, nama: e.target.value})}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        placeholder="Ex: Industrial Tool A1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory qty</label>
                        <input 
                          type="number"
                          required
                          value={formData.stok}
                          onChange={e => setFormData({...formData, stok: parseInt(e.target.value)})}
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standard Price (Rp)</label>
                        <input 
                          type="number"
                          required
                          value={formData.harga}
                          onChange={e => setFormData({...formData, harga: parseInt(e.target.value)})}
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount (%)</label>
                        <input 
                          type="number"
                          value={formData.diskon}
                          onChange={e => setFormData({...formData, diskon: parseInt(e.target.value)})}
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource URL</label>
                        <input 
                          value={formData.gambarUrl}
                          onChange={e => setFormData({...formData, gambarUrl: e.target.value})}
                          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50"
                          placeholder="Public image link"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded-2xl border border-slate-100 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex-[2] rounded-2xl bg-indigo-600 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:shadow-indigo-200 disabled:opacity-50"
                    >
                      {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
             <Warehouse className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Authenticated Database &bull; Smart Warehouse Brontolano
          </p>
          <div className="mt-8 flex justify-center gap-8 text-[10px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> SECURITY ENCRYPTED</span>
            <span className="flex items-center gap-1.5"><RefreshCcw className="h-3 w-3" /> REALTIME SYNC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
