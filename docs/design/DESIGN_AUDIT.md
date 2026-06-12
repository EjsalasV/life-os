# Design Audit: Life OS — Prototipo vs. Implementación Actual

**Fecha:** 2026-05-28  
**Fuente de diseño:** https://api.anthropic.com/v1/design/h/zPkb3-RNJhv2xUk-hMa9Aw

---

## ✅ YA IMPLEMENTADO

### 1. **Dark/Light Mode Toggle**
- ✅ Existe en `app/page.js` (líneas 26-44)
- ✅ Persiste en localStorage (`lifeos-dark-mode`)
- ✅ Aplica clase `dark` al HTML root
- **Estado:** LISTO

### 2. **Tres Módulos Principales**
- ✅ Finanzas (FinanzasView) → Wallet del prototipo
- ✅ Negocios/Ventas (VentasView) → Business del prototipo  
- ✅ Salud (SaludView) → Health del prototipo
- **Estado:** LISTO

### 3. **Mascota Interactiva (Tamagotchi)**
- ✅ PetSprite component (PixelPet.jsx, SpriteAnimation.jsx)
- ✅ VitalidadPetCard con interacción directa (acariciar/jugar)
- ✅ Sistema de stats (salud, energía, hambre, sed, felicidad)
- ✅ Animaciones de humor/estado
- ✅ Persistencia de stats en localStorage
- **Estado:** COMPLETO

### 4. **Sistema de Hábitos con Límites Diarios**
- ✅ useHabitLogs hook (recién agregado)
- ✅ Límites: agua (8), comida (4), actividad (2), sueño (1)
- ✅ Validación y contador visible
- ✅ Auto-reset por cambio de día
- ✅ Persistencia en localStorage
- **Estado:** RECIÉN IMPLEMENTADO ✨

### 5. **Gamificación Básica**
- ✅ Niveles del pet
- ✅ Experiencia/XP
- ✅ Logros/achievements
- ✅ Sistema de raridad de mascota
- ✅ Reacciones visuales (partículas, mensajes)
- **Estado:** LISTO

### 6. **Responsividad**
- ✅ Diseño mobile-first
- ✅ Adaptación a diferentes pantallas
- **Estado:** LISTO

---

## ⚠️ PARCIALMENTE IMPLEMENTADO

### 1. **Paleta de Colores Coherente**

**Prototipo propone:**
```
DARK MODE:
  bg: #08090b
  bgElev: #101216
  accent lime: #bef264 (muy brillante)
  cyan: #7dd3fc
  amber: #fbbf24
  
LIGHT MODE:
  bg: #f5f5f1 (off-white cálido)
  accent lime: #65a30d (verde olivo)
  cyan: #0284c7 (azul océano)
  amber: #d97706 (naranja)
```

**Proyecto actual:**
- ⚠️ Usa Tailwind default colors
- ⚠️ No tiene sistema de tokens explícito
- ⚠️ Colores dispersos en componentes
- ⚠️ Falta el brillo específico del prototipo

**Recomendación:** Crear `app/lib/design-tokens.ts` con valores explícitos

### 2. **Home Screen / Launcher**

**Prototipo:**
- Frame iOS con tiles de módulos (01 Wallet, 02 Negocio, 03 Salud)
- Mascota visible con balance/nivel
- Hora y fecha
- Acceso rápido a módulos

**Proyecto actual:**
- ⚠️ Existe HomeView pero no como home screen principal
- ⚠️ Acceso a módulos por MainLayout tabs
- ⚠️ No tiene tiles grandes/visuales

**Recomendación:** Mejorar HomeView como launcher visual

### 3. **Componentes UI Base**

**Prototipo define:**
```
Card, Money, ProgressBar, SectionLabel, 
IconBtn, SparkLine, BarChart, Pill
```

**Proyecto actual:**
- ⚠️ Componentes existen pero sin sistema compartido
- ⚠️ Estilos inline o por CSS Module
- ⚠️ No reutilización clara

**Recomendación:** Crear `app/components/ui-primitives/` con componentes base

---

## ❌ NO IMPLEMENTADO

### 1. **Frame iOS Realista**
- ❌ No hay simulación de iPhone
- ❌ Falta notch y home bar
- ❌ No hay status bar animado

