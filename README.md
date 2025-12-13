# 🎭 El Impostor - Juego Multijugador

Juego de palabras multijugador donde los jugadores deben descubrir quién es el impostor.

## 🎮 ¿Cómo se juega?

1. **Un jugador crea una sala** y recibe un código único
2. **Otros jugadores se unen** usando el código de sala
3. **El administrador** (👑) selecciona una temática y da "Iniciar Juego"
4. **Cada jugador recibe su rol:**
   - 👥 **Jugadores normales:** Ven la temática y una palabra secreta
   - 🎭 **El Impostor:** Solo ve la temática, debe adivinar la palabra
5. **Los jugadores conversan** para descubrir quién es el impostor

## 🚀 Dos versiones disponibles

### ✅ Versión 1: Local Simple (Múltiples pestañas del navegador)
**Ideal para:** Desarrollo, pruebas rápidas, o jugar en el mismo dispositivo

```bash
npm install
npm run dev
```

Luego abre múltiples pestañas en `http://localhost:5173`

**Ventajas:**
- No requiere backend
- Funciona inmediatamente
- Perfecto para desarrollo

**Limitaciones:**
- Solo funciona en pestañas del mismo navegador
- No funciona entre dispositivos diferentes

---

### ✅ Versión 2: Multiplayer Real con Socket.io
**Ideal para:** Jugar entre múltiples dispositivos/navegadores reales

```bash
npm install
npm run dev:full
```

O en terminales separadas:
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

**Ventajas:**
- Funciona entre dispositivos diferentes
- Múltiples jugadores reales
- Sincronización en tiempo real

**Cómo jugar con amigos en la misma red WiFi:**
1. Ejecuta `npm run dev:full`
2. Encuentra tu IP local: `ipconfig` (Windows)
3. Comparte con tus amigos: `http://TU-IP:5173`
4. Todos deben estar en la misma WiFi

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo - Versión simple (solo pestañas)
npm run dev

# Desarrollo - Versión completa (múltiples dispositivos)
npm run dev:full

# Solo servidor backend
npm run server

# Build para producción
npm run build
```

## 🌐 Despliegue en Producción

Para desplegar en producción (Vercel, Railway, Render), consulta el archivo **[DEPLOY.md](./DEPLOY.md)** que contiene instrucciones detalladas.

**Nota importante:** Vercel no soporta WebSockets en su plan gratuito. Para el backend necesitas Railway.app o Render.com (ambos gratuitos y soportan WebSockets).

## 🎨 Características

- ✨ Interfaz moderna con efectos de vidrio
- 📱 Diseño responsive (móvil y desktop)
- 🎭 6 temáticas diferentes con múltiples palabras
- 👑 Sistema de administrador de sala
- 🔄 Sincronización en tiempo real
- 🎨 Animaciones y efectos visuales

## 🛠️ Tecnologías

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + Socket.io
- **Estilos:** CSS puro con efectos modernos
- **Estado:** React Hooks

## 📝 Estructura del Proyecto

```
impostor/
├── src/
│   ├── App.jsx          # Versión con Socket.io (multiplayer real)
│   ├── App.simple.jsx   # Versión simple (solo localStorage)
│   ├── App.css          # Estilos
│   └── main.jsx         # Punto de entrada
├── server.js            # Servidor Express + Socket.io
├── package.json
├── DEPLOY.md           # Guía de despliegue
└── README.md
```

## 🎯 Temáticas Disponibles

- 🍎 Frutas
- 🐕 Animales
- 🌍 Países
- ⚽ Deportes
- 💼 Profesiones
- 🎨 Colores

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Siéntete libre de abrir issues o pull requests.

## 📄 Licencia

MIT License - siéntete libre de usar este proyecto como quieras.
# impostor
