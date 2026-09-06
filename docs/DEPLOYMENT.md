# Despliegue personal — 6 de septiembre de 2026

## Publicado y comprobado

- Sitio: https://app.studiobrikkec.win/
- Vercel: ejsalasvs-projects/life-os; Firebase: studiobrikk-es.
- Despliegue activo comprobado: dpl_4GASd1hJyFCffipZUtQPspSzQPR4.
- Node.js 24.x fijado en package.json; credenciales Admin conservadas en Vercel Production.
- Reglas Firestore publicadas correctamente.
- Sitio público: HTTP 200. Cobro sin sesión: HTTP 401 con error controlado.

## Prueba real aislada

Con una cuenta sintética independiente: autenticación Admin, gasto de 10 editado a 15.25, saldo 84.75, cobro de 2.50, reintento con el mismo identificador, exactamente una venta y stock 4. Anulación simultánea dos veces: saldo 84.75 y stock 5. Reintento posterior a anular: no recrea la venta. Dos registros de agua concurrentes: valor 2. Eliminación completa de la cuenta de prueba mediante la API, aprobada. No se modificaron registros de usuarios existentes.

## Corrección encontrada durante publicación

El build inicial pasaba, pero el servidor fallaba al cargar Firebase Admin por require(ESM) en jwks-rsa/jose. Se reproduce con Node sin require(ESM). Se limita únicamente jose bajo jwks-rsa a la versión compatible 5.10.x, conservando Firebase Admin. `npm run check:server-runtime` prueba este caso y forma parte del build. El segundo despliegue pasó lint (dos advertencias previas), TypeScript, 78 pruebas unitarias y el nuevo control de carga. La prueba real completa también pasó. Auditoría npm de dependencias de producción sin vulnerabilidades reportadas al momento de la revisión.

Referencia del problema upstream: https://github.com/firebase/firebase-admin-node/issues/3181

## Reversión

Antes de publicar se guardó la publicación Firestore anterior en `.cache/firestore-release-before.json` y su contenido en `.cache/firestore-rules-before.json`. El despliegue web anterior es dpl_EcauCn2JPQvotCLxSEVDaLMJoR8P. Conservar los comprobantes de cobro; no eliminarlos para revertir una interfaz. Las reglas y el servidor son servicios distintos y no se publican atómicamente.

## Uso personal

Ya puede comenzar una prueba personal controlada. Pendiente comprobar teclado real, suspensión/reanudación y reconexión en teléfono. Refrigerador y ciertos favoritos/contadores siguen siendo locales al navegador. Comunidad indica contenido de muestra. No se han reconciliado saldos históricos de usuarios existentes.

`npm run check:deploy` inspecciona el entorno local: puede informar variables Admin ausentes porque los secretos permanecen únicamente en Vercel. No significa que falten en el servidor publicado. No copiar secretos al chat ni al repositorio.
