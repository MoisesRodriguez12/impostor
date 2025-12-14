import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './App.css'

// Conectar al servidor
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
let socket = null

// Temáticas y palabras del juego
const tematicas = {
  frutas: ['manzana', 'plátano', 'naranja', 'fresa', 'sandía', 'uva', 'piña', 'mango'],
  animales: ['perro', 'gato', 'elefante', 'león', 'tigre', 'jirafa', 'mono', 'oso'],
  países: ['méxico', 'españa', 'francia', 'italia', 'japón', 'brasil', 'argentina', 'alemania'],
  deportes: ['fútbol', 'baloncesto', 'tenis', 'natación', 'atletismo', 'béisbol', 'voleibol', 'boxeo'],
  profesiones: ['doctor', 'maestro', 'ingeniero', 'chef', 'artista', 'abogado', 'programador', 'músico'],
  colores: ['rojo', 'azul', 'verde', 'amarillo', 'morado', 'naranja', 'rosa', 'negro']
}

function App() {
  const [screen, setScreen] = useState('home') // home, lobby, game
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [room, setRoom] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedTematica, setSelectedTematica] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [playerRole, setPlayerRole] = useState(null) // 'impostor' o 'player'
  const [assignedWord, setAssignedWord] = useState('')
  const [assignedTematica, setAssignedTematica] = useState('')
  const [connected, setConnected] = useState(false)

  // Conectar al servidor cuando la app se monta
  useEffect(() => {
    socket = io(SERVER_URL)
    
    socket.on('connect', () => {
      console.log('Conectado al servidor')
      setConnected(true)
    })
    
    socket.on('disconnect', () => {
      console.log('Desconectado del servidor')
      setConnected(false)
    })
    
    socket.on('room-updated', (updatedRoom) => {
      console.log('Sala actualizada:', updatedRoom)
      setRoom(updatedRoom)
      // Actualizar estado de admin si es necesario
      if (playerName && updatedRoom.admin === playerName) {
        setIsAdmin(true)
      }
    })
    
    socket.on('game-started', (gameData) => {
      console.log('Juego iniciado:', gameData)
      setGameStarted(true)
      setPlayerRole(gameData.role)
      setAssignedTematica(gameData.tematica)
      if (gameData.word) {
        setAssignedWord(gameData.word)
      }
      setScreen('game')
    })
    
    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  // Crear sala
  const createRoom = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    
    if (!connected) {
      alert('No hay conexión con el servidor')
      return
    }
    
    socket.emit('create-room', playerName, (response) => {
      if (response.success) {
        setRoom(response.room)
        setRoomCode(response.roomCode)
        setIsAdmin(true)
        setScreen('lobby')
      } else {
        alert('Error al crear la sala')
      }
    })
  }

  // Unirse a sala
  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Por favor ingresa tu nombre y código de sala')
      return
    }
    
    if (!connected) {
      alert('No hay conexión con el servidor')
      return
    }
    
    socket.emit('join-room', { roomCode: roomCode.toUpperCase(), playerName }, (response) => {
      if (response.success) {
        setRoom(response.room)
        setRoomCode(roomCode.toUpperCase())
        // Verificar si este jugador es el admin
        setIsAdmin(response.room.admin === playerName)
        setScreen('lobby')
      } else {
        alert(response.error || 'Error al unirse a la sala')
      }
    })
  }

  // Iniciar juego (solo admin)
  const startGame = () => {
    if (!selectedTematica) {
      alert('Por favor selecciona una temática')
      return
    }
    
    if (room.players.length < 3) {
      alert('Se necesitan al menos 3 jugadores para empezar')
      return
    }

    socket.emit('start-game', {
      roomCode,
      tematica: selectedTematica,
      words: tematicas[selectedTematica]
    })
  }

  // Nueva ronda (solo admin)
  const startNewRound = () => {
    // Si no se seleccionó una nueva temática, usa la actual
    const tematicaToUse = selectedTematica || assignedTematica
    
    if (!tematicaToUse) {
      alert('Por favor selecciona una temática')
      return
    }

    socket.emit('new-round', {
      roomCode,
      tematica: tematicaToUse,
      words: tematicas[tematicaToUse]
    })
    
    // Resetear la selección
    setSelectedTematica('')
  }

  // Pantalla de inicio
  if (screen === 'home') {
    return (
      <div className="container">
        <h1 className="title">🎭 El Impostor</h1>
        <div className="card">
          <input
            type="text"
            placeholder="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
          />
          <button onClick={createRoom} className="btn btn-primary">
            Crear Sala
          </button>
          <div className="divider">o</div>
          <input
            type="text"
            placeholder="Código de sala"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="input"
          />
          <button onClick={joinRoom} className="btn btn-secondary">
            Unirse a Sala
          </button>
        </div>
      </div>
    )
  }

  // Pantalla de lobby
  if (screen === 'lobby') {
    return (
      <div className="container">
        <h1 className="title">🎭 Sala: {roomCode}</h1>
        <div className="card">
          <h2>Jugadores ({room?.players?.length || 0})</h2>
          <ul className="player-list">
            {room?.players?.map((player, index) => (
              <li key={index} className="player-item">
                {player.name || player} {(player.name || player) === room.admin && '👑'}
              </li>
            ))}
          </ul>
          
          {isAdmin && (
            <>
              <div className="admin-section">
                <h3>Selecciona una temática:</h3>
                <select 
                  value={selectedTematica} 
                  onChange={(e) => setSelectedTematica(e.target.value)}
                  className="select"
                >
                  <option value="">-- Selecciona --</option>
                  {Object.keys(tematicas).map((tema) => (
                    <option key={tema} value={tema}>
                      {tema.charAt(0).toUpperCase() + tema.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={startGame} className="btn btn-primary">
                Iniciar Juego
              </button>
            </>
          )}
          
          {!isAdmin && (
            <p className="waiting">Esperando a que el administrador inicie el juego...</p>
          )}
        </div>
      </div>
    )
  }

  // Pantalla de juego
  if (screen === 'game') {
    return (
      <div className="container">
        <h1 className="title">🎭 El Impostor</h1>
        <div className="card game-card">
          {playerRole === 'impostor' ? (
            <>
              <div className="impostor-badge">¡ERES EL IMPOSTOR!</div>
              <div className="game-info">
                <h2>Temática:</h2>
                <p className="tematica">{assignedTematica.toUpperCase()}</p>
                <p className="instructions">
                  Intenta descubrir cuál es la palabra sin que te descubran. 
                  Haz preguntas y participa en la conversación.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="player-badge">Eres un jugador normal</div>
              <div className="game-info">
                <h2>Temática:</h2>
                <p className="tematica">{assignedTematica.toUpperCase()}</p>
                <h2>Tu palabra:</h2>
                <p className="word">{assignedWord.toUpperCase()}</p>
                <p className="instructions">
                  Describe tu palabra sin mencionarla directamente. 
                  Intenta descubrir quién es el impostor.
                </p>
              </div>
            </>
          )}
          
          {isAdmin && (
            <div className="admin-controls">
              <p className="admin-label">👑 Controles de Administrador</p>
              <select 
                value={selectedTematica} 
                onChange={(e) => setSelectedTematica(e.target.value)}
                className="select"
              >
                <option value="">Misma temática ({assignedTematica})</option>
                {Object.keys(tematicas).map((tema) => (
                  <option key={tema} value={tema}>
                    {tema.charAt(0).toUpperCase() + tema.slice(1)}
                  </option>
                ))}
              </select>
              <button onClick={startNewRound} className="btn btn-primary">
                🔄 Nueva Ronda
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default App
