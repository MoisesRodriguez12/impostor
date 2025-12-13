import { useState, useEffect } from 'react'
import './App.css'

// VERSIÓN SIMPLE: Solo funciona en el mismo navegador (múltiples pestañas)
// Para juego real entre dispositivos, usa la versión con Socket.io

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
  const [screen, setScreen] = useState('home')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [room, setRoom] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedTematica, setSelectedTematica] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [playerRole, setPlayerRole] = useState(null)
  const [assignedWord, setAssignedWord] = useState('')
  const [assignedTematica, setAssignedTematica] = useState('')

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    const code = generateRoomCode()
    const newRoom = {
      code,
      admin: playerName,
      players: [playerName],
      tematica: '',
      word: '',
      impostor: ''
    }
    setRoom(newRoom)
    setRoomCode(code)
    setIsAdmin(true)
    setScreen('lobby')
    localStorage.setItem(`room_${code}`, JSON.stringify(newRoom))
    
    // Disparar evento para otras pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: `room_${code}`,
      newValue: JSON.stringify(newRoom)
    }))
  }

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Por favor ingresa tu nombre y código de sala')
      return
    }
    
    const savedRoom = localStorage.getItem(`room_${roomCode.toUpperCase()}`)
    if (!savedRoom) {
      alert('Sala no encontrada')
      return
    }
    
    const existingRoom = JSON.parse(savedRoom)
    if (existingRoom.players.includes(playerName)) {
      alert('Ya existe un jugador con ese nombre en la sala')
      return
    }
    
    existingRoom.players.push(playerName)
    setRoom(existingRoom)
    setIsAdmin(false)
    setScreen('lobby')
    localStorage.setItem(`room_${roomCode.toUpperCase()}`, JSON.stringify(existingRoom))
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: `room_${roomCode.toUpperCase()}`,
      newValue: JSON.stringify(existingRoom)
    }))
  }

  const startGame = () => {
    if (!selectedTematica) {
      alert('Por favor selecciona una temática')
      return
    }
    
    if (room.players.length < 2) {
      alert('Se necesitan al menos 2 jugadores para empezar')
      return
    }

    const randomIndex = Math.floor(Math.random() * room.players.length)
    const impostorName = room.players[randomIndex]
    
    const words = tematicas[selectedTematica]
    const randomWord = words[Math.floor(Math.random() * words.length)]
    
    const updatedRoom = {
      ...room,
      tematica: selectedTematica,
      word: randomWord,
      impostor: impostorName,
      gameStarted: true
    }
    
    setRoom(updatedRoom)
    setGameStarted(true)
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(updatedRoom))
    
    if (playerName === impostorName) {
      setPlayerRole('impostor')
      setAssignedTematica(selectedTematica)
    } else {
      setPlayerRole('player')
      setAssignedWord(randomWord)
      setAssignedTematica(selectedTematica)
    }
    
    setScreen('game')
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: `room_${roomCode}`,
      newValue: JSON.stringify(updatedRoom)
    }))
  }

  useEffect(() => {
    if (screen === 'lobby' && roomCode) {
      const handleStorageChange = (e) => {
        if (e.key === `room_${roomCode}`) {
          const updatedRoom = JSON.parse(e.newValue)
          setRoom(updatedRoom)
          
          if (updatedRoom.gameStarted && !gameStarted) {
            setGameStarted(true)
            if (playerName === updatedRoom.impostor) {
              setPlayerRole('impostor')
              setAssignedTematica(updatedRoom.tematica)
            } else {
              setPlayerRole('player')
              setAssignedWord(updatedRoom.word)
              setAssignedTematica(updatedRoom.tematica)
            }
            setScreen('game')
          }
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      const interval = setInterval(() => {
        const savedRoom = localStorage.getItem(`room_${roomCode}`)
        if (savedRoom) {
          const updatedRoom = JSON.parse(savedRoom)
          setRoom(updatedRoom)
          
          if (updatedRoom.gameStarted && !gameStarted) {
            setGameStarted(true)
            if (playerName === updatedRoom.impostor) {
              setPlayerRole('impostor')
              setAssignedTematica(updatedRoom.tematica)
            } else {
              setPlayerRole('player')
              setAssignedWord(updatedRoom.word)
              setAssignedTematica(updatedRoom.tematica)
            }
            setScreen('game')
          }
        }
      }, 500)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        clearInterval(interval)
      }
    }
  }, [screen, roomCode, playerName, gameStarted])

  if (screen === 'home') {
    return (
      <div className="container">
        <h1 className="title">🎭 El Impostor</h1>
        <p className="subtitle">Versión Local - Múltiples Pestañas</p>
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

  if (screen === 'lobby') {
    return (
      <div className="container">
        <h1 className="title">🎭 Sala: {roomCode}</h1>
        <div className="card">
          <h2>Jugadores ({room.players.length})</h2>
          <ul className="player-list">
            {room.players.map((player, index) => (
              <li key={index} className="player-item">
                {player} {player === room.admin && '👑'}
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
        </div>
      </div>
    )
  }

  return null
}

export default App
