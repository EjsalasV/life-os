import { db } from '@/lib/firebase';
import { 
  doc, 
  collection, 
  writeBatch, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';

/**
 * HOOK DE VENTAS - LÓGICA DE NEGOCIO EXPERTA
 * Maneja carrito, transacciones atómicas (Batch) y comunicación con el usuario.
 */
export default function useVentas(ctx) {
  const { 
    user, 
    productos, 
    carrito, 
    setCarrito, 
    ventas, 
    cuentas, 
    posForm, 
    setPosForm, 
    setModalOpen, 
    setErrorMsg 
  } = ctx || {};

  // --- SISTEMA DE NOTIFICACIONES NATIVAS ---
  
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error("Error al solicitar permisos de notificación:", e);
      }
    }
  };

  const sendLocalNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/window.svg', // Asegúrate de que este icono exista en public/
        tag: 'stock-alert'
      });
    }
  };

  // --- LÓGICA DEL CARRITO ---

  const addToCart = (producto) => {
    if (!producto) return;

    // Validación de Stock antes de agregar
    if (producto.stock <= 0) {
      setErrorMsg?.("¡Sin stock disponible! 📦", "error");
      return;
    }

    const itemEnCarrito = carrito.find(x => x.id === producto.id);
    
    if (itemEnCarrito) {
      if (itemEnCarrito.cantidad >= producto.stock) {
        setErrorMsg?.("No puedes agregar más de lo que hay en stock", "error");
        return;
      }
      setCarrito(carrito.map(x => 
        x.id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // --- TRANSACCIÓN DE VENTA (BATCH) ---

  const handleCheckout = async () => {
    if (!user) return;
    
    // Validaciones de seguridad
    if (!carrito || carrito.length === 0) {
      setErrorMsg?.("El carrito está vacío", "error");
      return;
    }
    
    if (!posForm?.cuentaId) {
      setErrorMsg?.("Selecciona una cuenta para recibir el pago", "error");
      return;
    }

    const batch = writeBatch(db);
    
    try {
      const totalVenta = carrito.reduce((a, b) => a + (b.precioVenta * b.cantidad), 0);
      const costoVenta = carrito.reduce((a, b) => a + (b.costo * b.cantidad), 0);
      const reciboId = String(ventas.length + 1).padStart(4, '0');
      
      const nuevaVentaRef = doc(collection(db, 'users', user.uid, 'ventas'));
      const ventaId = nuevaVentaRef.id;

      // 1. Registro de la Venta
      batch.set(nuevaVentaRef, {
        reciboId,
        cliente: posForm.cliente || "Consumidor Final",
        items: carrito,
        total: totalVenta,
        costoTotal: costoVenta,
        ganancia: totalVenta - costoVenta,
        cuentaId: posForm.cuentaId,
        timestamp: serverTimestamp()
      });

      // 2. Actualización de Inventario y Alertas de Stock
      for (const item of carrito) {
        const prodRef = doc(db, 'users', user.uid, 'productos', item.id);
        batch.update(prodRef, { stock: increment(-item.cantidad) });
        
        // Verificación de stock bajo para notificación post-batch
        const stockResultante = item.stock - item.cantidad;
        if (stockResultante <= 0) {
          setTimeout(() => sendLocalNotification("🚨 Stock Agotado", `${item.nombre} se ha terminado.`), 1000);
        } else if (stockResultante <= 5) {
          setTimeout(() => sendLocalNotification("⚠️ Stock Bajo", `${item.nombre} tiene pocas unidades (${stockResultante}).`), 1000);
        }
      }

      // 3. Incremento en Cuenta Bancaria/Caja
      const cuentaRef = doc(db, 'users', user.uid, 'cuentas', posForm.cuentaId);
      batch.update(cuentaRef, { monto: increment(totalVenta) });

      // 4. Generación automática de Movimiento Financiero
      const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));
      batch.set(movRef, {
        nombre: `Venta #${reciboId}`,
        monto: totalVenta,
        tipo: 'INGRESO',
        categoria: 'trabajo',
        cuentaId: posForm.cuentaId,
        cuentaNombre: cuentas.find(c => c.id === posForm.cuentaId)?.nombre || 'Caja',
        ventaRefId: ventaId,
        timestamp: serverTimestamp()
      });

      // Ejecución Atómica
      await batch.commit();

      // Limpieza de interfaz
      setCarrito([]);
      setPosForm?.({ cliente: '', cuentaId: '' });
      setModalOpen?.(null);
      setErrorMsg?.(`Venta #${reciboId} realizada con éxito ✅`);

    } catch (e) {
      console.error("Error en checkout:", e);
      setErrorMsg?.("Error crítico en la venta: " + e.message, "error");
    }
  };

  // --- SEGURIDAD DEL PORTAPAPELES (CLIPBOARD) ---

  const handleGenerarPedido = async () => {
    const faltantes = productos.filter(p => p.stock <= 5);
    
    if (faltantes.length === 0) {
      setErrorMsg?.("El inventario está saludable ✅");
      return;
    }

    const textoPedido = `📋 *PEDIDO DE REPOSICIÓN - LIFE OS*\n` + 
      faltantes.map(p => `- ${p.nombre} (Stock actual: ${p.stock})`).join('\n') +
      ` \nFecha: ${new Date().toLocaleDateString()}`;

    try {
      // Verificación de compatibilidad con el navegador
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textoPedido);
        setErrorMsg?.("Lista de pedido copiada al portapapeles 📋");
      } else {
        throw new Error("El navegador no soporta copiado automático");
      }
    } catch (e) {
      console.error("Error al copiar:", e);
      // Fallback: Mostrar en consola para que el usuario pueda copiarlo manualmente si falla
      console.log("PEDIDO MANUAL:", textoPedido);
      setErrorMsg?.("No se pudo copiar automáticamente. Revisa la consola.", "error");
    }
  };

  return { 
    addToCart, 
    handleCheckout, 
    handleGenerarPedido, 
    requestNotificationPermission 
  };
}