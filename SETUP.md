# 🔐 Configuración Inicial - Life OS

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Firebase
- Git configurado

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/life-os.git
cd life-os
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el template de ejemplo
cp .env.example .env.local
```

Edita `.env.local` y completa con tus credenciales de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Project Settings** ⚙️ > **General**
4. En "Your apps", crea una **Web App**
5. Copia las credenciales al archivo `.env.local`

> [!IMPORTANT]
> **NUNCA** commitees el archivo `.env.local` al repositorio. Este archivo contiene credenciales sensibles.

### 4. Configurar Firebase Security Rules

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar Firestore
firebase init firestore

# Desplegar reglas de seguridad
firebase deploy --only firestore:rules
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔐 Seguridad

> [!CAUTION]
> **IMPORTANTE:** Lee la [Guía de Seguridad](./SECURITY.md) antes de desplegar a producción.

### Checklist de Seguridad

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Firebase Security Rules desplegadas
- [ ] API Key restringida por dominio en Firebase Console
- [ ] `.env.local` NO está en el repositorio

---

## 📦 Estructura del Proyecto

```
life-os/
├── app/                    # Aplicación Next.js
│   ├── components/        # Componentes React
│   │   ├── views/        # Vistas principales
│   │   ├── ui/           # Componentes UI reutilizables
│   │   ├── forms/        # Formularios
│   │   ├── charts/       # Gráficos
│   │   └── layout/       # Layouts
│   ├── hooks/            # Custom React Hooks
│   ├── utils/            # Utilidades
│   ├── page.js           # Página principal
│   └── layout.js         # Layout raíz
├── context/              # React Context
├── lib/                  # Configuración de librerías
│   ├── firebase.js       # Config de Firebase
│   └── firebase-refs.js  # Referencias de Firestore
├── public/               # Archivos estáticos
├── .env.example          # Template de variables de entorno
├── .env.local            # Variables de entorno (NO commitear)
├── firestore.rules       # Reglas de seguridad de Firebase
├── SECURITY.md           # Guía de seguridad
└── package.json          # Dependencias
```

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar build de producción
npm start

# Linting
npm run lint
```

---

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Configura las variables de entorno en Vercel Dashboard
3. Despliega automáticamente con cada push

### Otras Plataformas

- **Netlify:** Compatible con Next.js
- **Firebase Hosting:** Requiere configuración adicional
- **Railway:** Soporte nativo para Next.js

> [!WARNING]
> **Recuerda:** Configura las variables de entorno en la plataforma de despliegue.

---

## 📚 Documentación Adicional

- [Auditoría del Proyecto](./auditoria_life_os.md) - Análisis completo del código
- [Guía de Seguridad](./SECURITY.md) - Mejores prácticas de seguridad
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y de uso personal.

---

## 📧 Contacto

**Email:** [joaosalas123@gmail.com](mailto:joaosalas123@gmail.com)

---

*Última actualización: 2026-02-15*
