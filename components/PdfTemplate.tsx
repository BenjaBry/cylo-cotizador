import React from 'react';

interface PdfTemplateProps {
  client: any;
  cart: any[];
  subtotal: number;
  discount: number;
  total: number;
  shippingType: 'ciudad' | 'interior';
  cotNumber: string;
}

export const PdfTemplate: React.FC<PdfTemplateProps> = ({ client, cart, subtotal, discount, total, shippingType, cotNumber }) => {
  const getCloudinaryUrl = (codigo: string, producto: string) => {
    const formattedCode = codigo.toLowerCase().replace(/-/g, '_');
    const formattedName = producto.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    return `https://res.cloudinary.com/dhew6sfwc/image/upload/v1/${formattedCode}_${formattedName}.jpg`;
  };

  return (
    <div id="pdf-template" className="flex flex-col gap-8">
      {/* SECCIÓN 1: COTIZACIÓN PRINCIPAL */}
      <div className="pdf-section w-[794px] min-h-[1123px] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* HEADER CORPORATIVO PREMIUM */}
        <div className="bg-slate-900 text-white px-10 py-8 relative">
          <div className="absolute top-0 right-0 w-64 h-full bg-indigo-600 opacity-20 transform skew-x-12 translate-x-10"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h1 className="text-5xl font-black tracking-tighter mb-1">CYLO</h1>
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-indigo-300">UN ENFOQUE ECOLÓGICO</h2>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-light text-slate-300 tracking-wider">COTIZACIÓN</h3>
              <p className="font-mono font-bold text-indigo-400 mt-1">{cotNumber}</p>
            </div>
          </div>
        </div>

        {/* METADATOS DEL CLIENTE */}
        <div className="px-10 py-6 bg-slate-50 border-b border-slate-200 flex justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Preparado para</p>
            <p className="font-bold text-slate-900 text-lg">{client.name || 'Cliente de Mostrador'}</p>
            {client.address && <p className="text-xs text-slate-600">{client.address}</p>}
            <p className="text-xs text-slate-600 font-mono">NIT: {client.nit || 'C/F'}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Detalles</p>
            <p className="text-xs text-slate-600"><span className="font-semibold text-slate-900">Fecha:</span> {new Date().toLocaleDateString('es-GT')}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold text-slate-900">Asesor:</span> CYLO GUATEMALA</p>
            <p className="text-xs text-slate-600"><span className="font-semibold text-slate-900">Entrega:</span> {client.deliveryTime || 'Inmediato'}</p>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS (Flex-grow para empujar el footer) */}
        <div className="px-10 py-8 flex-grow">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-slate-900 text-xs uppercase tracking-wider text-slate-900">
                <th className="py-3 px-2 font-black w-[15%]">SKU</th>
                <th className="py-3 px-2 font-black w-[45%]">Producto</th>
                <th className="py-3 px-2 text-center font-black w-[10%]">Cant.</th>
                <th className="py-3 px-2 text-right font-black w-[15%]">Precio</th>
                <th className="py-3 px-2 text-right font-black w-[15%]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-2 font-mono text-xs text-slate-500">{item.producto.codigo}</td>
                  <td className="py-4 px-2 font-semibold text-slate-800 text-xs pr-4">{item.producto.producto}</td>
                  <td className="py-4 px-2 text-center font-medium text-slate-700">{item.cantidad}</td>
                  <td className="py-4 px-2 text-right text-slate-600">Q{item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right font-bold text-slate-900">Q{(item.unitPrice * item.cantidad).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALES */}
          <div className="flex justify-end mt-6">
            <div className="w-[280px] bg-slate-50 p-4 rounded-xl border border-slate-200">
              {discount > 0 && (
                <>
                  <div className="flex justify-between py-1 text-xs">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">Q{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-emerald-600">
                    <span className="font-bold">Descuento</span>
                    <span className="font-bold">- Q{discount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-3 mt-2 border-t border-slate-300 text-lg font-black text-slate-900">
                <span>TOTAL</span>
                <span>Q{total.toFixed(2)}</span>
              </div>
              <p className="text-[9px] text-right text-slate-400 mt-1 uppercase">* Impuestos incluidos</p>
            </div>
          </div>
        </div>
               {/* PIE DE PÁGINA DE LA COTIZACIÓN (Siempre al fondo) */}
        <div className="mt-auto">
          {/* CONDICIONES Y PAGOS */}
          <div className="bg-slate-900 text-white px-10 py-6 grid grid-cols-2 gap-8 text-[10px]">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-indigo-400 mb-2">Términos y Beneficios</h4>
              <ul className="space-y-1 text-slate-300 opacity-90 list-disc list-inside">
                <li>Envío sin costo adicional.</li>
                <li>Entrega de 24 a 72 horas.</li>
                <li>Envío EXPRESS en Ciudad Capital.</li>
                <li>Asistencia y monitoreo de pedido.</li>
                <li className="text-yellow-400 mt-2 italic list-none">Pedido en ruta posterior a pago.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-indigo-400 mb-2">Métodos de Pago</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-300 opacity-90">
                <div>
                  <p className="font-bold text-white">Bco. Industrial</p>
                  <p>7173380515 (Mon)</p>
                </div>
                <div>
                  <p className="font-bold text-white">BAC Credomatic</p>
                  <p>972581508 (Aho)</p>
                </div>
                <div>
                  <p className="font-bold text-white">Banrural</p>
                  <p>3541017532 (Mon)</p>
                </div>
                <div>
                  <p className="font-bold text-white">Tarjeta Vía Link</p>
                  <p>Zigi o Recurrente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ANEXO VISUAL (En página separada) */}
      {cart.length > 0 && (
        <div className="pdf-section w-[794px] min-h-[1123px] bg-white text-slate-800 font-sans mx-auto shadow-2xl flex flex-col relative overflow-hidden">
          {/* HEADER DEL ANEXO */}
          <div className="bg-slate-900 text-white px-10 py-8 relative">
            <div className="absolute top-0 right-0 w-64 h-full bg-indigo-600 opacity-20 transform skew-x-12 translate-x-10"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-4xl font-black tracking-tighter mb-1">ANEXO VISUAL</h3>
                <h4 className="text-[10px] font-bold tracking-[0.3em] text-indigo-300">CATÁLOGO DE PRODUCTOS COTIZADOS</h4>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-indigo-400 mt-1">{cotNumber}</p>
              </div>
            </div>
          </div>

          {/* GRID DE IMÁGENES GRANDES */}
          <div className="px-10 py-10 flex-grow">
            <div className="grid grid-cols-2 gap-x-10 gap-y-12">
              {cart.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="h-56 w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-center mb-4 relative">
                    <img src={getCloudinaryUrl(item.producto.codigo, item.producto.producto)} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" crossOrigin="anonymous" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 text-center uppercase tracking-wide leading-snug">{item.producto.producto}</p>
                  <p className="text-xs font-mono text-slate-500 mt-2">{item.producto.codigo}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto bg-slate-900 h-6 w-full"></div>
        </div>
      )}
    </div>
  );
};
