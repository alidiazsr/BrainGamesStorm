// ====== SISTEMA DE FIREBASE PARA MÚLTIPLES DISPOSITIVOS ======
// Este sistema permite que funcione desde cualquier red/dispositivo

// Configuración de Firebase (tu proyecto real)
const firebaseConfig = {
    apiKey: "AIzaSyDLIQ_kPXmplHgaJvvtVDgSpTxVoAgisjA",
    authDomain: "braingamesstorm.firebaseapp.com",
    databaseURL: "https://braingamesstorm-default-rtdb.firebaseio.com",
    projectId: "braingamesstorm",
    storageBucket: "braingamesstorm.firebasestorage.app",
    messagingSenderId: "408925735981",
    appId: "1:408925735981:web:d39d3daa13f44408547ca4"
};

// Variables globales de Firebase
let db = null;
let isFirebaseInitialized = false;
window.firebaseConfigured = false;

// ====== INICIALIZACIÓN DE FIREBASE ======

function initializeFirebase() {
    try {
        // Verificar si Firebase ya está cargado
        if (typeof firebase === 'undefined') {
            console.log('🔄 Cargando Firebase SDK...');
            loadFirebaseScripts();
            return false;
        }

        // Inicializar Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('🔥 Firebase inicializado con proyecto:', firebaseConfig.projectId);
        }
        
        // Obtener referencia a la base de datos
        db = firebase.database();
        isFirebaseInitialized = true;
        window.firebaseConfigured = true;
        
        console.log('✅ Firebase listo para usar');
        showFirebaseReadyMessage();
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        return false;
    }
}

function loadFirebaseScripts() {
    // Cargar Firebase SDK si no está presente
    const scripts = [
        'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js'
    ];
    
    let loaded = 0;
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loaded++;
            if (loaded === scripts.length) {
                console.log('✅ Firebase SDK cargado');
                setTimeout(() => {
                    initializeFirebase();
                }, 500);
            }
        };
        script.onerror = () => {
            console.error('❌ Error cargando Firebase SDK:', src);
        };
        document.head.appendChild(script);
    });
}

function showFirebaseReadyMessage() {
    const message = document.createElement('div');
    message.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4caf50; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000; font-weight: 600; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);';
    message.innerHTML = '🔥 ¡Firebase conectado! Sistema listo para múltiples dispositivos';
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (document.body.contains(message)) {
            document.body.removeChild(message);
        }
    }, 4000);
}

// ====== FUNCIONES DE JUEGO CON FIREBASE ======

async function createFirebaseGame(quizId) {
    try {
        const quiz = getQuizById(quizId);
        if (!quiz) {
            alert('Cuestionario no encontrado');
            return null;
        }

        // Generar código único
        const gameCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        
        // Crear datos del juego
        const gameData = {
            gameCode: gameCode,
            quiz: quiz,
            players: {},
            status: 'waiting',
            currentQuestion: 0,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
            teacherOnline: true,
            lastActivity: new Date().toISOString()
        };

        if (isFirebaseInitialized && db) {
            // Guardar en Firebase
            await db.ref('games/' + gameCode).set(gameData);
            console.log('✅ Juego guardado en Firebase:', gameCode);
        } else {
            // Fallback: localStorage
            localStorage.setItem('game_' + gameCode, JSON.stringify(gameData));
            console.log('⚠️ Juego guardado localmente:', gameCode);
        }

        return gameData;
        
    } catch (error) {
        console.error('Error al crear juego:', error);
        throw error;
    }
}

