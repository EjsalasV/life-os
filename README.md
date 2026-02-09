# 🌟 Life OS - Sistema Personal de Gestión de Vida

Aplicación integral para gestionar finanzas, ventas, salud y hábitos en tiempo real.

## 🚀 Inicio Rápido

### 1. Clonar repositorio y instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local

# Edita .env.local y agrega tus credenciales de Firebase
```

Obtén las credenciales desde [Firebase Console](https://console.firebase.google.com):
- Ve a **Configuración del proyecto**
- Copia los valores de **apiKey**, **projectId**, etc.

### 3. Ejecutar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📬 Configuración de Notificaciones Push

**⚠️ Pasos importantes para que las notificaciones funcionen:**

1. Lee el archivo [NOTIFICACIONES_SETUP.md](./NOTIFICACIONES_SETUP.md)
2. Configura la VAPID key en `.env.local`
3. Despliega la Cloud Function a Firebase
4. Prueba ejecutando manualmente el job de Cloud Scheduler

Ver instrucciones completas en → **[NOTIFICACIONES_SETUP.md](./NOTIFICACIONES_SETUP.md)**

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework**: Next.js 14+ (Client-side rendering)
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Notificaciones**: Firebase Cloud Messaging (FCM)
- **Offline**: Firestore persistent cache + IndexedDB
- **UI**: Tailwind CSS + lucide-react icons
- **Styling**: Mobile-first (390px × 844px frame)

### Estructura del Proyecto

```
app/
├── page.js          # Componente principal (orchestrator)
├── layout.js        # Layout global
├── globals.css      # Estilos básicos
├── components/
│   └── views/       # Vistas especializadas
├── hooks/           # Custom hooks con lógica de negocio
└── utils/
context/             # Authentication context
lib/                 # Firebase config
public/
└── firebase-messaging-sw.js  # Service Worker para notificaciones
```

### Hooks Principales

| Hook | Responsabilidad |
|------|-----------------|
| `useVentas` | Gestión de carrito, checkout, inventario |
| `useSalud` | Tracking de salud, ejercicios, comidas, ayunos |
| `useFinanzas` | Presupuestos, transacciones, análisis |
| `useOnline` | Detectar estado online/offline |

## 💾 Persistencia de Datos

- **Online**: Sincronización automática con Firestore
- **Offline**: Caché local automático con IndexedDB
- **Sincronización**: Automática cuando vuelve conexión

## 🔔 Sistema de Notificaciones

### Notificaciones Locales
Se envían al completar acciones (checkout, alertas de stock bajo):
- 🚨 Stock agotado
- ⚠️ Stock bajo (≤ 5 unidades)

### Notificaciones Push (Diarias a las 12 PM)
Requieren Cloud Function desplegada:
- 🔥 Racha: Recordatorio si no ha iniciado
- 💪 Salud: Recordatorio si no registró datos
- 📦 Stock: Alerta de inventario bajo

## 🛠️ Desarrollo

### Agregar nueva vista

1. Crea componente en `app/components/views/`
2. Crea hook en `app/hooks/useNewFeature.js`
3. Importa en `page.js` y agrega al router

### Agregar nueva notificación

En tu hook, usa `showToast()`:

```javascript
import { showToast } from '@/app/utils/helpers';

showToast('Tu mensaje aquí', 'success'); // o 'error'
```

### Testear Cloud Function localmente

```bash
firebase functions:shell
> sendDailyReminders()
```

## 📱 Características Principales

✅ **Gestión de Ventas**
- Carrito de compras
- Checkout automático
- Alertas de inventario
- Generador de pedidos

✅ **Tracking de Salud**
- Batería de energía
- Registro de ejercicios
- Control de comidas
- Monitoreo de ayuno intermitente
- Seguimiento del peso

✅ **Gestión Financiera**
- Ingresos vs Gastos
- Límites de presupuesto
- Análisis por categoría
- Histórico de transacciones

✅ **Hábitos**
- Racha (streak tracking)
- Configuración personalizada
- Recordatorios

## ⚡ Performance

- **Lazy loading**: Componentes cargados bajo demanda
- **Code splitting**: Automático con Next.js
- **Offline-first**: Datos disponibles inmediatamente
- **Service Worker**: Caché inteligente de notificaciones

## 🔐 Seguridad

- ✅ Variables de entorno no se exponen al navegador (solo NEXT_PUBLIC_*)
- ✅ Reglas de Firestore protegen datos por usuario
- ✅ Autenticación Firebase obligatoria
- ✅ Tokens FCM únicos por dispositivo

## 📞 Soporte

Para problemas con:
- **Notificaciones**: Ver [NOTIFICACIONES_SETUP.md](./NOTIFICACIONES_SETUP.md) → Solucionar problemas
- **Datos offline**: Verifica DevTools → Application → IndexedDB
- **Sincronización**: Verifica conexión en badge "Offline" en la app

## 📝 Próximas Features

- [ ] Exportar reportes (PDF/CSV)
- [ ] Compartir datos con otros usuarios
- [ ] Análisis predictivo (IA)
- [ ] Web Workers para cálculos en background
- [ ] PWA installation prompt

---

Made with 💚 using Next.js + Firebase
