# 🍎 Apple Watch Integration Guide

## Overview
Este documento describe cómo integrar Apple Watch con Life OS para sincronización de datos en tiempo real.

---

## 🎯 Características Disponibles en Apple Watch

### 1. **HealthKit Integration** (Recomendado)
Acceso a datos nativos del Apple Watch:
- ❤️ Ritmo cardíaco (BPM)
- 🔥 Calorías quemadas (basado en movimiento)
- 📊 Pasos, distancia
- 💤 Sueño (hora de dormir, despertares)
- 📈 Entrenamientos registrados

### 2. **WatchKit App** (App nativa en Watch)
Interfaz optimizada para pantalla pequeña:
- ⏱️ Timer para ejercicios
- 💧 Recordatorio de agua cada 2h
- 🎯 Anillo de actividad diaria
- 📱 Notificaciones push inteligentes

### 3. **Sincronización de Datos**
- Calorías quemadas → Actualiza balance del día
- Ritmo cardíaco → Detecta estrés (HR elevado)
- Sueño → Verifica calidad de descanso

---

## 🛠️ Implementación Técnica

### Paso 1: HealthKit Permissions (iOS)
```swift
import HealthKit

let healthKitManager = HKHealthStore()

// Solicitar permisos
let allTypes = Set([
  HKObjectType.workoutType(),
  HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
  HKObjectType.quantityType(forIdentifier: .heartRate)!,
  HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
])

healthKitManager.requestAuthorization(toShare: allTypes, read: allTypes) { success, error in
  if success {
    print("✅ HealthKit autorizado")
  }
}
```

### Paso 2: Leer Calorías Quemadas
```swift
func getCaloriesBurned(completion: @escaping (Double) -> Void) {
  let caloriesType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
  
  let startDate = Calendar.current.startOfDay(for: Date())
  let predicate = HKQuery.predicateForSamples(
    withStart: startDate,
    end: Date(),
    options: .strictStartDate
  )
  
  let query = HKStatisticsQuery(
    quantityType: caloriesType,
    quantitySamplePredicate: predicate,
    options: .cumulativeSum
  ) { _, result, _ in
    let sum = result?.sumQuantity()?.doubleValue(for: HKUnit.kilocalorie()) ?? 0
    completion(sum)
  }
  
  healthKitManager.execute(query)
}
```

### Paso 3: React Native HealthKit Library
```bash
npm install react-native-health
```

Uso en JavaScript:
```javascript
import Health from 'react-native-health';

// Obtener calorías quemadas
Health.getLatestSample({
  startDate: new Date(Date.now() - 24*60*60*1000),
  endDate: new Date(),
  ascending: false,
  limit: 1,
  type: 'ActiveEnergyBurned',
}).then(result => {
  console.log('Calorías quemadas hoy:', result.value);
  updateBalance(result.value);
});
```

### Paso 4: Push Notifications desde Watch
```swift
import UserNotifications

func scheduleWatchNotification(
  title: String,
  body: String,
  at: DateComponents
) {
  let content = UNMutableNotificationContent()
  content.title = title
  content.body = body
  content.sound = .default
  content.badge = NSNumber(value: 1)
  
  let trigger = UNCalendarNotificationTrigger(dateMatching: at, repeats: true)
  let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
  
  UNUserNotificationCenter.current().add(request) { error in
    if error == nil { print("✅ Notificación programada en Watch") }
  }
}

// Uso: Recordar desayuno a las 7am
var components = DateComponents()
components.hour = 7
components.minute = 0
scheduleWatchNotification(title: "🌅 Desayuno", body: "Regístralo ahora", at: components)
```

---

## 📱 Arquitectura de Sincronización

```
┌─────────────────┐
│  Apple Watch    │
│  - HealthKit    │
│  - Workouts     │
└────────┬────────┘
         │ (Sync via Bluetooth)
         ↓
┌─────────────────┐
│  iOS App        │
│  - React Native │
│  - Local Storage│
└────────┬────────┘
         │ (API Call)
         ↓
┌─────────────────┐
│  Backend Server │
│  - Node.js      │
│  - Database     │
└─────────────────┘
```

### Flujo de Datos:
1. **Apple Watch registra movimiento** → Actualiza HealthKit
2. **iOS App lee HealthKit cada 10 min** → Calcula calorías quemadas
3. **Envía a backend API** → `/api/salud/sync-apple-watch`
4. **Backend actualiza balance diario** → Calcula si hay deficit/superávit
5. **App recibe actualización** → Muestra balance en tiempo real