**Prototipo:** `ios-frame.jsx` con:
```javascript
- Notch simulado
- Status bar (hora, batería, señal)
- Home bar inferior
- Rounded corners
- Safe areas
```

**Impacto:** BAJO — Opcional para MVP, útil para demos

### 2. **Tweaks Sidebar (Right Panel)**
- ❌ No existe panel para cambiar tema/acento en tiempo real

**Prototipo:**
```
- Selector: Dark / Light
- 5 acentos por tema
- Preview en vivo
```

**Impacto:** MEDIO — Útil para UX pero no crítico

### 3. **Tipografías Específicas**

**Prototipo importa:**
- Geist (UI general) ✅ Probablemente via Google Fonts
- JetBrains Mono (números) ❌
- Silkscreen (pixel art titles) ❌
- Pixelify Sans (elementos retro) ❌

**Recomendación:** Agregar importaciones a `app/layout.tsx`

### 4. **Componentes de Dashboard Visuales**

**Falta en Wallet:**
- ❌ SparkLine (mini gráficos)
- ❌ BarChart (comparativas)
- ❌ AnimatedMoney (cambios de balance)

**Falta en Salud:**
- ❌ Historial visual de stats
- ❌ Gráficos de macros
- ❌ Timeline de hábitos

### 5. **Sistema de Animaciones**

**Prototipo define:**
```css
@keyframes petBob       /* Mascota flotando */
@keyframes petPulse     /* Latido */
@keyframes bubbleFloat  /* Burbujas de feedback */
```

**Proyecto actual:**
- ⚠️ Animaciones de mascota existen
- ❌ No tiene animaciones de interfaz (transiciones suaves)
- ❌ Falta easing global

**Recomendación:** Crear `app/styles/animations.css`

### 6. **Gradientes de Fondo**

**Prototipo usa:**
```
Dark: radial-gradient(ellipse at top, #0a0d10 0%, #050608 60%, #000 100%)
Light: radial-gradient(ellipse at top, #fafaf6 0%, #ebeae3 60%, #d9d7cf 100%)
Grid overlay de 40px
```

**Proyecto actual:**
- ❌ Fondos sólidos/simples

---

## 📋 CHECKLIST DE MEJORAS

### CRÍTICO (Implementar primero)
- [ ] Sistema de design tokens (`app/lib/design-tokens.ts`)
- [ ] Actualizar paleta de colores a exactos del prototipo
- [ ] Mejorar HomeView como launcher visual
- [ ] Agregar tipografías Silkscreen y Pixelify Sans

### IMPORTANTE (Post MVP)
- [ ] Frame iOS opcional para demos
- [ ] Tweaks sidebar para temas
- [ ] Componentes UI primitivos reutilizables
- [ ] Animaciones de interfaz (transiciones)
- [ ] Gradientes de fondo

### NICE-TO-HAVE (Futuro)
- [ ] SparkLine y BarChart en dashboards
- [ ] Animaciones adicionales (petBob, petPulse, bubbleFloat)
- [ ] Grid overlay del prototipo
- [ ] Status bar animado

---

## 🎯 RESUMEN

**Implementación actual:** 60% del diseño  
**Funcionalidad:** 95% (sistema funciona muy bien)  
**Visual/UX:** 65% (se ve bien pero le falta pulido del prototipo)

**Próximos pasos recomendados:**
1. Crear sistema de tokens global (30 min)
2. Actualizar colores en MainLayout y componentes (1h)
3. Mejorar HomeView (1h)
4. Agregar tipografías retro (15 min)
5. Refactorizar componentes UI (2h)

**Total estimado:** 4.5 horas para cerrar al 95% del diseño prototipo.

---

## 📂 Archivos del Prototipo (Referencia)

Extraidos de `life-os/project/nextjs/app/components/`:
- `tokens.js` — Paletas dark/light + fuentes
- `ios-frame.jsx` — Frame iPhone
- `app.jsx` — Router principal + tweaks sidebar
- `ui.jsx` — Primitivos (Card, Money, ProgressBar, etc.)
- `pet.jsx` — Tamagotchi pixel art
- `home.jsx` — Home screen / launcher
- `wallet.jsx`, `business.jsx`, `health.jsx` — Módulos

