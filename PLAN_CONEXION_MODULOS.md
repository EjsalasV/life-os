# Plan: Conectar FinanzasView, VentasView, SaludView con Componentes Primitivos

**Principio de Oro:** NO TOCAR LA MASCOTA NI NINGUNA LÓGICA EXISTENTE

## 1. FinanzasView → ControlTabContent

**Cambios:**
- Importar: `Money`, `ProgressBar`, `Pill`
- Reemplazar elementos de balance con `<Money />` 
- Reemplazar barras de progreso con `<ProgressBar />`
- Mantener: TODAS las funciones, hooks, lógica, estado

**Líneas a modificar:** ~5-10 imports y componentes visuales
**Riesgo:** BAJO - solo reemplazo de UI, sin lógica

---

## 2. VentasView → TerminalTabContent  

**Cambios:**
- Importar: `Money`, `Card`, `StatBox`
- Mostrar métricas con `<Money />` y `<StatBox />`
- Reemplazar cards básicas con `<Card />`
- Mantener: Carrito, lógica de venta, FloatingCart INTACTO

**Líneas a modificar:** ~5-8 imports y componentes
**Riesgo:** BAJO - solo visual, sin tocar FloatingCart

---

## 3. SaludView → SOLO TABS SIN MASCOTA

⚠️ **IMPORTANTE:** 
- ✅ VitalidadPetCard: INTACTO (mascota)
- ✅ useComunidadPet hook: INTACTO
- ✅ handleAcariciar, handleJugar: INTACTO
- ❌ NO toco nada del pet

**Dónde SÍ agrego componentes:**
- NutricionTab: Mostrar calorías con `<Money />` (adaptado)
- RecetasTab: Mostrar ingredientes con `<Pill />`
- HerramientasTab: Mostrar herramientas con `<Card />`

**Líneas a modificar:** ~3-5 archivos secundarios, solo UI
**Riesgo:** MUY BAJO - tabs separados del pet

---

## Estrategia de Seguridad

1. Backup mental: Sabemos dónde está el código del pet
2. Grep para verificar: No edito archivos con "pet", "mascot", "vital"
3. Cambios quirúrgicos: Solo imports + reemplazo de divs/spans
4. Compilar después de cada cambio: `npm run build`
5. No editar: hooks, estados, funciones con lógica

---

## Archivos a Editar

```
app/components/views/finanzas/ControlTabContent.js          (+imports, ~5 componentes)
app/components/views/ventas/TerminalTabContent.js           (+imports, ~4 componentes)
app/components/views/NutricionTab.tsx                       (+imports, ~2 componentes)
app/components/views/RecetasTab.tsx                         (+imports, ~3 componentes)
app/components/views/HerramientasTab.jsx                    (+imports, ~2 componentes)
```

## Archivos QUE NO TOCO

```
✅ SaludView.js (contenedor, tiene mascota)
✅ VitalidadPetCard.jsx (LA MASCOTA)
✅ useComunidadPet.ts (lógica del pet)
✅ VentasView.js (contenedor)
✅ FloatingCart.jsx (carrito intacto)
```

---

## Compilación y Verificación

Después de cada cambio:
```bash
npm run build  # Verificar que compila sin errores
npm run dev    # Verificar que la mascota sigue viva y bien
```

**Mascota debe seguir:**
- ✅ Renderizando en SaludView
- ✅ Respondiendo a clicks (acariciar, jugar)
- ✅ Mostrando stats (salud, energía, etc)
- ✅ Guardando datos en localStorage

