// Sistema de códigos QR funcional - Compatible con dispositivos múltiples
// Usa combinación de localStorage + URL params para máxima compatibilidad

// ====== SISTEMA HÍBRIDO: CÓDIGOS + URLs ======

function createGameCode() {
    // Generar código de 6 dígitos
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function startQuizWithQR(quizId) {
    try {
        const quiz = getQuizById(quizId);
        if (!quiz) {
            alert('Cuestionario no encontrado');
            return;
        }

        // Generar código simple
        const gameCode = createGameCode();
        
        // Crear URL que incluye el quiz completo en los parámetros
        const baseURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        const gameURL = `${baseURL}join.html?code=${gameCode}&quiz=${encodeURIComponent(JSON.stringify(quiz))}`;
        
        // Guardar también en localStorage como backup
        localStorage.setItem(`game_${gameCode}`, JSON.stringify({
            quiz: quiz,
            players: [],
            status: 'waiting',
            currentQuestion: 0,
            results: [],
            createdAt: new Date().toISOString()
        }));

        // Mostrar modal con código QR funcional
        showQRGameModal(gameURL, gameCode, quiz.title);
        
    } catch (error) {
        console.error('Error al crear el juego:', error);
        alert('Error al crear el juego');
    }
}

function showQRGameModal(gameURL, gameCode, quizTitle) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-qrcode"></i> Código del Juego</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <h3>${quizTitle}</h3>
                
                <div class="game-code-display">
                    <h1 style="font-size: 3em; color: #667eea; margin: 20px 0;">${gameCode}</h1>
                    <p><strong>Los estudiantes pueden:</strong></p>
                    <ul style="text-align: left; margin: 20px 0;">
                        <li>🌐 Ir a: <strong>alidiazsr.github.io/BrainGamesStorm</strong></li>
                        <li>🔢 Ingresar el código: <strong>${gameCode}</strong></li>
                        <li>📱 O escanear este código QR:</li>
                    </ul>
                </div>
                
                <div class="qr-container">
                    <div id="qrCode"></div>
                </div>
                
                <div class="url-container">
                    <label>URL directa (opcional):</label>
                    <input type="text" id="gameURLInput" value="${gameURL}" readonly>
                    <button class="btn btn-primary" onclick="copyGameURL()">
                        <i class="fas fa-copy"></i> Copiar URL
                    </button>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cerrar
                    </button>
                    <button class="btn btn-primary" onclick="openTeacherControl('${gameCode}')">
                        <i class="fas fa-play"></i> Abrir Control del Profesor
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generar código QR que apunte a la página principal con el código
    const qrURL = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '/index.html')}?code=${gameCode}`;
    generateQRCode(qrURL);
}

function generateQRCode(url) {
    const qrContainer = document.getElementById('qrCode');
    const qrAPIURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    qrContainer.innerHTML = `<img src="${qrAPIURL}" alt="Código QR" style="max-width: 200px; border: 1px solid #ddd; border-radius: 8px;">`;
}

function copyGameURL() {
    const input = document.getElementById('gameURLInput');
    input.select();
    document.execCommand('copy');
    
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
    btn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
    }, 2000);
}

function openTeacherControl(gameCode) {
    // Abrir control del profesor
    const controlURL = `teacher.html?code=${gameCode}`;
    window.open(controlURL, '_blank', 'width=1200,height=800');
}

// ====== FUNCIONES PARA UNIRSE AL JUEGO ======

function joinGameByCode(gameCode) {
    // Intentar encontrar el juego en localStorage primero
    const gameData = localStorage.getItem(`game_${gameCode}`);
    if (gameData) {
        return JSON.parse(gameData);
    }
    
    // Si no está en localStorage, el código no es válido para este dispositivo
    return null;
}

function addPlayerToGame(gameCode, playerName, avatar) {
    const gameData = localStorage.getItem(`game_${gameCode}`);
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
    localStorage.setItem(`game_${gameCode}`, JSON.stringify(game));
    
    return playerId;
}

// ====== INTEGRACIÓN CON SISTEMA EXISTENTE ======

// Actualizar la función original para usar el sistema QR
function startQuizWithURL(quizId) {
    // Usar el nuevo sistema de códigos QR
    startQuizWithQR(quizId);
}

// ====== ESTILOS CSS PARA EL MODAL ======

function addQRModalStyles() {
    const styles = `
        <style id="qrModalStyles">
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
            max-width: 600px;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px 15px 0 0;
        }
        
        .modal-header h2 {
            margin: 0;
        }
        
        .close-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
        }
        
        .modal-body {
            padding: 30px;
            text-align: center;
        }
        
        .game-code-display {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .qr-container {
            margin: 30px 0;
        }
        
        .url-container {
            margin: 20px 0;
            text-align: left;
        }
        
        .url-container label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .url-container input {
            width: 70%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
        }
        
        .url-container button {
            width: 28%;
            margin-left: 2%;
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        </style>
    `;
    
    if (!document.getElementById('qrModalStyles')) {
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Inicializar estilos cuando se carga el script
document.addEventListener('DOMContentLoaded', addQRModalStyles);