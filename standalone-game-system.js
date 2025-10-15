// Sistema de URLs autónomas - Funciona sin localStorage compartido
// Los estudiantes acceden directamente con toda la información en la URL

// ====== SISTEMA URL AUTÓNOMO ======

function createStandaloneGameCode() {
    // Generar código de 6 dígitos
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function startQuizWithStandaloneURL(quizId) {
    try {
        const quiz = getQuizById(quizId);
        if (!quiz) {
            alert('Cuestionario no encontrado');
            return;
        }

        // Generar código simple
        const gameCode = createStandaloneGameCode();
        
        // Crear URL que incluye TODO el quiz codificado
        const quizData = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description || '',
            timeLimit: quiz.timeLimit || 30,
            questions: quiz.questions
        };
        
        const encodedQuiz = btoa(JSON.stringify(quizData)); // Base64 encode
        const baseURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        const studentURL = baseURL + 'student.html?gameCode=' + gameCode + '&quizData=' + encodedQuiz;
        
        // Guardar localmente SOLO para el profesor (control del juego)
        const teacherGameData = {
            gameCode: gameCode,
            quiz: quiz,
            players: [],
            status: 'waiting',
            currentQuestion: 0,
            results: [],
            createdAt: new Date().toISOString(),
            studentURL: studentURL
        };
        
        localStorage.setItem('teacherGame_' + gameCode, JSON.stringify(teacherGameData));
        
        // Mostrar modal con código e instrucciones
        showStandaloneGameModal(studentURL, gameCode, quiz.title);
        
    } catch (error) {
        console.error('Error al crear el juego:', error);
        alert('Error al crear el juego: ' + error.message);
    }
}

function showStandaloneGameModal(studentURL, gameCode, quizTitle) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = 
        '<div class="modal-content">' +
            '<div class="modal-header">' +
                '<h2><i class="fas fa-qrcode"></i> Juego Creado</h2>' +
                '<button class="close-btn" onclick="this.closest(\'.modal-overlay\').remove()">×</button>' +
            '</div>' +
            '<div class="modal-body">' +
                '<h3>' + quizTitle + '</h3>' +
                '<div class="game-code-display">' +
                    '<h1 style="font-size: 3em; color: #667eea; margin: 20px 0;">Código: ' + gameCode + '</h1>' +
                    '<p><strong>IMPORTANTE: Los estudiantes deben usar este enlace directo:</strong></p>' +
                '</div>' +
                '<div class="url-container">' +
                    '<label><strong>Enlace para estudiantes:</strong></label>' +
                    '<textarea id="studentURLInput" readonly style="width: 100%; height: 80px; margin: 10px 0; padding: 10px; border: 2px solid #667eea; border-radius: 5px; font-family: monospace; font-size: 12px; resize: vertical;">' + studentURL + '</textarea>' +
                    '<button class="btn btn-primary" onclick="copyStudentURL()" style="width: 100%; margin: 10px 0;">' +
                        '<i class="fas fa-copy"></i> Copiar Enlace para Estudiantes' +
                    '</button>' +
                '</div>' +
                '<div class="qr-container">' +
                    '<p><strong>O escanear este código QR:</strong></p>' +
                    '<div id="qrCode"></div>' +
                '</div>' +
                '<div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">' +
                    '<h4 style="margin: 0 0 10px 0; color: #667eea;"><i class="fas fa-info-circle"></i> Instrucciones:</h4>' +
                    '<ol style="margin: 0; padding-left: 20px;">' +
                        '<li><strong>Comparte el enlace</strong> con tus estudiantes (WhatsApp, email, etc.)</li>' +
                        '<li><strong>O muestra el código QR</strong> para que lo escaneen</li>' +
                        '<li><strong>Los estudiantes acceden directamente</strong> - no necesitan código</li>' +
                        '<li><strong>Una vez que se conecten</strong>, inicia el juego desde el control</li>' +
                    '</ol>' +
                '</div>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-secondary" onclick="this.closest(\'.modal-overlay\').remove()">' +
                        'Cerrar' +
                    '</button>' +
                    '<button class="btn btn-primary" onclick="openTeacherGameControl(\'' + gameCode + '\')">' +
                        '<i class="fas fa-play"></i> Abrir Control del Juego' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    // Generar código QR
    generateQRForStudents(studentURL);
}