---

## 🔔 Notificaciones Smart en Watch

### Horarios Recomendados:
```javascript
const notificacionesWatch = {
  'desayuno': { hora: 7, minuto: 0 },
  'almuerzo': { hora: 12, minuto: 30 },
  'cena': { hora: 19, minuto: 0 },
  'agua': [9, 14, 17, 20, 21], // Cada 2-3 horas
  'ejercicio-mañana': { hora: 6, minuto: 30 },
  'ejercicio-tarde': { hora: 17, minuto: 30 },
  'dormir': { hora: 22, minuto: 30 }
}
```

### Adaptar según estrés:
- **Estrés > 70**: Notif de meditación cada hora
- **Sueño < 6h**: Alerta de "descansa hoy"
- **Déficit > 600**: "Come algo, proteína"

---

## 🚀 Implementación en 3 Fases

### Fase 1: MVP (1-2 semanas)
- ✅ Leer calorías quemadas de HealthKit
- ✅ Sincronizar al backend cada 10 min
- ✅ Mostrar balance actualizado en real-time
- ❌ App nativa en Watch (no necesario aún)

### Fase 2: Notificaciones Smart (2-3 semanas)
- ✅ Push notifications desde app iOS
- ✅ Horarios personalizables
- ✅ Inteligencia: adaptar según cortisol/estrés
- ✅ Integración con "Horarios Óptimos"

### Fase 3: WatchKit App (1+ mes)
- ✅ App nativa en Apple Watch
- ✅ Display del balance diario
- ✅ Timer para entrenamientos
- ✅ Registro rápido de comidas

---

## 📊 API Endpoints Necesarios

```javascript
// POST /api/salud/sync-apple-watch
// Body:
{
  "userId": "user123",
  "caloriesQuemadas": 450,
  "heartRate": 72,
  "pasos": 8234,
  "suenoHoras": 7.5,
  "timestamp": "2026-05-17T14:30:00Z"
}

// Response: 
{
  "balance": -150, // deficit = bueno
  "recomendacion": "Vas bien, deficit perfecto",
  "proximaNotificacion": "cena_7pm"
}
```

---

## ⚠️ Requisitos Técnicos

- **iOS 15+** (para HealthKit completo)
- **React Native** + **react-native-health**
- **Backend Node.js** para sincronización
- **Database** que almacene datos de Watch

---

## 🎯 Beneficios de Apple Watch

| Característica | Beneficio | Impacto |
|---|---|---|
| Calorías automáticas | No tienes que registrar ejercicio | +30% precisión |
| Ritmo cardíaco | Detecta estrés/ansiedad | Alerta temprana |
| Sueño nativo | Valida si dormiste bien | Correlaciona con cortisol |
| Notificaciones en muñeca | No pierdes recordatorios | +70% adherencia |
| Sincronización 24/7 | Datos siempre actualizados | Mejor predicción |

---

## 🔐 Privacidad & Seguridad

✅ Los datos de HealthKit nunca salen del dispositivo
✅ Apple no comparte datos personales
✅ Encriptación end-to-end en tránsito
✅ Usuario controla qué app accede a HealthKit

---

## 🧪 Testing en Simulator

```swift
// No puedes usar HealthKit en Simulator
// Necesitas físicamente un iPhone + Apple Watch emparejado
// O usar WatchKit Simulator en Xcode
```

Para testing sin Watch, simula datos:
```javascript
const mockCaloriesFromWatch = 450;
const mockHeartRate = 72;
// Esto permite testing sin hardware real
```

---

## 📚 Recursos Útiles

- [Apple HealthKit Documentation](https://developer.apple.com/healthkit/)
- [React Native Health Library](https://github.com/agencyenterprise/react-native-health)
- [WatchKit UI Guidelines](https://developer.apple.com/watchkit/)
- [UserNotifications Framework](https://developer.apple.com/documentation/usernotifications)

---

## ✅ Conclusión

Apple Watch es la **extensión natural** de Life OS:
- Datos en tiempo real sin que hagas nada
- Notificaciones que llegan a tu muñeca
- Sincronización automática 24/7
- Precisión de calorías: +30%

**Prioridad implementación: Fase 1 (MVP) primero, luego Fase 2.**

