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
    <div id="pdf-template" className="hidden">
      {/* Contenedor fluido sin altura mínima forzada para evitar espacios en blanco enormes */}
      <div className="w-[794px] bg-white text-gray-900 font-sans mx-auto shadow-2xl pb-10">
        
        {/* HEADER */}
        <div className="bg-[#0B132B] text-white flex justify-between items-center px-8 py-6 h-[100px]">
          <h1 className="text-5xl font-black tracking-tighter">CYLO</h1>
          <h2 className="text-sm font-semibold tracking-[0.2em] opacity-90">UN ENFOQUE ECOLÓGICO</h2>
          <div className="text-right">
            <h1 className="text-3xl font-black text-blue-300 opacity-50">CYLO</h1>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div className="px-8 mt-8">
          <div className="flex justify-between items-end border-b-2 border-red-600 pb-2 mb-4">
            <h3 className="text-lg font-bold text-[#b83f12]">COTIZACIÓN POR COMPRA DE INSUMOS</h3>
            <span className="font-bold text-[#b83f12]">{cotNumber}</span>
          </div>

          <div className="grid grid-cols-1 gap-y-2 text-xs">
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">Dirigido a:</span><span className="font-bold">{client.name || 'Cliente de Mostrador'}</span></div>
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">Con dirección a:</span><span className="font-bold">{client.address || 'N/A'}</span></div>
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">NIT:</span><span className="font-bold">{client.nit || 'C/F'}</span></div>
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">Descripción de línea:</span><span className="font-bold">Insumos para alimentos / Lisos.</span></div>
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">Asesor:</span><span className="font-bold">CYLO GUATEMALA</span></div>
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">Teléfono:</span><span className="font-bold">+502 4054 5591</span></div>
            <div className="flex border-b border-gray-200 pb-1"><span className="w-40 text-gray-500">Tiempo de entrega:</span><span className="font-bold">{client.deliveryTime || 'Inmediato'}</span></div>
          </div>
        </div>

        {/* TABLE */}
        <div className="px-8 mt-8">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-md font-bold text-[#b83f12]">DETALLES</h3>
            <span className="text-xs text-gray-500">*Precios incluyen impuestos</span>
          </div>
          
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-y-2 border-[#0B132B] bg-gray-50">
                <th className="py-3 px-3 w-[15%] font-black text-[#0B132B]">MODELO</th>
                <th className="py-3 px-3 w-[35%] font-black text-[#0B132B]">PRODUCTO</th>
                <th className="py-3 px-3 text-center w-[10%] font-black text-[#0B132B]">CANTIDAD</th>
                <th className="py-3 px-3 text-right w-[15%] font-black text-[#0B132B]">PRECIO UNIT</th>
                <th className="py-3 px-3 text-right w-[15%] font-black text-[#0B132B]">SUBTOTAL</th>
                <th className="py-3 px-3 text-center w-[10%] font-black text-[#0B132B]">NOTA</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50">
                  <td className="py-4 px-3 font-mono font-bold text-gray-700">{item.producto.codigo}</td>
                  <td className="py-4 px-3 font-semibold text-gray-900">{item.producto.producto}</td>
                  <td className="py-4 px-3 text-center font-medium">{item.cantidad}</td>
                  <td className="py-4 px-3 text-right font-medium">Q{item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 px-3 text-right font-medium">Q{(item.unitPrice * item.cantidad).toFixed(2)}</td>
                  <td className="py-4 px-3 text-center text-red-600 font-bold text-[11px]">N/A</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="flex justify-end mt-4">
            <div className="w-[300px]">
              {discount > 0 && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                    <span className="text-gray-500 font-medium">Subtotal (Precio Base)</span>
                    <span className="font-semibold">Q{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 text-sm text-green-600">
                    <span className="font-bold">Descuento</span>
                    <span className="font-bold">- Q{discount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-3 border-y-2 border-[#0B132B] text-lg font-black mt-2">
                <span>TOTAL</span>
                <span>Q{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ALERTS */}
          <div className="mt-8">
            <p className="text-[9px] text-gray-500 italic mb-2 text-justify">
              NOTA: DE REQUERIR UN MODELO O EMPAQUE ESPECÍFICO, PUEDE NOTIFICAR: CANTIDAD REQUERIDA MENSUALMENTE, DETALLES DE DIMENSIONES, PERSONALIZACIÓN GRÁFICA (LOGO EN EL EMPAQUE), MATERIAL EN EL QUE DESEE EL EMPAQUE Y COLOR DEL EMPAQUE.
            </p>
            <div className="bg-[#F5A623] text-black text-[10px] font-bold p-3 text-center border-l-4 border-red-600">
              <p>BENEFICIOS: ENVÍO SIN COSTO ADICIONAL, ASISTENCIA Y MONITOREO DE SU PEDIDO.</p>
              <p>Y ENVÍO EN 24 A 72 HORAS HASTA LA PUERTA DE SU RESIDENCIA/EMPRESA. ENVÍO EXPRESS SIN COSTOS ADICIONALES DENTRO DEL PERÍMETRO DE LA CIUDAD CAPITAL.</p>
              <p className="text-red-800 mt-1 uppercase">Pedido puesto en ruta posterior a la validación de su pago.</p>
            </div>
          </div>
        </div>
        
        {/* IMAGES AND PAYMENT METHODS - FLOWING NATURALLY */}
        <div className="pt-12 px-8">
          <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 mb-4">ANEXO (Fotografías)</h3>
          <div className="grid grid-cols-3 gap-6">
            {cart.map((item, idx) => (
              <div key={idx} className="border border-gray-200 p-2 flex flex-col items-center">
                <div className="h-32 w-full flex items-center justify-center relative mb-2">
                  <img src={getCloudinaryUrl(item.producto.codigo, item.producto.producto)} alt="" className="max-h-full max-w-full object-contain" crossOrigin="anonymous" />
                </div>
                <p className="text-[10px] font-bold text-center w-full truncate">{item.producto.codigo}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 mt-12 mb-4">MÉTODOS DE PAGO</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            
            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <h4 className="font-black text-blue-900 mb-2">BANCO INDUSTRIAL</h4>
              <p><span className="font-bold">Cuenta:</span> 7173380515 (Monetaria)</p>
              <p><span className="font-bold">Nombre:</span> BRYAN BENJAMIN ORDOÑEZ</p>
            </div>
            
            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <h4 className="font-black text-red-600 mb-2">BAC CREDOMATIC</h4>
              <p><span className="font-bold">Cuenta:</span> 972581508 (Ahorro)</p>
              <p><span className="font-bold">Nombre:</span> BRYAN BENJAMIN ORDOÑEZ CHACON</p>
            </div>

            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <h4 className="font-black text-green-700 mb-2">BANRURAL</h4>
              <p><span className="font-bold">Cuenta:</span> 3541017532 (Monetaria)</p>
              <p><span className="font-bold">Nombre:</span> RAMIRO ENRIQUE ORDOÑEZ MELENDEZ</p>
            </div>

            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <h4 className="font-black text-orange-600 mb-2">TARJETA DE CRÉDITO / DÉBITO</h4>
              <p className="font-bold">Vía link de pago ZIGI o Recurrente.</p>
              <p className="italic text-gray-500 mt-1">*Solicitar link al vendedor.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
