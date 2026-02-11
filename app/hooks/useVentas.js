"use client";

import { db } from '@/lib/firebase';
import { 
  doc, 
  collection, 
  writeBatch, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { toCents, fromCents } from '../utils/helpers';

/**
 * HOOK DE VENTAS - EXPERT SAAS EDITION
 * Gestiona transacciones comerciales, inventarios y límites de suscripción.
 * Corrige el error de "Undefined Cuentaid" y asegura visibilidad inmediata en Wallet.
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
    setErrorMsg,
    movimientos 
  } = ctx || {};

  const isPro = user?.plan === 'pro';

  /**
   * Ejecuta el proceso de checkout o actualización de ticket.
   * Valida límites de suscripción y asegura integridad de datos.
   */
  const handleCheckout = async () => {
    if (!user) return;
    
    // 1. VALIDACIÓN DE LÍMITES SAAS (10 ventas/mes para plan FREE)
    if (!isPro && !posForm.id) {
      const ahora = new Date();
      const ventasEsteMes = ventas.filter(v => {
        const fechaVenta = v.timestamp?.toDate ? v.timestamp.toDate() : new Date();
        return fechaVenta.getMonth() === ahora.getMonth() && 
               fechaVenta.getFullYear() === ahora.getFullYear();
      });

      if (ventasEsteMes.length >= 10) {
        setErrorMsg?.("Límite mensual alcanzado (10 ventas). ¡Pásate a PRO para vender sin límites! 🚀", "error");
        return;
      }
    }

    // 2. VALIDACIÓN DE CUENTA (Fix: Evita Undefined Cuentaid)
    if (!posForm?.cuentaId || posForm.cuentaId === "") {
      setErrorMsg?.("Error: Debes seleccionar una cuenta de destino", "error");
      return;
    }

    // 3. VALIDACIÓN DE CARRITO (Solo si no es edición de ticket)
    if (!posForm.id && (!carrito || carrito.length === 0)) {
      setErrorMsg?.("El carrito está vacío", "error");
      return;
    }

    // CIERRE INMEDIATO DEL MODAL PARA UX FLUIDA
    setModalOpen(null);

    const batch = writeBatch(db);
    const docRef = (col, id) => doc(db, 'users', user.uid, col, id);

    try {
      if (posForm.id) {
        // --- MODO EDICIÓN DE TICKET (Función PRO) ---
        if (!isPro) {
          setErrorMsg?.("La edición de tickets es una función PRO 💎", "error");
          return;
        }

        const ventaOriginal = ventas.find(v => v.id === posForm.id);
        const movOriginal = movimientos?.find(m => m.ventaRefId === posForm.id);

        // Si cambió la cuenta de destino, movemos el dinero entre cuentas
        if (ventaOriginal.cuentaId !== posForm.cuentaId) {
          const cuentaViejaRef = docRef('cuentas', ventaOriginal.cuentaId);
          const cuentaNuevaRef = docRef('cuentas', posForm.cuentaId);
          
          batch.update(cuentaViejaRef, { monto: increment(-ventaOriginal.total) });
          batch.update(cuentaNuevaRef, { monto: increment(ventaOriginal.total) });
        }

        // Actualizamos el ticket de venta
        batch.update(docRef('ventas', posForm.id), {
          cliente: posForm.cliente || "Consumidor Final",
          cuentaId: posForm.cuentaId
        });

        // Actualizamos el rastro en la Billetera (Wallet)
        if (movOriginal) {
          batch.update(docRef('movimientos', movOriginal.id), {
            nombre: `Venta Ticket #${ventaOriginal.reciboId} (Editado)`,
            cuentaId: posForm.cuentaId,
            cuentaNombre: cuentas.find(c => c.id === posForm.cuentaId)?.nombre || 'Caja'
          });
        }

        await batch.commit();
        setErrorMsg?.("Ticket actualizado correctamente ✅");

      } else {
        // --- MODO VENTA NUEVA ---
        let totalCents = 0;
        let costoCents = 0;

        for (const item of carrito) {
          totalCents += (toCents(item.precioVenta) * item.cantidad);
          costoCents += (toCents(item.costo || 0) * item.cantidad);
        }

        const totalFinal = fromCents(totalCents);
        const costoFinal = fromCents(costoCents);
        const gananciaFinal = totalFinal - costoFinal;
        const reciboId = String(ventas.length + 1).padStart(4, '0');
        
        const nuevaVentaRef = doc(collection(db, 'users', user.uid, 'ventas'));
        const ventaId = nuevaVentaRef.id;

        // A. Registro del Ticket
        batch.set(nuevaVentaRef, {
          reciboId,
          cliente: posForm.cliente || "Consumidor Final",
          items: carrito,
          total: totalFinal,
          costoTotal: costoFinal,
          ganancia: gananciaFinal,
          cuentaId: posForm.cuentaId,
          timestamp: serverTimestamp()
        });

        // B. Descuento de Stock en Inventario
        for (const item of carrito) {
          const prodRef = docRef('productos', item.id);
          batch.update(prodRef, { 
            stock: increment(-item.cantidad) 
          });
        }

        // C. Aumento de Saldo en la Cuenta (Wallet)
        const cuentaRef = docRef('cuentas', posForm.cuentaId);
        batch.update(cuentaRef, { monto: increment(totalFinal) });

        // D. Creación de Movimiento en Wallet (Visible al instante)
        // Usamos new Date() en lugar de serverTimestamp() para evitar el delay en localhost
        const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));
        batch.set(movRef, {
          nombre: `Venta Ticket #${reciboId}`,
          monto: totalFinal,
          tipo: 'INGRESO',
          categoria: 'trabajo',
          cuentaId: posForm.cuentaId,
          cuentaNombre: cuentas.find(c => c.id === posForm.cuentaId)?.nombre || 'Caja',
          ventaRefId: ventaId,
          timestamp: new Date() 
        });

        await batch.commit();
        
        // Limpieza de estados y carrito
        setCarrito([]);
        setErrorMsg?.(`Venta #${reciboId} exitosa por ${totalFinal.toLocaleString('es-EC', {style:'currency', currency:'USD'})} ✅`);
      }

      // Resetear el formulario de cobro
      setPosForm?.({ cliente: '', cuentaId: '', id: null });

    } catch (e) {
      console.error("CHECKOUT ERROR:", e);
      setErrorMsg?.("No se pudo completar la operación: " + e.message, "error");
    }
  };

  /**
   * Añade productos al carrito validando existencias.
   */
  const addToCart = (producto) => {
    if (!producto || producto.stock <= 0) {
      setErrorMsg?.("Producto sin existencias en inventario 📦", "error");
      return;
    }

    const itemEnCarrito = carrito.find(x => x.id === producto.id);
    
    if (itemEnCarrito) {
      if (itemEnCarrito.cantidad >= producto.stock) {
        setErrorMsg?.("No hay más unidades disponibles", "error");
        return;
      }
      setCarrito(carrito.map(x => 
        x.id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  return { 
    addToCart, 
    handleCheckout 
  };
}