// ====== CLIENTE PARA SERVIDOR REMOTO ======
// Este archivo conecta el frontend con cualquier servidor (Firebase, PHP, Node.js)

class RemoteGameClient {
    constructor(serverUrl, serverType = 'nodejs') {
        this.serverUrl = serverUrl;
        this.serverType = serverType; // 'firebase', 'php', 'nodejs'
        this.socket = null;
        this.gameCode = null;
        this.playerId = null;
        this.isConnected = false;
        
        this.initializeConnection();
    }
    
    initializeConnection() {
        if (this.serverType === 'nodejs') {
            // Conectar via Socket.IO
            if (typeof io !== 'undefined') {
                this.socket = io(this.serverUrl);
                this.setupSocketListeners();
            }
        }
        // Para PHP y Firebase se usan requests HTTP directos
    }
    
    setupSocketListeners() {
        if (!this.socket) return;
        
        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('✅ Conectado al servidor');
        });
        
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('❌ Desconectado del servidor');
        });
        
        this.socket.on('game-started', (data) => {
            if (window.onGameStarted) {
                window.onGameStarted(data);
            }
        });
        
        this.socket.on('new-question', (data) => {
            if (window.onNewQuestion) {
                window.onNewQuestion(data);
            }
        });
        
        this.socket.on('game-finished', (data) => {
            if (window.onGameFinished) {
                window.onGameFinished(data);
            }
        });
        
        this.socket.on('player-joined', (data) => {
            if (window.onPlayerJoined) {
                window.onPlayerJoined(data);
            }
        });
    }
    
    async createGame(quiz) {
        try {
            let response;
            
            if (this.serverType === 'nodejs') {
                response = await fetch(`${this.serverUrl}/api/create-game`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quiz })
                });
            } else if (this.serverType === 'php') {
                response = await fetch(`${this.serverUrl}/api.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'create_game', quiz })
                });
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.gameCode = data.gameCode;
                return data;
            } else {
                throw new Error(data.error || 'Error al crear juego');
            }
            
        } catch (error) {
            console.error('Error creando juego:', error);
            throw error;
        }
    }
    
    async joinGame(gameCode, playerName, avatar) {
        try {
            let response;
            
            if (this.serverType === 'nodejs') {
                response = await fetch(`${this.serverUrl}/api/join-game`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameCode, playerName, avatar })
                });
            } else if (this.serverType === 'php') {
                response = await fetch(`${this.serverUrl}/api.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'join_game', 
                        gameCode, 
                        playerName, 
                        avatar 
                    })
                });
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.gameCode = gameCode;
                this.playerId = data.playerId;
                
                // Unirse a la sala en tiempo real
                if (this.socket) {
                    this.socket.emit('join-game-room', gameCode);
                }
                
                return data;
            } else {
                throw new Error(data.error || 'Error al unirse al juego');
            }
            
        } catch (error) {
            console.error('Error uniéndose al juego:', error);
            throw error;
        }
    }
    
    async getGame(gameCode) {
        try {
            let response;
            
            if (this.serverType === 'nodejs') {
                response = await fetch(`${this.serverUrl}/api/game/${gameCode}`);
            } else if (this.serverType === 'php') {
                response = await fetch(`${this.serverUrl}/api.php?action=get_game&gameCode=${gameCode}`);
            }
            
            const data = await response.json();
            return data.success ? data.game : null;
            
        } catch (error) {
            console.error('Error obteniendo juego:', error);
            return null;
        }
    }
    
    async submitAnswer(questionIndex, answer, timeRemaining) {
        try {
            const points = this.calculatePoints(answer, timeRemaining);
            
            let response;
            
            if (this.serverType === 'nodejs') {
                // Enviar via WebSocket para tiempo real
                if (this.socket) {
                    this.socket.emit('submit-answer', {
                        gameCode: this.gameCode,
                        playerId: this.playerId,
                        questionIndex,
                        answer,
                        timeRemaining
                    });
                    return { success: true, points };
                }
            } else if (this.serverType === 'php') {
                response = await fetch(`${this.serverUrl}/api.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'submit_answer',
                        gameCode: this.gameCode,
                        playerId: this.playerId,
                        questionIndex,
                        answer,
                        timeRemaining,
                        points
                    })
                });
                
                return await response.json();
            }
            
        } catch (error) {
            console.error('Error enviando respuesta:', error);
            throw error;
        }
    }
    
    startGame() {
        if (this.socket && this.gameCode) {
            this.socket.emit('start-game', this.gameCode);
        }
    }
    
    nextQuestion(questionIndex) {
        if (this.socket && this.gameCode) {
            this.socket.emit('next-question', {
                gameCode: this.gameCode,
                questionIndex
            });
        }
    }
    
    calculatePoints(answer, timeRemaining) {
        // Lógica de puntuación similar a Kahoot
        if (answer === -1) return 0; // No respondió
        
        // Puntos base por respuesta correcta + bonus por velocidad
        const basePoints = 100;
        const timeBonus = Math.max(0, Math.floor(basePoints * (timeRemaining / 30)));
        
        return basePoints + timeBonus;
    }
}

// ====== INTEGRACIÓN CON BRAIN GAMES STORM ======

let remoteClient = null;

// Configuración del servidor (cambiar según tu setup)
const SERVER_CONFIGS = {
    // Opción 1: Servidor Node.js local
    local_nodejs: {
        url: 'http://localhost:3000',
        type: 'nodejs'
    },
    
    // Opción 2: Servidor Node.js en Heroku/Render
    heroku_nodejs: {
        url: 'https://tu-app.herokuapp.com',
        type: 'nodejs'
    },
    
    // Opción 3: Servidor PHP en hosting compartido
    php_hosting: {
        url: 'https://tu-dominio.com',
        type: 'php'
    },
    
    // Opción 4: Firebase (requiere configuración adicional)
    firebase: {
        url: 'https://braingamesstorm.firebaseapp.com',
        type: 'firebase'
    }
};

// Inicializar cliente remoto
function initializeRemoteClient(configName = 'local_nodejs') {
    const config = SERVER_CONFIGS[configName];
    if (!config) {
        console.error('Configuración de servidor no encontrada:', configName);
        return false;
    }
    
    try {
        remoteClient = new RemoteGameClient(config.url, config.type);
        console.log(`✅ Cliente remoto inicializado: ${config.url}`);
        return true;
    } catch (error) {
        console.error('Error inicializando cliente remoto:', error);
        return false;
    }
}

// Reemplazar funciones existentes para usar servidor remoto
function createRemoteGame(quizId) {
    if (!remoteClient) {
        alert('Cliente remoto no está inicializado');
        return;
    }
    
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    const statusDiv = document.getElementById('game-status') || createStatusDiv();
    statusDiv.innerHTML = '<p style="color: #0066cc;"><i class="fas fa-spinner fa-spin"></i> Creando juego en servidor remoto...</p>';
    
    remoteClient.createGame(quiz)
        .then(result => {
            const gameCode = result.gameCode;
            const studentURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + 
                              `student.html?server=remote&gameCode=${gameCode}`;
            
            showGameCreatedModal(gameCode, quiz.title, studentURL);
        })
        .catch(error => {
            statusDiv.innerHTML = `<p style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</p>`;
        });
}

function joinRemoteGame(gameCode, playerName, avatar) {
    if (!remoteClient) {
        // Inicializar cliente si no existe
        if (!initializeRemoteClient()) {
            alert('No se pudo conectar al servidor remoto');
            return;
        }
    }
    
    return remoteClient.joinGame(gameCode, playerName, avatar);
}

// Configurar callbacks para eventos del servidor
window.onGameStarted = function(data) {
    if (typeof showScreen === 'function') {
        showScreen('questionScreen');
        if (typeof displayQuestion === 'function') {
            displayQuestion();
        }
    }
};

window.onNewQuestion = function(data) {
    if (typeof displayQuestion === 'function') {
        currentQuestionIndex = data.currentQuestion;
        displayQuestion();
    }
};

window.onGameFinished = function(data) {
    if (typeof showResults === 'function') {
        showResults(data.rankings);
    }
};

window.onPlayerJoined = function(data) {
    console.log(`Jugador se unió: ${data.player.name}`);
    // Actualizar lista de jugadores si está visible
};

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Intentar inicializar cliente remoto
    setTimeout(() => {
        // Detectar si viene de un enlace remoto
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('server') === 'remote') {
            initializeRemoteClient();
        }
    }, 1000);
});

function showGameCreatedModal(gameCode, quizTitle, studentURL) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;';
    modal.innerHTML = 
        '<div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%;">' +
            '<h2 style="margin: 0 0 20px 0; color: #333; text-align: center;"><i class="fas fa-server"></i> ¡Juego en Servidor Remoto!</h2>' +
            '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">' +
                '<h1 style="font-size: 3em; margin: 10px 0;">Código: ' + gameCode + '</h1>' +
                '<p style="margin: 0; font-size: 18px;">Cuestionario: ' + quizTitle + '</p>' +
            '</div>' +
            '<div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">' +
                '<h4 style="margin: 0 0 10px 0; color: #4caf50;"><i class="fas fa-check-circle"></i> ¡Funciona desde cualquier dispositivo!</h4>' +
                '<p style="margin: 0; color: #333;">Los estudiantes pueden acceder desde cualquier red, PC o celular del mundo.</p>' +
            '</div>' +
            '<textarea readonly style="width: 100%; height: 80px; margin: 10px 0; padding: 10px; border: 2px solid #667eea; border-radius: 5px; font-size: 12px;">' + studentURL + '</textarea>' +
            '<div style="text-align: center; margin: 20px 0;">' +
                '<button onclick="copyToClipboard(\'' + studentURL + '\')" style="background: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 5px;"><i class="fas fa-copy"></i> Copiar Enlace</button>' +
                '<button onclick="remoteClient.startGame()" style="background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 5px;"><i class="fas fa-play"></i> Iniciar Juego</button>' +
            '</div>' +
            '<button onclick="this.closest(\'div\').closest(\'div\').remove()" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cerrar</button>' +
        '</div>';
    
    document.body.appendChild(modal);
}