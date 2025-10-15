// Sistema de juegos por URL - Funciona sin servidor
// Reemplaza el sistema de códigos por URLs compartibles

// ====== FUNCIONES PRINCIPALES ======

function createGameURL(quizId) {
    // Crear una URL única para el juego
    const gameId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const baseURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
    return `${baseURL}game.html?quiz=${quizId}&game=${gameId}`;
}

function startQuizWithURL(quizId) {
    try {
        const quiz = getQuizById(quizId);
        if (!quiz) {
            alert('Cuestionario no encontrado');
            return;
        }

        // Crear URL del juego
        const gameURL = createGameURL(quizId);
        
        // Guardar el quiz en localStorage con el ID del juego
        const urlParams = new URLSearchParams(gameURL.split('?')[1]);
        const gameId = urlParams.get('game');
        
        localStorage.setItem(`game_${gameId}`, JSON.stringify({
            quiz: quiz,
            players: [],
            status: 'waiting',
            currentQuestion: 0,
            results: [],
            createdAt: new Date().toISOString()
        }));

        // Mostrar modal con URL compartible
        showGameURLModal(gameURL, quiz.title);
        
    } catch (error) {
        console.error('Error al crear el juego:', error);
        alert('Error al crear el juego');
    }
}

function showGameURLModal(gameURL, quizTitle) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-link"></i> Enlace del Juego</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <h3>${quizTitle}</h3>
                <p>Comparte este enlace con tus estudiantes:</p>
                
                <div class="url-container">
                    <input type="text" id="gameURLInput" value="${gameURL}" readonly>
                    <button class="btn btn-primary" onclick="copyGameURL()">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
                
                <div class="qr-container">
                    <div id="qrCode"></div>
                    <p>O escanea el código QR</p>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cerrar
                    </button>
                    <button class="btn btn-primary" onclick="openGameControl('${gameURL}')">
                        <i class="fas fa-play"></i> Ir al Control del Juego
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generar código QR
    generateQRCode(gameURL);
    
    // Seleccionar la URL para facilitar la copia
    document.getElementById('gameURLInput').select();
}

function copyGameURL() {
    const input = document.getElementById('gameURLInput');
    input.select();
    document.execCommand('copy');
    
    // Mostrar confirmación
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
    btn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
    }, 2000);
}

function generateQRCode(url) {
    // Implementación simple de QR code usando API externa
    const qrContainer = document.getElementById('qrCode');
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    qrContainer.innerHTML = `<img src="${qrURL}" alt="QR Code" style="max-width: 200px;">`;
}

function openGameControl(gameURL) {
    // Abrir la página de control del juego en una nueva pestaña
    window.open(gameURL.replace('game.html', 'teacher-control.html'), '_blank');
}

// ====== FUNCIONES DE JUEGO ======

function joinGameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    const gameId = urlParams.get('game');
    
    if (!quizId || !gameId) {
        alert('URL de juego inválida');
        window.location.href = 'index.html';
        return;
    }
    
    // Buscar el juego en localStorage
    const gameData = localStorage.getItem(`game_${gameId}`);
    if (!gameData) {
        alert('Juego no encontrado o expirado');
        window.location.href = 'index.html';
        return;
    }
    
    const game = JSON.parse(gameData);
    return game;
}

function addPlayerToURL(gameId, playerName, avatar) {
    const gameData = localStorage.getItem(`game_${gameId}`);
    if (!gameData) return null;
    
    const game = JSON.parse(gameData);
    
    // Verificar si el jugador ya existe
    const existingPlayer = game.players.find(p => p.name === playerName);
    if (existingPlayer) {
        return existingPlayer.id;
    }
    
    // Agregar nuevo jugador
    const playerId = Date.now().toString();
    game.players.push({
        id: playerId,
        name: playerName,
        avatar: avatar,
        score: 0,
        answers: [],
        joinedAt: new Date().toISOString()
    });
    
    // Guardar cambios
    localStorage.setItem(`game_${gameId}`, JSON.stringify(game));
    
    return playerId;
}

// ====== ESTILOS CSS ======

function addGameURLStyles() {
    const styles = `
        <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #333;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 30px;
            height: 30px;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .url-container {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        
        .url-container input {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
        }
        
        .qr-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .qr-container img {
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        </style>
    `;
    
    if (!document.getElementById('gameURLStyles')) {
        document.head.insertAdjacentHTML('beforeend', styles.replace('<style>', '<style id="gameURLStyles">'));
    }
}

// Inicializar estilos cuando se carga el script
document.addEventListener('DOMContentLoaded', addGameURLStyles);