async function joinFirebaseGame(gameCode, playerName, avatar) {
    try {
        let gameData = null;
        
        if (isFirebaseInitialized && db) {
            // Obtener de Firebase
            const snapshot = await db.ref('games/' + gameCode).once('value');
            gameData = snapshot.val();
        } else {
            // Fallback: localStorage
            const stored = localStorage.getItem('game_' + gameCode);
            if (stored) {
                gameData = JSON.parse(stored);
            }
        }
        
        if (!gameData) {
            throw new Error('Juego no encontrado');
        }
        
        // Verificar si el juego ha expirado
        if (gameData.expiresAt && new Date() > new Date(gameData.expiresAt)) {
            throw new Error('El juego ha expirado');
        }
        
        // Crear jugador
        const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const playerData = {
            id: playerId,
            name: playerName,
            avatar: avatar,
            score: 0,
            answers: [],
            joinedAt: new Date().toISOString(),
            online: true
        };
        
        // Agregar jugador al juego
        if (!gameData.players) {
            gameData.players = {};
        }
        gameData.players[playerId] = playerData;
        
        if (isFirebaseInitialized && db) {
            // Actualizar en Firebase
            await db.ref('games/' + gameCode + '/players/' + playerId).set(playerData);
            console.log('✅ Jugador agregado en Firebase');
        } else {
            // Fallback: localStorage
            localStorage.setItem('game_' + gameCode, JSON.stringify(gameData));
            console.log('⚠️ Jugador agregado localmente');
        }
        
        return { gameData, playerId };
        
    } catch (error) {
        console.error('Error al unirse al juego:', error);
        throw error;
    }
}

async function getFirebaseGame(gameCode) {
    try {
        if (isFirebaseInitialized && db) {
            const snapshot = await db.ref('games/' + gameCode).once('value');
            return snapshot.val();
        } else {
            const stored = localStorage.getItem('game_' + gameCode);
            return stored ? JSON.parse(stored) : null;
        }
    } catch (error) {
        console.error('Error al obtener juego:', error);
        return null;
    }
}

async function updateGameStatus(gameCode, status, currentQuestion = null) {
    try {
        const updates = {
            status: status,
            lastActivity: new Date().toISOString()
        };
        
        if (currentQuestion !== null) {
            updates.currentQuestion = currentQuestion;
        }
        
        if (isFirebaseInitialized && db) {
            await db.ref('games/' + gameCode).update(updates);
            console.log('✅ Estado actualizado en Firebase');
        } else {
            const stored = localStorage.getItem('game_' + gameCode);
            if (stored) {
                const gameData = JSON.parse(stored);
                Object.assign(gameData, updates);
                localStorage.setItem('game_' + gameCode, JSON.stringify(gameData));
            }
            console.log('⚠️ Estado actualizado localmente');
        }
        
    } catch (error) {
        console.error('Error al actualizar estado:', error);
    }
}

// ====== LISTENERS EN TIEMPO REAL ======

function listenToGameChanges(gameCode, callback) {
    if (isFirebaseInitialized && db) {
        // Listener de Firebase en tiempo real
        const gameRef = db.ref('games/' + gameCode);
        gameRef.on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData && callback) {
                callback(gameData);
            }
        });
        
        return () => gameRef.off(); // Función para limpiar listener
    } else {
        // Fallback: polling cada 2 segundos
        const interval = setInterval(() => {
            const stored = localStorage.getItem('game_' + gameCode);
            if (stored && callback) {
                callback(JSON.parse(stored));
            }
        }, 2000);
        
        return () => clearInterval(interval); // Función para limpiar interval
    }
}

// ====== INTEGRACIÓN CON ADMIN PANEL ======

function createStatusDiv() {
    // Crear div de estado si no existe
    let statusDiv = document.getElementById('game-status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'game-status';
        statusDiv.style.cssText = 'margin: 20px 0; padding: 15px; border-radius: 8px; background: #f8f9fa;';
        
        // Buscar un lugar para insertarlo
        const quizList = document.getElementById('quizList');
        const adminPanel = document.querySelector('.admin-panel');
        
        if (quizList && quizList.parentNode) {
            quizList.parentNode.insertBefore(statusDiv, quizList);
        } else if (adminPanel) {
            adminPanel.appendChild(statusDiv);
        } else {
            document.body.appendChild(statusDiv);
        }
    }
    return statusDiv;
}

