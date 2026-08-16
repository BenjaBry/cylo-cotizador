'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import productosData from '@/data/productos.json';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [productos, setProductos] = useState<any[]>([]);
  const [cart, setCart] = useState<{producto: any, cantidad: number}[]>([]);
  const [search, setSearch] = useState('');

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

  const getCloudinaryUrl = (codigo: string) => {
    // Basic mapping, assuming image names might match codes. 
    // The user needs to rename Cloudinary images to match the codes (e.g., acc-abre-0001.png)
    const formattedCode = codigo.toLowerCase().replace(/-/g, '_');
    return `https://res.cloudinary.com/dhew6sfwc/image/upload/v1/${formattedCode}.png`;
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">CYLO Guatemala</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña de Acceso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa la contraseña"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ingresar
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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cotizador CYLO</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-500 hover:text-gray-700">Salir</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Buscar por nombre o código..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.slice(0, 50).map((p, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="relative w-full h-48 bg-gray-100 rounded-md mb-4 overflow-hidden">
                  <Image 
                    src={getCloudinaryUrl(p.codigo)} 
                    alt={p.producto || 'Producto CYLO'} 
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized={true}
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{p.producto}</h3>
                <p className="text-xs text-gray-500 mb-2">Código: {p.codigo}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-bold text-blue-600">Q{p.precio_unitario?.toFixed(2)}</span>
                  <button 
                    onClick={() => setCart([...cart, {producto: p, cantidad: 1}])}
                    className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">Cotización Actual</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay productos agregados.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                  <div className="flex-1 truncate pr-2">
                    <p className="font-medium truncate">{item.producto.producto}</p>
                    <p className="text-gray-500">Q{item.producto.precio_unitario?.toFixed(2)} x {item.cantidad}</p>
                  </div>
                  <div className="font-bold">
                    Q{(item.producto.precio_unitario * item.cantidad).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>Q{cart.reduce((sum, item) => sum + (item.producto.precio_unitario * item.cantidad), 0).toFixed(2)}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white font-bold py-2 rounded shadow hover:bg-green-700">
                Generar PDF (Próximamente)
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
