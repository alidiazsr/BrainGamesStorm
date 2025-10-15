// ====== SERVIDOR NODE.JS PARA BRAIN GAMES STORM ======
// Instalar dependencias: npm install express socket.io cors

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos

const PORT = process.env.PORT || 3000;

// ====== ALMACENAMIENTO EN MEMORIA ======
const games = new Map(); // gameCode -> gameData
const players = new Map(); // playerId -> playerData
const gameRooms = new Map(); // gameCode -> Set of socket.ids

// ====== RUTAS API REST ======

app.post('/api/create-game', (req, res) => {
    try {
        const { quiz } = req.body;
        const gameCode = generateGameCode();
        
        const gameData = {
            gameCode,
            quiz,
            status: 'waiting',
            currentQuestion: 0,
            players: new Map(),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        };
        
        games.set(gameCode, gameData);
        gameRooms.set(gameCode, new Set());
        
        res.json({
            success: true,
            gameCode,
            quiz
        });
        
        console.log(`✅ Juego creado: ${gameCode}`);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/join-game', (req, res) => {
    try {
        const { gameCode, playerName, avatar } = req.body;
        
        const game = games.get(gameCode);
        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }
        
        if (game.expiresAt < new Date()) {
            return res.status(410).json({ error: 'Juego expirado' });
        }
        
        const playerId = generatePlayerId();
        const playerData = {
            id: playerId,
            name: playerName,
            avatar,
            score: 0,
            answers: [],
            joinedAt: new Date()
        };
        
        game.players.set(playerId, playerData);
        players.set(playerId, { ...playerData, gameCode });
        
        res.json({
            success: true,
            playerId,
            quiz: game.quiz,
            gameStatus: game.status
        });
        
        // Notificar a todos los clientes del juego
        io.to(gameCode).emit('player-joined', {
            player: playerData,
            totalPlayers: game.players.size
        });
        
        console.log(`👤 Jugador ${playerName} se unió al juego ${gameCode}`);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/game/:gameCode', (req, res) => {
    try {
        const gameCode = req.params.gameCode;
        const game = games.get(gameCode);
        
        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }
        
        res.json({
            success: true,
            game: {
                gameCode: game.gameCode,
                quiz: game.quiz,
                status: game.status,
                currentQuestion: game.currentQuestion,
                totalPlayers: game.players.size
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/players/:gameCode', (req, res) => {
    try {
        const gameCode = req.params.gameCode;
        const game = games.get(gameCode);
        
        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }
        
        const playersList = Array.from(game.players.values());
        
        res.json({
            success: true,
            players: playersList
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ====== WEBSOCKET PARA TIEMPO REAL ======

io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);
    
    // Unirse a sala de juego
    socket.on('join-game-room', (gameCode) => {
        socket.join(gameCode);
        
        if (!gameRooms.has(gameCode)) {
            gameRooms.set(gameCode, new Set());
        }
        gameRooms.get(gameCode).add(socket.id);
        
        console.log(`📡 Cliente ${socket.id} se unió a la sala ${gameCode}`);
    });
    
    // Profesor inicia el juego
    socket.on('start-game', (gameCode) => {
        const game = games.get(gameCode);
        if (game) {
            game.status = 'playing';
            game.currentQuestion = 0;
            
            io.to(gameCode).emit('game-started', {
                status: 'playing',
                currentQuestion: 0,
                question: game.quiz.questions[0]
            });
            
            console.log(`🚀 Juego iniciado: ${gameCode}`);
        }
    });
    
    // Siguiente pregunta
    socket.on('next-question', ({ gameCode, questionIndex }) => {
        const game = games.get(gameCode);
        if (game) {
            game.currentQuestion = questionIndex;
            
            if (questionIndex < game.quiz.questions.length) {
                io.to(gameCode).emit('new-question', {
                    currentQuestion: questionIndex,
                    question: game.quiz.questions[questionIndex]
                });
            } else {
                // Juego terminado
                game.status = 'finished';
                const rankings = Array.from(game.players.values())
                    .sort((a, b) => b.score - a.score);
                
                io.to(gameCode).emit('game-finished', {
                    status: 'finished',
                    rankings
                });
            }
        }
    });
    
    // Respuesta de jugador
    socket.on('submit-answer', ({ gameCode, playerId, questionIndex, answer, timeRemaining }) => {
        const game = games.get(gameCode);
        if (game && game.players.has(playerId)) {
            const player = game.players.get(playerId);
            const question = game.quiz.questions[questionIndex];
            
            // Calcular puntos
            let points = 0;
            if (answer === question.correctAnswer) {
                points = Math.max(100, Math.floor(100 * (timeRemaining / (question.timeLimit || 30))));
            }
            
            // Guardar respuesta
            player.answers[questionIndex] = {
                answer,
                timeRemaining,
                points,
                submittedAt: new Date()
            };
            player.score += points;
            
            // Notificar al profesor
            io.to(gameCode).emit('answer-submitted', {
                playerId,
                playerName: player.name,
                answer,
                points,
                totalScore: player.score
            });
            
            console.log(`💡 Respuesta enviada: ${player.name} - ${points} puntos`);
        }
    });
    
    // Desconexión
    socket.on('disconnect', () => {
        // Limpiar de todas las salas
        for (const [gameCode, socketSet] of gameRooms.entries()) {
            if (socketSet.has(socket.id)) {
                socketSet.delete(socket.id);
                if (socketSet.size === 0) {
                    gameRooms.delete(gameCode);
                }
            }
        }
        
        console.log('❌ Cliente desconectado:', socket.id);
    });
});

// ====== FUNCIONES AUXILIARES ======

function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ====== LIMPIEZA AUTOMÁTICA ======

setInterval(() => {
    const now = new Date();
    for (const [gameCode, game] of games.entries()) {
        if (game.expiresAt < now) {
            games.delete(gameCode);
            gameRooms.delete(gameCode);
            console.log(`🗑️ Juego expirado eliminado: ${gameCode}`);
        }
    }
}, 60 * 60 * 1000); // Cada hora

// ====== INICIAR SERVIDOR ======

server.listen(PORT, () => {
    console.log(`🚀 Servidor Brain Games Storm iniciado en http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready`);
});

// ====== MANEJO DE ERRORES ======

process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada:', reason);
});