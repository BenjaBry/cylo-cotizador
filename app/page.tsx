'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Plus, Trash2, FileDown, LogOut, Package, X } from 'lucide-react';
import productosData from '@/data/productos.json';
import { generatePDF } from '@/utils/generatePDF';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [productos, setProductos] = useState<any[]>([]);
  const [cart, setCart] = useState<{producto: any, cantidad: number}[]>([]);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Client Info State
  const [client, setClient] = useState({
    name: '',
    nit: '',
    address: '',
    deliveryTime: ''
  });

  useEffect(() => {
    setProductos(productosData);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CYLO2026') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const getCloudinaryUrl = (codigo: string, producto: string) => {
    const formattedCode = codigo.toLowerCase().replace(/-/g, '_');
    const formattedName = producto.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '_') // replace spaces and special chars
      .replace(/^_|_$/g, '');
    
    // The user's image URL used .jpg. 
    return `https://res.cloudinary.com/dhew6sfwc/image/upload/v1/${formattedCode}_${formattedName}.jpg`;
  };

  const addToCart = (producto: any) => {
    const existing = cart.find(item => item.producto.codigo === producto.codigo);
    if (existing) {
      setCart(cart.map(item => 
        item.producto.codigo === producto.codigo 
          ? { ...item, cantidad: item.cantidad + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { producto, cantidad: 1 }]);
    }
  };

  const removeFromCart = (codigo: string) => {
    setCart(cart.filter(item => item.producto.codigo !== codigo));
  };

  const updateQuantity = (codigo: string, qty: number) => {
    if (qty <= 0) return;
    setCart(cart.map(item => 
      item.producto.codigo === codigo ? { ...item, cantidad: qty } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + ((item.producto.precio_unitario || 0) * item.cantidad), 0);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md border-t-4 border-blue-900">
          <div className="flex flex-col items-center mb-8">
            <Package className="w-12 h-12 text-blue-900 mb-2" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CYLO Guatemala</h1>
            <p className="text-sm text-gray-500">Cotizador ERP Corporativo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Clave de Acceso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                placeholder="Ingresa la contraseña"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-md transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  const filteredProducts = productos.filter(p => 
    (p.producto && p.producto.toLowerCase().includes(search.toLowerCase())) || 
    (p.codigo && p.codigo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header Corporativo */}
      <header className="bg-[#1E293B] text-white shadow-md z-10 relative">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold tracking-wide">CYLO <span className="font-light">Cotizador ERP</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Admin</span>
            <button onClick={() => setIsAuthenticated(false)} className="text-gray-300 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Columna Izquierda: Tabla de Datos */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
          
          {/* Barra de Búsqueda */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar producto por SKU o descripción..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-900 font-semibold text-sm rounded border border-blue-100 flex items-center">
              {filteredProducts.length} Resultados
            </div>
          </div>

          {/* DataGrid (Tabla) */}
          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F1F5F9] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 w-16 text-center">Img</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 w-32">Código SKU</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Descripción de Producto</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 w-32 text-right">Precio U.</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 w-24 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.slice(0, 100).map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-4 py-2">
                      <div 
                        className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden relative cursor-pointer"
                        onClick={() => setSelectedImage(getCloudinaryUrl(p.codigo, p.producto))}
                      >
                        <Image 
                          src={getCloudinaryUrl(p.codigo, p.producto)} 
                          alt="IMG" 
                          fill
                          style={{ objectFit: 'contain' }}
                          unoptimized={true}
                          className="opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.codigo}</td>
                    <td className="px-4 py-3 text-gray-900 whitespace-normal min-w-[250px]">{p.producto}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 text-right">Q{(p.precio_unitario || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => addToCart(p)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-all"
                        title="Agregar"
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

        {/* Columna Derecha: Panel de Cotización */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          
          {/* Ficha del Cliente */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Datos del Cliente</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1">Nombre / Razón Social</label>
                <input type="text" value={client.name} onChange={e => setClient({...client, name: e.target.value})} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-900 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1">NIT</label>
                <input type="text" value={client.nit} onChange={e => setClient({...client, nit: e.target.value})} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-900 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1">Dirección de Entrega</label>
                <input type="text" value={client.address} onChange={e => setClient({...client, address: e.target.value})} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-900 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1">Tiempo de Entrega</label>
                <input type="text" placeholder="Ej. Inmediato, 2-3 días hábiles" value={client.deliveryTime} onChange={e => setClient({...client, deliveryTime: e.target.value})} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-900 outline-none" />
              </div>
            </div>
          </div>

          {/* Resumen de Cotización */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-0 flex flex-col flex-1 h-[calc(100vh-28rem)]">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Líneas de Cotización</h2>
            </div>
            
            <div className="flex-1 overflow-auto p-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <Package className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Agregue productos desde la tabla para cotizar.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex gap-3 p-3 bg-white border rounded hover:border-blue-300 transition-colors text-sm relative group">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate" title={item.producto.producto}>{item.producto.producto}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.producto.codigo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <input 
                            type="number" 
                            min="1" 
                            value={item.cantidad} 
                            onChange={(e) => updateQuantity(item.producto.codigo, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 text-center border rounded text-xs bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-500">x Q{(item.producto.precio_unitario || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="font-bold text-gray-900">Q{((item.producto.precio_unitario || 0) * item.cantidad).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.producto.codigo)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-5 border-t bg-[#F8FAFC] rounded-b-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">Subtotal</span>
                <span className="font-semibold">Q{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-sm">Impuestos</span>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Incluidos</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-3 mb-5">
                <span className="text-lg font-bold text-gray-900">TOTAL</span>
                <span className="text-2xl font-black text-[#1E293B]">Q{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => generatePDF(client, cart, total)}
                disabled={cart.length === 0}
                className="w-full py-3 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FileDown className="w-5 h-5" />
                <span>Generar Documento PDF</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full p-4 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-2xl">
              <Image 
                src={selectedImage}
                alt="Vista Ampliada"
                fill
                style={{ objectFit: 'contain' }}
                unoptimized={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}