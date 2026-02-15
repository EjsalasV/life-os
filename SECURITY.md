# 🔐 Guía de Seguridad - Life OS

## 🚨 Acción Inmediata Requerida

### Paso 1: Remover Credenciales Expuestas del Historial de Git

El archivo `.env.local` fue commiteado previamente y contiene credenciales sensibles. Debes:

#### Opción A: Remover del caché de Git (Recomendado si no has pusheado)

```bash
# 1. Remover del staging/tracking
git rm --cached .env.local

# 2. Commit el cambio
git commit -m "security: Remove exposed .env.local from repository"

# 3. Verificar que .gitignore incluye .env*
cat .gitignore | grep "\.env"
```

#### Opción B: Limpiar historial completo (Si ya pusheaste a GitHub)

> [!CAUTION]
> **ADVERTENCIA:** Esto reescribe el historial de Git. Coordina con tu equipo si trabajas con otros.

```bash
# Usar BFG Repo-Cleaner (más seguro)
# 1. Instalar BFG: https://rtyley.github.io/bfg-repo-cleaner/
# 2. Ejecutar:
bfg --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# O usar git filter-branch (alternativa)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

---

### Paso 2: Rotar Credenciales de Firebase

> [!IMPORTANT]
> **CRÍTICO:** Las credenciales actuales están comprometidas. Debes rotarlas.

#### 2.1 Rotar API Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `studiobrikk-es`
3. Ve a **Project Settings** (⚙️) > **General**
4. En la sección **Your apps**, encuentra tu Web App
5. Click en **Regenerate API Key** o crea una nueva Web App
6. Copia las nuevas credenciales

#### 2.2 Actualizar Variables de Entorno

```bash
# 1. Copia el template
cp .env.example .env.local

# 2. Edita .env.local con las NUEVAS credenciales
# (Usa tu editor favorito)
```

#### 2.3 Restringir API Key (Muy Importante)

1. En Firebase Console > **Project Settings** > **General**
2. Click en **API restrictions**
3. Configura restricciones:
   - **Application restrictions**: HTTP referrers
   - Agrega tus dominios permitidos:
     - `localhost:3000` (desarrollo)
     - `tu-dominio.com` (producción)
     - `*.vercel.app` (si usas Vercel)

---

### Paso 3: Implementar Firebase Security Rules

#### 3.1 Desplegar Reglas

```bash
# 1. Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar proyecto (si no está inicializado)
firebase init firestore
# Selecciona el proyecto: studiobrikk-es
# Usa firestore.rules como archivo de reglas

# 4. Desplegar reglas
firebase deploy --only firestore:rules
```

#### 3.2 Verificar Reglas en Consola

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. **Firestore Database** > **Rules**
3. Verifica que las reglas estén activas
4. Usa el **Rules Playground** para testear

---

### Paso 4: Verificar Seguridad

#### 4.1 Test de Acceso No Autorizado

```javascript
// En la consola del navegador (sin estar logueado)
// Esto debería FALLAR
const db = getFirestore();
const usersRef = collection(db, 'users');
getDocs(usersRef); // ❌ Debería dar error de permisos
```

#### 4.2 Test de Acceso Autorizado

```javascript
// Logueado como usuario
const userId = auth.currentUser.uid;
const userDoc = doc(db, 'users', userId);
getDoc(userDoc); // ✅ Debería funcionar
```

---

## 📋 Checklist de Seguridad

- [ ] `.env.local` removido del repositorio
- [ ] Credenciales de Firebase rotadas
- [ ] API Key restringida por dominio
- [ ] Firebase Security Rules desplegadas
- [ ] Tests de seguridad ejecutados
- [ ] `.env.example` documentado
- [ ] Equipo notificado (si aplica)

---

## 🛡️ Mejores Prácticas Continuas

### 1. Variables de Entorno

```bash
# ✅ BIEN: Usar variables de entorno
NEXT_PUBLIC_FIREBASE_API_KEY=...

# ❌ MAL: Hardcodear credenciales
const apiKey = "AIzaSyCFDt83zroSAKw1bUR_0idaRD7iBLAxA10";
```

### 2. Nunca Commitear

- ❌ `.env.local`
- ❌ `.env.production`
- ❌ Archivos con credenciales
- ❌ Private keys (`.pem`, `.key`)

### 3. Siempre Commitear

- ✅ `.env.example` (sin valores reales)
- ✅ `.gitignore` actualizado
- ✅ Documentación de configuración

### 4. Rotación de Credenciales

- Rotar cada 90 días (mínimo)
- Rotar inmediatamente si hay sospecha de compromiso
- Usar diferentes credenciales para dev/staging/prod

---

## 🔗 Recursos Adicionales

- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firebase API Key Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Git Secrets Prevention](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## ⚠️ En Caso de Emergencia

Si detectas acceso no autorizado:

1. **Inmediatamente:** Deshabilita la API Key en Firebase Console
2. **Revoca:** Todas las sesiones activas en Authentication
3. **Audita:** Revisa logs de Firestore para actividad sospechosa
4. **Notifica:** A usuarios si hubo compromiso de datos
5. **Documenta:** El incidente para prevención futura

---

*Última actualización: 2026-02-15*
