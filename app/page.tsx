'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Search, Plus, Trash2, FileDown, LogOut, Package, X, Moon, Sun, Filter, Save, MessageCircle, FileSpreadsheet } from 'lucide-react';
import productosData from '@/data/productos.json';
import { generatePDF } from '@/utils/generatePDF';
import { PdfTemplate } from '@/components/PdfTemplate';

// --- TYPES ---
interface Producto {
  codigo: string;
  producto: string;
  precio_unitario: number;
  precio_interior?: number;
  precio_ciudad?: number;
  descuento_ciudad?: number;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
  unitPrice: number;
}

export default function Home() {
  // --- STATES ---
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODO');
  const [shippingType, setShippingType] = useState<'interior' | 'ciudad'>('interior');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [client, setClient] = useState({ name: '', nit: '', address: '', deliveryTime: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, visible: boolean }>({ msg: '', visible: false });

  // --- INIT & PERSISTENCE ---
  useEffect(() => {
    const savedCart = localStorage.getItem('cylo_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedTheme = localStorage.getItem('cylo_theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (cart.length > 0) localStorage.setItem('cylo_cart', JSON.stringify(cart));
    else localStorage.removeItem('cylo_cart');
  }, [cart]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cylo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cylo_theme', 'light');
    }
  }, [darkMode]);

  // --- KEYBOARD SHORTCUTS ---
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const productos: Producto[] = useMemo(() => {
    return (productosData as any[]).map(p => ({
      ...p,
      precio_interior: p.precio_interior || p.precio_unitario,
      precio_ciudad: p.precio_ciudad || p.precio_unitario,
      descuento_ciudad: p.descuento_ciudad || 0,
    }));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>(['TODO']);
    productos.forEach(p => {
      const prefix = (p.codigo || '').split('-')[0];
      if (prefix) cats.add(prefix);
    });
    return Array.from(cats).sort();
  }, [productos]);

  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const prodStr = (p.producto || '').toLowerCase();
      const codStr = (p.codigo || '').toLowerCase();
      const searchStr = search.toLowerCase();
      const matchesSearch = prodStr.includes(searchStr) || codStr.includes(searchStr);
      const matchesCategory = categoryFilter === 'TODO' || (p.codigo || '').startsWith(categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [productos, search, categoryFilter]);

  // --- LOGIC ---
  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast({ msg: '', visible: false }), 3000);
  };

  const addToCart = (producto: Producto) => {
    const basePrice = producto.precio_interior!;
    const existing = cart.find(item => item.producto.codigo === producto.codigo);
    if (existing) {
      setCart(cart.map(item => item.producto.codigo === producto.codigo ? { ...item, cantidad: item.cantidad + 1, unitPrice: basePrice } : item));
    } else {
      setCart([...cart, { producto, cantidad: 1, unitPrice: basePrice }]);
    }
    showToast(`Agregado: ${producto.codigo}`);
  };

  const getCloudinaryUrl = (codigo: string, producto: string) => {
    const formattedCode = codigo.toLowerCase().replace(/-/g, '_');
    const formattedName = producto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return `https://res.cloudinary.com/dhew6sfwc/image/upload/v1/${formattedCode}_${formattedName}.jpg`;
  };

  // --- FINANCIAL CALCS ---
  const subtotal = cart.reduce((sum, item) => {
    const freshProduct = productos.find(p => p.codigo === item.producto.codigo) || item.producto;
    const basePrice = freshProduct.precio_interior || item.unitPrice;
    return sum + (basePrice * item.cantidad);
  }, 0);
  
  let discount = 0;
  if (shippingType === 'ciudad') {
    discount = cart.reduce((sum, item) => {
      const freshProduct = productos.find(p => p.codigo === item.producto.codigo) || item.producto;
      const discountPerUnit = freshProduct.descuento_ciudad || 0;
      return sum + (discountPerUnit * item.cantidad);
    }, 0);
  }

  const total = subtotal - discount;

  const cotNumber = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const aaaa = d.getFullYear();
    const num = String(Math.floor(Math.random() * 9000) + 1000); // 4 dígitos
    return `COT-${dd}${mm}${aaaa}${num}`;
  }, []);

  // --- EXPORTS ---
  const exportToCSV = () => {
    let csv = "DETALLES DE COTIZACION\n\n";
    csv += `No. Cotizacion:,"${cotNumber}"\n`;
    csv += `Cliente:,"${client.name || 'Cliente de Mostrador'}"\n`;
    csv += `NIT:,"${client.nit || 'C/F'}"\n`;
    csv += `Direccion:,"${client.address || 'N/A'}"\n`;
    csv += `Tiempo de entrega:,"${client.deliveryTime || 'Inmediato'}"\n`;
    csv += `Tipo de envio:,"${shippingType === 'ciudad' ? 'Ciudad Capital' : 'Interior de la Republica'}"\n\n`;

    csv += "Codigo,Producto,Cantidad,Precio Unitario,Subtotal\n";
    cart.forEach(item => {
      csv += `${item.producto.codigo},"${item.producto.producto}",${item.cantidad},Q${item.unitPrice.toFixed(2)},Q${(item.unitPrice * item.cantidad).toFixed(2)}\n`;
    });

    csv += `\n,,,Subtotal Base:,Q${subtotal.toFixed(2)}\n`;
    csv += `,,,Descuento:,-Q${discount.toFixed(2)}\n`;
    csv += `,,,TOTAL FINAL:,Q${total.toFixed(2)}\n`;

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel UTF-8
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cotNumber}.csv`;
    link.click();
    showToast("Exportado a Excel (CSV)");
  };

  const sendWhatsApp = () => {
    let text = `*CYLO GUATEMALA - Cotización ${cotNumber}*\n\n`;
    cart.forEach(item => {
      text += `• ${item.cantidad}x ${item.producto.codigo} - Q${(item.unitPrice * item.cantidad).toFixed(2)}\n`;
    });
    text += `\n*TOTAL: Q${total.toFixed(2)}*\n\n*Envío:* ${shippingType === 'ciudad' ? 'Capital (Descuento Aplicado)' : 'Interior'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- RENDER ---
  if (!isAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <Package className="w-12 h-12 text-indigo-500 mb-4" />
            <h1 className="text-3xl font-black tracking-tight">CYLO <span className="font-light text-indigo-400">ERP</span></h1>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if(password==='CYLO2026') setIsAuth(true); else alert('Denegado'); }} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
              placeholder="Clave de acceso segura"
            />
            <button type="submit" className="w-full py-3 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-colors">
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-[#F8FAFC] text-slate-800'}`}>
      
      {/* HEADER */}
      <header className={`${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-b sticky top-0 z-30 transition-colors`}>
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-wide">CYLO <span className="font-light opacity-70">TopMundial</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold">
              <kbd className="font-mono text-indigo-500">/</kbd> <span className="opacity-70">para buscar</span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button onClick={() => setIsAuth(false)} className="text-red-500 hover:text-red-600 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-[1800px] mx-auto p-2 sm:p-6 flex flex-col xl:flex-row gap-6 xl:h-[calc(100vh-4rem)]">
        
        {/* LEFT COLUMN: DataGrid */}
        <div className={`flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden min-h-[500px] xl:min-h-0 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

          
          {/* Toolbar */}
          <div className={`p-4 border-b flex gap-4 ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Buscar SKU o nombre..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-md' : (darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className={`sticky top-0 z-10 backdrop-blur-md ${darkMode ? 'bg-slate-900/90 text-slate-400' : 'bg-white/90 text-slate-500'}`}>
                <tr>
                  <th className="px-6 py-4 font-semibold w-16">Img</th>
                  <th className="px-6 py-4 font-semibold w-32">SKU</th>
                  <th className="px-6 py-4 font-semibold">Producto</th>
                  <th className="px-6 py-4 font-semibold w-32 text-right">Precio Base</th>
                  <th className="px-6 py-4 font-semibold w-24 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredProducts.slice(0, 150).map((p, i) => (
                  <tr key={i} className={`group transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-3">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden relative cursor-pointer border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        onClick={() => setSelectedImage(getCloudinaryUrl(p.codigo, p.producto))}
                      >
                        <Image src={getCloudinaryUrl(p.codigo, p.producto)} alt="IMG" fill style={{ objectFit: 'contain' }} unoptimized className="opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300" />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs opacity-70">{p.codigo}</td>
                    <td className="px-6 py-3 font-medium whitespace-normal min-w-[250px]">{p.producto}</td>
                    <td className="px-6 py-3 font-bold text-right">Q{p.precio_interior?.toFixed(2)}</td>
                    <td className="px-6 py-3 text-center">
                      <button 
                        onClick={() => addToCart(p)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Quotation Builder */}
        <div className={`w-full xl:w-[450px] xl:flex-shrink-0 flex flex-col rounded-2xl border shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          {/* Tabs Envio */}
          <div className="flex p-2 gap-2 border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setShippingType('interior')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shippingType === 'interior' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Envío Interior (Precio Base)
            </button>
            <button 
              onClick={() => setShippingType('ciudad')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shippingType === 'ciudad' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Envío Capital (Descuento)
            </button>
          </div>

          {/* Client Form */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Nombre de Cliente" value={client.name} onChange={e => setClient({...client, name: e.target.value})} className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              <input type="text" placeholder="NIT" value={client.nit} onChange={e => setClient({...client, nit: e.target.value})} className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Dirección Entrega" value={client.address} onChange={e => setClient({...client, address: e.target.value})} className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
              <input type="text" placeholder="Tiempo (ej. 24hrs)" value={client.deliveryTime} onChange={e => setClient({...client, deliveryTime: e.target.value})} className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Search className="w-10 h-10 mb-2" />
                <p className="text-xs">Sin líneas de cotización</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {cart.map((item, idx) => (
                  <li key={idx} className={`flex gap-3 p-3 rounded-xl border relative group ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" title={item.producto.producto}>{item.producto.producto}</p>
                      <p className="text-[10px] opacity-60 font-mono mt-0.5">{item.producto.codigo}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="number" min="1" value={item.cantidad} 
                          onChange={(e) => setCart(cart.map(c => c.producto.codigo === item.producto.codigo ? {...c, cantidad: parseInt(e.target.value)||1} : c))}
                          className={`w-16 px-2 py-1 text-center border rounded-lg text-xs outline-none focus:ring-1 ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'}`}
                        />
                        <span className="text-xs font-bold opacity-80">x Q{item.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className="font-black text-sm">Q{(item.unitPrice * item.cantidad).toFixed(2)}</span>
                      <button onClick={() => setCart(cart.filter(c => c.producto.codigo !== item.producto.codigo))} className="text-red-500 opacity-50 hover:opacity-100 p-1 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Checkout Footer */}
          <div className={`p-5 rounded-b-2xl border-t ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Subtotal</span>
                <span>Q{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-bold text-green-500">
                  <span>Descuento</span>
                  <span>- Q{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>TOTAL</span>
                <span className="text-indigo-600 dark:text-indigo-400">Q{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Impuestos Incluidos</p>
              <div className="flex gap-2">
                <button onClick={exportToCSV} title="Exportar CSV" className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"><FileSpreadsheet className="w-5 h-5"/></button>
                <button onClick={sendWhatsApp} title="Enviar WhatsApp" className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"><MessageCircle className="w-5 h-5"/></button>
              </div>
            </div>

            <button 
              onClick={() => {
                showToast("Generando PDF Pixel-Perfect...");
                setTimeout(() => generatePDF('pdf-template', client.name), 100);
              }}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 disabled:opacity-50 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <FileDown className="w-5 h-5" />
              Generar Cotización PDF Oficial
            </button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <div className="relative w-full max-w-4xl aspect-square md:aspect-video bg-white/5 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors"><X className="w-6 h-6" /></button>
            <Image src={selectedImage} alt="Zoom" fill style={{ objectFit: 'contain' }} unoptimized className="animate-in zoom-in-95 duration-300" />
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform flex items-center gap-2 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <Save className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold">{toast.msg}</span>
      </div>

      {/* HIDDEN PDF TEMPLATE */}
      <PdfTemplate 
        client={client} 
        cart={cart} 
        subtotal={subtotal} 
        discount={discount} 
        total={total} 
        shippingType={shippingType}
        cotNumber={cotNumber}
      />
    </div>
  );
}