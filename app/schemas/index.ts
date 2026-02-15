// app/schemas/index.ts
import { z } from 'zod';

// ==================== FINANZAS SCHEMAS ====================

export const movimientoSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(200, 'El nombre es demasiado largo'),
    monto: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'El monto debe ser un número positivo'
        }),
    tipo: z.enum(['INGRESO', 'GASTO', 'TRANSFERENCIA']),
    cuentaId: z.string().min(1, 'Selecciona una cuenta'),
    cuentaDestinoId: z.string().optional(),
    categoria: z.enum([
        'comida',
        'transporte',
        'entretenimiento',
        'salud',
        'educacion',
        'servicios',
        'otros'
    ])
}).refine((data) => {
    // Si es transferencia, debe tener cuenta destino
    if (data.tipo === 'TRANSFERENCIA') {
        return !!data.cuentaDestinoId;
    }
    return true;
}, {
    message: 'Las transferencias requieren una cuenta destino',
    path: ['cuentaDestinoId']
});

export const cuentaSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre es demasiado largo'),
    monto: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'El monto debe ser un número válido'
        })
});

export const fijoSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre es demasiado largo'),
    monto: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'El monto debe ser un número positivo'
        }),
    periodicidad: z.enum(['Mensual', 'Semanal', 'Anual']),
    diaCobro: z.string()
        .refine((val) => {
            const num = parseInt(val);
            return !isNaN(num) && num >= 1 && num <= 31;
        }, {
            message: 'El día debe estar entre 1 y 31'
        })
});

export const metaSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre es demasiado largo'),
    montoObjetivo: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'El monto objetivo debe ser positivo'
        }),
    montoActual: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'El monto actual debe ser válido'
        })
        .optional()
});

export const presupuestoSchema = z.object({
    categoria: z.enum([
        'comida',
        'transporte',
        'entretenimiento',
        'salud',
        'educacion',
        'servicios',
        'otros'
    ]),
    limite: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'El límite debe ser un número positivo'
        })
});

// ==================== VENTAS SCHEMAS ====================

export const productoSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre es demasiado largo'),
    precioVenta: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'El precio de venta debe ser positivo'
        }),
    costo: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'El costo debe ser un número válido'
        }),
    stock: z.string()
        .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
            message: 'El stock debe ser un número entero positivo'
        })
}).refine((data) => {
    // El precio de venta debe ser mayor que el costo
    const precio = parseFloat(data.precioVenta);
    const costo = parseFloat(data.costo);
    return precio >= costo;
}, {
    message: 'El precio de venta debe ser mayor o igual al costo',
    path: ['precioVenta']
});

export const ventaSchema = z.object({
    cliente: z.string()
        .min(1, 'El nombre del cliente es requerido')
        .max(100, 'El nombre es demasiado largo'),
    cuentaId: z.string().min(1, 'Selecciona una cuenta'),
    items: z.array(z.object({
        id: z.string(),
        nombre: z.string(),
        cantidad: z.number().positive(),
        precioUnitario: z.number().positive(),
        subtotal: z.number().positive()
    })).min(1, 'Agrega al menos un producto al carrito')
});

// ==================== SALUD SCHEMAS ====================

export const habitoSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre es demasiado largo'),
    frecuencia: z.enum(['Diario', 'Semanal', 'Mensual']),
    iconType: z.string().optional()
});

export const pesoSchema = z.object({
    peso: z.string()
        .refine((val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0 && num < 500;
        }, {
            message: 'El peso debe estar entre 0 y 500 kg'
        })
});

export const saludDiariaSchema = z.object({
    bateria: z.number().min(0).max(100),
    agua: z.number().min(0).max(20),
    animo: z.enum(['mal', 'normal', 'genial']).optional(),
    ejercicioMinutos: z.number().min(0).max(300).optional()
});

// ==================== HELPER FUNCTIONS ====================

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: Record<string, string> };

export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};

    // Fix: Check if errors array exists
    if (result.error && result.error.errors) {
        result.error.errors.forEach((err) => {
            const path = err.path.join('.') || 'general';
            errors[path] = err.message;
        });
    }

    return { success: false, errors };
}

// Export all schemas as a group
export const schemas = {
    movimiento: movimientoSchema,
    cuenta: cuentaSchema,
    fijo: fijoSchema,
    meta: metaSchema,
    presupuesto: presupuestoSchema,
    producto: productoSchema,
    venta: ventaSchema,
    habito: habitoSchema,
    peso: pesoSchema,
    saludDiaria: saludDiariaSchema
};
