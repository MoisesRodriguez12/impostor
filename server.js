import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()

// Configurar CORS para permitir peticiones desde cualquier origen
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Ruta de health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de Socket.io para El Impostor',
    rooms: rooms.size 
  })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
})

// Almacén de salas en memoria
const rooms = new Map()

// Generar código de sala aleatorio
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id)

  // Crear sala
  socket.on('create-room', (playerName, callback) => {
    const roomCode = generateRoomCode()
    const room = {
      code: roomCode,
      admin: playerName,
      players: [{ name: playerName, socketId: socket.id }],
      tematica: '',
      word: '',
      impostor: '',
      gameStarted: false
    }
    
    rooms.set(roomCode, room)
    socket.join(roomCode)
    
    callback({ success: true, roomCode, room })
    console.log(`Sala creada: ${roomCode} por ${playerName}`)
  })

  // Unirse a sala
  socket.on('join-room', (data, callback) => {
    const { roomCode, playerName } = data
    const room = rooms.get(roomCode)
    
    if (!room) {
      callback({ success: false, error: 'Sala no encontrada' })
      return
    }
    
    if (room.gameStarted) {
      callback({ success: false, error: 'El juego ya ha comenzado' })
      return
    }
    
    const playerExists = room.players.some(p => p.name === playerName)
    if (playerExists) {
      callback({ success: false, error: 'Ya existe un jugador con ese nombre' })
      return
    }
    
    room.players.push({ name: playerName, socketId: socket.id })
    socket.join(roomCode)
    
    // Notificar a todos en la sala
    io.to(roomCode).emit('room-updated', room)
    
    callback({ success: true, room })
    console.log(`${playerName} se unió a la sala ${roomCode}`)
  })

  // Iniciar juego
  socket.on('start-game', (data) => {
    const { roomCode, tematica, words } = data
    const room = rooms.get(roomCode)
    
    if (!room) return
    
    // Seleccionar impostor aleatorio
    const randomIndex = Math.floor(Math.random() * room.players.length)
    const impostorPlayer = room.players[randomIndex]
    
    // Seleccionar palabra aleatoria
    const randomWord = words[Math.floor(Math.random() * words.length)]
    
    room.tematica = tematica
    room.word = randomWord
    room.impostor = impostorPlayer.name
    room.gameStarted = true
    
    // Enviar información específica a cada jugador
    room.players.forEach(player => {
      const isImpostor = player.name === impostorPlayer.name
      io.to(player.socketId).emit('game-started', {
        role: isImpostor ? 'impostor' : 'player',
        tematica: tematica,
        word: isImpostor ? null : randomWord
      })
    })
    
    console.log(`Juego iniciado en sala ${roomCode}. Impostor: ${impostorPlayer.name}`)
  })

  // Nueva ronda (regenerar palabra)
  socket.on('new-round', (data) => {
    const { roomCode, tematica, words } = data
    const room = rooms.get(roomCode)
    
    if (!room) return
    
    // Seleccionar nuevo impostor aleatorio
    const randomIndex = Math.floor(Math.random() * room.players.length)
    const impostorPlayer = room.players[randomIndex]
    
    // Seleccionar nueva palabra aleatoria
    const randomWord = words[Math.floor(Math.random() * words.length)]
    
    room.tematica = tematica
    room.word = randomWord
    room.impostor = impostorPlayer.name
    
    // Enviar información específica a cada jugador
    room.players.forEach(player => {
      const isImpostor = player.name === impostorPlayer.name
      io.to(player.socketId).emit('game-started', {
        role: isImpostor ? 'impostor' : 'player',
        tematica: tematica,
        word: isImpostor ? null : randomWord
      })
    })
    
    console.log(`Nueva ronda en sala ${roomCode}. Impostor: ${impostorPlayer.name}, Palabra: ${randomWord}`)
  })

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id)
    
    // Eliminar jugador de todas las salas
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
      
      if (playerIndex !== -1) {
        const player = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        
        if (room.players.length === 0) {
          // Eliminar sala vacía
          rooms.delete(roomCode)
          console.log(`Sala ${roomCode} eliminada (vacía)`)
        } else {
          // Si era el admin, asignar nuevo admin
          if (room.admin === player.name) {
            room.admin = room.players[0].name
          }
          // Notificar actualización
          io.to(roomCode).emit('room-updated', room)
          console.log(`${player.name} salió de la sala ${roomCode}`)
        }
      }
    })
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`)
})
