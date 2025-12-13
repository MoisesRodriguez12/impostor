# Instrucciones para desplegar en Vercel

## 🚀 Opción 1: Despliegue en Vercel (Recomendado para producción)

**PROBLEMA:** Vercel no soporta WebSockets en el plan gratuito. Para que funcione necesitas:

### Solución A: Usar Railway.app o Render.com (Gratis y soporta WebSockets)

#### Railway.app:
1. Crear cuenta en https://railway.app
2. Conectar tu repositorio de GitHub
3. Hacer deploy automático
4. Obtener la URL del servidor
5. En Vercel, agregar variable de entorno: `VITE_SERVER_URL=https://tu-app.railway.app`

#### Render.com:
1. Crear cuenta en https://render.com
2. Crear "Web Service" desde tu repositorio
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Agregar variable de entorno en Vercel: `VITE_SERVER_URL=https://tu-app.onrender.com`

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
