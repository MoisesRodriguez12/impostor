# 🚀 Guía de Despliegue en Producción

## ⚠️ IMPORTANTE: Arquitectura de Despliegue

**Vercel NO soporta WebSockets.** Necesitas:
- **Frontend → Vercel** (gratis, rápido)
- **Backend (Socket.io) → Railway o Render** (gratis, soporta WebSockets)

---

## 📦 Paso 1: Desplegar Backend en Railway

### Opción A: Railway.app (Recomendado - Más fácil)

1. **Crear cuenta** en https://railway.app
2. **Nuevo Proyecto** → "Deploy from GitHub repo"
3. **Seleccionar tu repositorio** `impostor`
4. Railway detectará automáticamente `server.js`
5. **Variables de entorno** (opcional):
   - `PORT` se asigna automáticamente
6. **Obtener URL del servidor**:
   - Click en tu servicio → Settings → Public Networking
   - Copiar la URL: `https://tu-proyecto.up.railway.app`

### Opción B: Render.com (Alternativa)

1. **Crear cuenta** en https://render.com
2. **New → Web Service** desde tu repositorio
3. **Configuración:**
   - Name: `impostor-backend`
   - Root Directory: dejar vacío
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. **Obtener URL**: `https://impostor-backend.onrender.com`

⚠️ **Nota:** Render puede tardar ~1 min en "despertar" en plan gratuito.

---

## 🌐 Paso 2: Desplegar Frontend en Vercel

1. **Subir código a GitHub** (si no lo has hecho)
   ```bash
   git add .
   git commit -m "Deploy impostor game"
   git push origin main
   ```

2. **Ir a** https://vercel.com y hacer login con GitHub

3. **Import Project** → Seleccionar repositorio `impostor`

4. **Configurar Build:**
   - Framework Preset: `Vite`
   - Root Directory: `./` (raíz del proyecto)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **⚠️ AGREGAR VARIABLE DE ENTORNO:**
   - Click en "Environment Variables"
   - **Name:** `VITE_SERVER_URL`
   - **Value:** `https://tu-proyecto.up.railway.app` (la URL de Railway)
   - Aplicar a: `Production`, `Preview`, `Development`

6. **Deploy** 🚀

---

## ✅ Verificar que funciona

1. Abre tu app en Vercel: `https://tu-proyecto.vercel.app`
2. Abre la consola del navegador (F12)
3. Deberías ver: `"Conectado al servidor"`
4. Crea una sala y prueba con otra pestaña/dispositivo

---

## 🏠 Opción 2: Desarrollo Local (Funciona perfectamente)

```bash
# Ejecutar servidor y frontend simultáneamente
npm run dev:full
```

O en terminales separadas:
```bash
# Terminal 1 - Servidor
npm run server

# Terminal 2 - Frontend
npm run dev
```

El juego estará disponible en:
- Frontend: http://localhost:5173
- Servidor: http://localhost:3001

**NOTA:** Para jugar con múltiples jugadores en local:
- Todos deben estar en la misma red WiFi
- Abrir: http://TU-IP-LOCAL:5173
- Para encontrar tu IP: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)

---

## 🌐 Opción 3: Usar servicios separados (Producción real)

### Frontend en Vercel:
```bash
npm run build
# Hacer push a GitHub
# Conectar repositorio en vercel.com
```

### Backend en Railway/Render:
- Configurar solo el archivo `server.js`
- Agregar variables de entorno si es necesario

### Configuración:
En Vercel, agregar variable de entorno:
- **Key:** `VITE_SERVER_URL`
- **Value:** `https://tu-backend.railway.app` o `https://tu-backend.onrender.com`

---

## 📝 Notas importantes:

1. **WebSockets requieren servidor persistente** (Vercel solo soporta funciones serverless)
2. **Railway y Render** tienen planes gratuitos perfectos para este proyecto
3. **Para desarrollo local** todo funciona sin problemas
4. **Comparte tu IP local** con amigos en la misma red para jugar juntos

---

## 🎮 Cómo jugar:

1. El primer jugador crea una sala y se convierte en admin 👑
2. Otros jugadores se unen con el código de sala
3. El admin selecciona una temática y da "Iniciar Juego"
4. Cada jugador ve su pantalla:
   - **Jugador normal:** Ve la temática y la palabra
   - **Impostor:** Solo ve la temática
5. ¡A descubrir quién es el impostor!