function copyStudentURL() {
    const textarea = document.getElementById('studentURLInput');
    textarea.select();
    document.execCommand('copy');
    
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Enlace Copiado!';
    btn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
    }, 3000);
}

function generateQRForStudents(url) {
    const qrContainer = document.getElementById('qrCode');
    const qrAPIURL = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);
    qrContainer.innerHTML = '<img src="' + qrAPIURL + '" alt="Código QR" style="max-width: 200px; border: 1px solid #ddd; border-radius: 8px;">';
}

function openTeacherGameControl(gameCode) {
    // Abrir control del profesor
    const controlURL = 'admin-control.html?teacherCode=' + gameCode;
    window.open(controlURL, '_blank', 'width=1200,height=800');
}

// ====== FUNCIONES PARA ESTUDIANTES ======

function joinStandaloneGame() {
    try {
        // Obtener datos del quiz desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameCode = urlParams.get('gameCode');
        const encodedQuizData = urlParams.get('quizData');
        
        if (!gameCode || !encodedQuizData) {
            alert('URL de juego inválida. Solicita el enlace correcto al profesor.');
            return null;
        }
        
        // Decodificar quiz data
        const quizData = JSON.parse(atob(encodedQuizData));
        
        return {
            gameCode: gameCode,
            quiz: quizData,
            players: [],
            status: 'waiting',
            currentQuestion: 0,
            results: []
        };
        
    } catch (error) {
        console.error('Error al unirse al juego:', error);
        alert('Error al cargar el juego. Verifica el enlace proporcionado por el profesor.');
        return null;
    }
}

function addPlayerToStandaloneGame(gameCode, playerName, avatar) {
    try {
        // En el sistema autónomo, cada estudiante maneja sus propios datos
        const playerId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        // Guardar datos del jugador localmente
        const playerData = {
            id: playerId,
            name: playerName,
            avatar: avatar,
            gameCode: gameCode,
            score: 0,
            answers: [],
            joinedAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentPlayer', JSON.stringify(playerData));
        
        return playerId;
    } catch (error) {
        console.error('Error al agregar jugador:', error);
        return null;
    }
}

// ====== INTEGRACIÓN CON SISTEMA EXISTENTE ======

// Reemplazar las funciones originales
function startQuizWithQR(quizId) {
    startQuizWithStandaloneURL(quizId);
}

function startQuizWithURL(quizId) {
    startQuizWithStandaloneURL(quizId);
}

// ====== FUNCIONES DE COMPATIBILIDAD ======

function getActiveGameStandalone(gameCode) {
    // Para estudiantes: cargar desde URL
    if (window.location.pathname.includes('student.html')) {
        return joinStandaloneGame();
    }
    
    // Para profesor: cargar desde localStorage local
    const teacherGameData = localStorage.getItem('teacherGame_' + gameCode);
    if (teacherGameData) {
        return JSON.parse(teacherGameData);
    }
    
    return null;
}

function updateActiveGameStandalone(gameCode, gameData) {
    // Solo el profesor puede actualizar el estado del juego
    const teacherGameData = localStorage.getItem('teacherGame_' + gameCode);
    if (teacherGameData) {
        const updatedGame = { ...JSON.parse(teacherGameData), ...gameData };
        localStorage.setItem('teacherGame_' + gameCode, JSON.stringify(updatedGame));
        return updatedGame;
    }
    return null;
}

// Estilos adicionales para el modal mejorado
function addStandaloneModalStyles() {
    const styles = document.createElement('style');
    styles.innerHTML = `
        .url-container textarea {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            word-break: break-all;
        }
        
        .modal-content {
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .game-code-display {
            background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .qr-container {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(styles);
}

// Inicializar estilos
document.addEventListener('DOMContentLoaded', addStandaloneModalStyles);