function startQuizWithFirebase(quizId) {
    console.log('🔥 startQuizWithFirebase iniciado para quiz:', quizId);
    
    // Mostrar mensaje de carga
    const statusDiv = document.getElementById('game-status') || createStatusDiv();
    statusDiv.innerHTML = '<p style="color: #0066cc;"><i class="fas fa-spinner fa-spin"></i> Creando juego en la nube...</p>';
    
    console.log('📝 Mensaje de carga mostrado');
    
    createFirebaseGame(quizId)
        .then(gameData => {
            console.log('✅ Juego Firebase creado:', gameData);
            
            if (!gameData) {
                throw new Error('No se pudo crear el juego');
            }
            
            const gameCode = gameData.gameCode;
            const quiz = gameData.quiz;
            
            // Crear URL para estudiantes
            const baseURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
            const studentURL = baseURL + 'student.html?gameCode=' + gameCode;
            
            // Mostrar resultado exitoso
            statusDiv.innerHTML = 
                '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">' +
                    '<h2 style="margin: 0 0 15px 0; font-size: 2.5em;"><i class="fas fa-cloud"></i> ¡Juego en la Nube!</h2>' +
                    '<h1 style="font-size: 4em; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">' + gameCode + '</h1>' +
                    '<p style="font-size: 1.3em; margin: 15px 0; opacity: 0.9;">Cuestionario: <strong>' + quiz.title + '</strong></p>' +
                    '<p style="font-size: 1.1em; margin: 15px 0; opacity: 0.8;">Funciona desde cualquier dispositivo/red</p>' +
                '</div>' +
                
                '<div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid #e9ecef; margin: 20px 0;">' +
                    '<h3 style="margin: 0 0 15px 0; color: #333; text-align: center;"><i class="fas fa-qrcode"></i> Código QR para Estudiantes</h3>' +
                    '<div id="qrcode" style="display: flex; justify-content: center; margin: 20px 0;"></div>' +
                    '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007bff;">' +
                        '<p style="margin: 0; font-size: 14px; color: #666;"><strong>URL para estudiantes:</strong></p>' +
                        '<input type="text" value="' + studentURL + '" readonly style="width: 100%; padding: 8px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; background: white;">' +
                        '<button onclick="copyToClipboard(\'' + studentURL + '\')" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;"><i class="fas fa-copy"></i> Copiar URL</button>' +
                    '</div>' +
                '</div>' +
                
                '<div style="text-align: center; margin: 25px 0;">' +
                    '<button onclick="openGameControl(\'' + gameCode + '\')" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 18px; cursor: pointer; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); transition: all 0.3s ease;"><i class="fas fa-play-circle"></i> Abrir Control del Juego</button>' +
                '</div>';
            
            // Generar QR Code
            setTimeout(() => {
                if (typeof QRCode !== 'undefined') {
                    const qrContainer = document.getElementById('qrcode');
                    if (qrContainer) {
                        new QRCode(qrContainer, {
                            text: studentURL,
                            width: 200,
                            height: 200,
                            colorDark: "#000000",
                            colorLight: "#ffffff"
                        });
                    }
                }
            }, 100);
            
        })
        .catch(error => {
            console.error('Error:', error);
            statusDiv.innerHTML = '<p style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i> Error: ' + error.message + '</p>';
        });
}

// ====== FUNCIONES DE UTILIDAD ======

function openGameControl(gameCode) {
    const controlURL = 'admin-control.html?gameCode=' + gameCode;
    window.open(controlURL, 'GameControl', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('¡Enlace copiado al portapapeles!');
        });
    } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('¡Enlace copiado!');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000; font-weight: 600;';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// ====== AUTO-INICIALIZACIÓN ======

document.addEventListener('DOMContentLoaded', function() {
    // Intentar inicializar Firebase automáticamente
    console.log('🔄 Iniciando sistema Firebase...');
    setTimeout(() => {
        initializeFirebase();
    }, 1000);
});

// ====== FUNCIONES PÚBLICAS ======

window.initializeFirebase = initializeFirebase;
window.startQuizWithFirebase = startQuizWithFirebase;