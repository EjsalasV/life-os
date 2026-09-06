# Life OS — validación para uso personal

Revisión inicial local: 6 de septiembre de 2026. Posteriormente se publicó y probó en producción con una cuenta separada; ver [DEPLOYMENT.md](DEPLOYMENT.md). Los límites de teléfono y almacenamiento local siguen vigentes.

## Correcciones principales

- Cobros atómicos con comprobantes privados persistentes, tanto para éxito como para rechazo definitivo. Un reintento conserva el mismo resultado aunque se haya anulado la venta.
- Edición y anulación calculadas con documentos actuales; reversión única de saldo y stock, movimientos vinculados buscados fuera del mes visible.
- Importes validados en centavos; cantidades enteras; protección de fondos, cuentas con historial, metas con ahorro y formularios de stock desactualizados.
- Lecturas mensuales sin truncamiento silencioso; cierre del presupuesto con gastos del mes correspondiente.
- Salud y mascota actualizadas con transacciones; lectura sin sobrescribir registros; cambio del día local; formularios conservados ante errores.
- Recetas favoritas, refrigerador, habitación y límites locales por usuario; los datos locales inválidos se conservan y se muestra error.
- Estado inicial de carga, errores de perfil recuperables, recuperación de eliminación pendiente y diálogos con foco y bloqueo durante guardado.
- Formularios y navegación adaptados a móvil. Comunidad identifica explícitamente su contenido de muestra.

## Evidencia

- TypeScript sin errores.
- Lint sin errores; dos advertencias existentes de actualización de estado en efectos (tema y herramienta de ayuno).
- 78 pruebas unitarias en 9 archivos.
- 21 pruebas con emulador Firestore en 2 archivos: reglas entre usuarios, transacciones concurrentes, reintentos, rechazo persistente, cancelación, protección de ahorro/stock e historial mensual.
- Compilación de producción validada con `npm run build`.
- Navegador conectado únicamente a Auth y Firestore locales, proyecto `demo-life-os`.
- Cuenta inicial 100; gasto editado de 12.35 a 15.25: saldo 84.75. Venta de 2.50 con respuesta de red perdida: una venta, saldo 87.25 y stock 4. Anulación: stock 5.
- Validación de perfil físico con peso cero, finalización válida y registro de agua persistente tras recargar.
- Inventario y modal de cobro sin desbordamiento horizontal a 320, 375, 390 y 430 px; altura reducida a 550 px para verificar scroll del modal. Esto no sustituye una prueba con teclado real de teléfono.
- Recuperación de una eliminación pendiente probada con la cuenta ficticia del emulador.

## Límites y siguiente paso

1. Servidor y reglas ya publicados: cobro, reintento y anulación aprobados en el entorno real con una cuenta sintética eliminada al finalizar. Falta la comprobación de uso en teléfono físico.
2. Refrigerador, favoritos, habitación y algunos contadores siguen siendo locales al navegador; no se sincronizan entre dispositivos. Comunidad conserva ejemplos, sin backend social. No está lista para lanzamiento público.
3. No se reconciliaron ni alteraron saldos/históricos existentes de producción: los errores anteriores pueden haber dejado discrepancias que requieren revisar contra evidencia real.
4. Al suspender el equipo durante horas se observó un error interno del SDK Firebase durante reconexión de una transacción; recargar recuperó la sesión. Falta verificar suspensión/reanudación en dispositivo real y en la compilación de producción.
5. Las operaciones deben terminar antes de cerrar la pestaña. El cobro tiene recuperación persistente; otros formularios no guardan borradores a través de una recarga.

Antes de invitar testers: prueba personal controlada en teléfono real, copia de seguridad y reconciliación del saldo inicial. No se afirma todavía una garantía de 30 días sin incidencias.

## Repetir las pruebas de integración

Con Java 21, iniciar Auth/Firestore con `npx firebase-tools emulators:start --project demo-life-os --only firestore,auth`.
En otra terminal, establecer `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` y ejecutar `npx vitest run --config vitest.rules.config.ts`.
La conexión del frontend al emulador requiere `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, proyecto `demo-life-os` y los hosts de Auth/Firestore configurados solo en el proceso local.
