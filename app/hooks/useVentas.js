import { db } from '@/lib/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment } from 'firebase/firestore';

export default function useVentas(ctx) {
  const { user, productos, carrito, setCarrito, ventas, cuentas, posForm, setPosForm, setModalOpen, setErrorMsg } = ctx || {};

  const addToCart = (p) => {
    if (!p) return;
    if (p.stock <= 0) { alert("¡Sin stock!"); return; }
    const ex = carrito.find(x => x.id === p.id);
    if (ex) {
      if (ex.cantidad >= p.stock) { alert("Stock insuficiente"); return; }
      setCarrito(carrito.map(x => x.id === p.id ? { ...x, cantidad: x.cantidad + 1 } : x));
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
  };

  const handleCheckout = async () => {
    // SEMÁFORO 1: ¿Carrito vacío?
    if (!carrito || carrito.length === 0) {
      setErrorMsg && setErrorMsg("¡Oye! No puedes cobrar un carrito vacío 🛒");
      return; 
    }
    
    // SEMÁFORO 2: ¿Falta la cuenta?
    if (!posForm?.cuentaId) { 
      setErrorMsg && setErrorMsg("Dime a qué cuenta va el dinero 💰"); 
      return; 
    }

    const batch = writeBatch(db); // ... el resto del código del batch sigue igual; // Preparamos el superpegamento

    try {
      const total = carrito.reduce((a, b) => a + (b.precioVenta * b.cantidad), 0);
      const costo = carrito.reduce((a, b) => a + (b.costo * b.cantidad), 0);
      const reciboId = String(ventas.length + 1).padStart(3, '0');
      
      const nuevaVentaRef = doc(collection(db, 'users', user.uid, 'ventas'));
      const ventaId = nuevaVentaRef.id;

      // 1. Registrar la venta
      batch.set(nuevaVentaRef, { 
        reciboId, cliente: posForm.cliente || "Final", items: carrito, 
        total, costoTotal: costo, ganancia: total - costo, 
        cuentaId: posForm.cuentaId, timestamp: serverTimestamp() 
      });

      // 2. Descontar stock de cada producto
      for (const item of carrito) {
        const prodRef = doc(db, 'users', user.uid, 'productos', item.id);
        batch.update(prodRef, { stock: increment(-item.cantidad) });
      }

      // 3. Sumar dinero a la cuenta seleccionada
      const cuentaRef = doc(db, 'users', user.uid, 'cuentas', posForm.cuentaId);
      batch.update(cuentaRef, { monto: increment(total) });

      // 4. Crear el movimiento en el historial
      const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));
      batch.set(movRef, { 
        nombre: `Venta #${reciboId}`, monto: total, tipo: 'INGRESO', 
        categoria: 'trabajo', cuentaId: posForm.cuentaId, 
        cuentaNombre: (cuentas.find(c => c.id === posForm.cuentaId)?.nombre) || 'Caja', 
        ventaRefId: ventaId, timestamp: serverTimestamp() 
      });

      // ¡Mandamos todo junto!
      await batch.commit();

      setCarrito([]); 
      setModalOpen && setModalOpen(null); 
      setPosForm && setPosForm({ cliente: '', cuentaId: '' });
    } catch (e) { 
      setErrorMsg && setErrorMsg("Error: " + e.message); 
    }
  };

  const handleGenerarPedido = () => {
    const faltantes = productos.filter(p => p.stock <= 5);
    if (faltantes.length === 0) { alert("Todo OK"); return; }
    try {
      if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(`PEDIDO:\n` + faltantes.map(p => `- ${p.nombre} (${p.stock})`).join('\n'));
      alert("Copiado al portapapeles.");
    } catch (e) { alert('Error copiando: ' + e.message); }
  };

  return { addToCart, handleCheckout, handleGenerarPedido };
}