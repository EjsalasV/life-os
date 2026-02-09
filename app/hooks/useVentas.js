import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, updateDoc, serverTimestamp, increment, collection, writeBatch } from 'firebase/firestore';

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
    if (!carrito || carrito.length === 0) return;
    if (!posForm?.cuentaId) { setErrorMsg && setErrorMsg("Selecciona cuenta destino"); return; }

    // Creamos el "Superpegamento" (Batch)
    const batch = writeBatch(db);

    try {
      const total = carrito.reduce((a, b) => a + (b.precioVenta * b.cantidad), 0);
      const costo = carrito.reduce((a, b) => a + (b.costo * b.cantidad), 0);
      const reciboId = String(ventas.length + 1).padStart(3, '0');
      
      // Referencia para la nueva venta
      const nuevaVentaRef = doc(collection(db, 'users', user.uid, 'ventas'));
      const ventaId = nuevaVentaRef.id;

      // AÑADIMOS TAREAS AL PAQUETE (Sin usar await todavía)
      
      // Tarea 1: Guardar la venta
      batch.set(nuevaVentaRef, { 
        reciboId, cliente: posForm.cliente || "Final", 
        items: carrito, total, costoTotal: costo, 
        ganancia: total - costo, cuentaId: posForm.cuentaId, 
        timestamp: serverTimestamp() 
      });

      // Tarea 2: Actualizar stock de cada producto
      for (const item of carrito) {
        const prodRef = doc(db, 'users', user.uid, 'productos', item.id);
        batch.update(prodRef, { stock: increment(-item.cantidad) });
      }

      // Tarea 3: Sumar dinero a la cuenta
      const cuentaRef = doc(db, 'users', user.uid, 'cuentas', posForm.cuentaId);
      batch.update(cuentaRef, { monto: increment(total) });

      // Tarea 4: Crear el movimiento financiero
      const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));
      batch.set(movRef, { 
        nombre: `Venta #${reciboId}`, monto: total, tipo: 'INGRESO', 
        categoria: 'trabajo', cuentaId: posForm.cuentaId, 
        cuentaNombre: (cuentas.find(c => c.id === posForm.cuentaId)?.nombre) || 'Caja', 
        ventaRefId: ventaId, timestamp: serverTimestamp() 
      });

      // ¡DISPARAMOS TODO DE GOLPE!
      await batch.commit();

      setCarrito([]); 
      setModalOpen && setModalOpen(null); 
      setPosForm && setPosForm({ cliente: '', cuentaId: '' });
      
    } catch (e) { 
      setErrorMsg && setErrorMsg("Error en la venta: " + e.message); 
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
