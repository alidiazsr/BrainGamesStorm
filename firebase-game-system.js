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
        console.log('🔥 Iniciando inicialización Firebase...');
        console.log('- typeof firebase:', typeof firebase);
        console.log('- window.firebase:', typeof window.firebase);
        
        // Verificar si Firebase ya está cargado
        if (typeof firebase === 'undefined' && typeof window.firebase === 'undefined') {
            console.log('🔄 Firebase SDK no disponible, cargando scripts...');
            loadFirebaseScripts();
            return false;
        }

        // Usar firebase global o window.firebase
        const firebaseApp = firebase || window.firebase;
        console.log('🔥 Firebase SDK encontrado:', !!firebaseApp);

        // Inicializar Firebase si no está inicializado
        if (!firebaseApp.apps || !firebaseApp.apps.length) {
            console.log('🔧 Inicializando app Firebase...');
            firebaseApp.initializeApp(firebaseConfig);
            console.log('✅ Firebase app inicializada');
        } else {
            console.log('✅ Firebase app ya existía');
        }
        
        // Obtener referencia a la base de datos
        db = firebaseApp.database();
        isFirebaseInitialized = true;
        window.firebaseConfigured = true;
        
        console.log('✅ Firebase completamente listo');
        console.log('- db:', !!db);
        console.log('- isFirebaseInitialized:', isFirebaseInitialized);
        console.log('- window.firebaseConfigured:', window.firebaseConfigured);
        
        showFirebaseReadyMessage();
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        window.firebaseConfigured = false;
        return false;
    }
}

function loadFirebaseScripts() {
    console.log('📦 Cargando Firebase SDK...');
    
    // Verificar si ya hay scripts Firebase cargándose
    if (document.querySelector('script[src*="firebase"]')) {
        console.log('📦 Scripts Firebase ya en proceso de carga');
        return;
    }
    
    // Cargar Firebase SDK si no está presente
    const scripts = [
        'https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.15.0/firebase-database-compat.js'
    ];
    
    let loaded = 0;
    const totalScripts = scripts.length;
    
    scripts.forEach((src, index) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loaded++;
            console.log(`📦 Script ${index + 1}/${totalScripts} cargado: ${src.split('/').pop()}`);
            
            if (loaded === totalScripts) {
                console.log('✅ Todos los scripts Firebase cargados');
                // Intentar inicializar después de cargar todos los scripts
                setTimeout(() => {
                    console.log('🔄 Reintentando inicialización después de cargar scripts...');
                    attemptFirebaseInitialization();
                }, 500);
            }
        };
        script.onerror = (error) => {
            console.error('❌ Error cargando Firebase SDK:', src, error);
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

// Función para validar configuración Firebase
async function validateFirebaseConfig() {
    try {
        console.log('🔍 Validando configuración Firebase...');
        
        if (!firebase || !firebase.database) {
            throw new Error('Firebase SDK no cargado');
        }
        
        // Intentar una operación simple de lectura/escritura
        const testRef = firebase.database().ref('games/.test');
        const testData = { timestamp: Date.now() };
        
        await testRef.set(testData);
        console.log('✅ Escritura Firebase exitosa');
        
        const snapshot = await testRef.once('value');
        if (snapshot.val()) {
            console.log('✅ Lectura Firebase exitosa');
            await testRef.remove(); // Limpiar
            return true;
        } else {
            throw new Error('No se pudo leer de Firebase');
        }
        
    } catch (error) {
        console.error('❌ Error validación Firebase:', error);
        
        // Mostrar mensaje específico según el error
        if (error.code === 'PERMISSION_DENIED' || error.message.includes('permission')) {
            showFirebaseRulesError();
        } else {
            showFirebaseConnectionError();
        }
        
        return false;
    }
}

// Mostrar error específico de reglas Firebase
function showFirebaseRulesError() {
    const messageDiv = createStatusDiv();
    messageDiv.innerHTML = `
        <div style="background: #f44336; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🔧 Configuración Firebase Requerida</h3>
            <p><strong>Las reglas de Firebase necesitan configuración.</strong></p>
            <p>📋 <strong>Pasos para solucionar:</strong></p>
            <ol style="text-align: left; margin: 10px 0; padding-left: 20px;">
                <li>Ve a: <a href="https://console.firebase.google.com/project/braingamesstorm/database/braingamesstorm-default-rtdb/rules" target="_blank" style="color: #ffeb3b;">Consola Firebase</a></li>
                <li>Reemplaza las reglas por:</li>
            </ol>
            <div style="background: #333; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; font-size: 12px;">
{<br>
&nbsp;&nbsp;"rules": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"games": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"$gameCode": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".read": true,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".write": true<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;}<br>
}
            </div>
            <p>3. Haz clic en <strong>"Publicar"</strong></p>
            <p>4. Recarga esta página</p>
        </div>
    `;
}

// Mostrar error de conexión Firebase
function showFirebaseConnectionError() {
    const messageDiv = createStatusDiv();
    messageDiv.innerHTML = `
        <div style="background: #ff9800; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🌐 Problema de Conexión Firebase</h3>
            <p><strong>No se pudo conectar a Firebase.</strong></p>
            <p>📋 <strong>Verifica:</strong></p>
            <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
                <li>Conexión a internet estable</li>
                <li>Firebase no bloqueado por firewall</li>
                <li>Recarga la página</li>
            </ul>
            <button onclick="location.reload()" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                🔄 Recargar Página
            </button>
        </div>
    `;
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

async function startQuizWithFirebase(quizId) {
    console.log('🔥 startQuizWithFirebase iniciado para quiz:', quizId);
    
    // Mostrar mensaje de carga
    const statusDiv = document.getElementById('game-status') || createStatusDiv();
    statusDiv.innerHTML = '<p style="color: #0066cc;"><i class="fas fa-spinner fa-spin"></i> Validando Firebase...</p>';
    
    try {
        // Primero validar que Firebase esté configurado correctamente
        const isFirebaseValid = await validateFirebaseConfig();
        if (!isFirebaseValid) {
            console.log('❌ Firebase no válido, no se puede continuar');
            return; // El error ya se mostró en validateFirebaseConfig
        }
        
        // Si Firebase es válido, continuar con la creación del juego
        statusDiv.innerHTML = '<p style="color: #0066cc;"><i class="fas fa-spinner fa-spin"></i> Creando juego en la nube...</p>';
        console.log('📝 Mensaje de carga mostrado');
        
        const gameData = await createFirebaseGame(quizId);
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
        
    } catch (error) {
        console.error('❌ Error en startQuizWithFirebase:', error);
        statusDiv.innerHTML = '<p style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i> Error: ' + error.message + '</p>';
    }
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

// ====== AUTO-INICIALIZACIÓN MEJORADA ======

// Función para intentar inicialización múltiples veces
function attemptFirebaseInitialization() {
    console.log('🔄 Intentando inicializar Firebase...');
    
    const success = initializeFirebase();
    if (success) {
        console.log('✅ Firebase inicializado exitosamente');
        return true;
    } else {
        console.log('⏳ Firebase SDK aún no disponible, reintentando...');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM cargado, iniciando sistema Firebase...');
    
    // Intentar inmediatamente
    if (!attemptFirebaseInitialization()) {
        // Si falla, reintentar cada 500ms hasta 10 veces
        let attempts = 0;
        const maxAttempts = 10;
        
        const retryInterval = setInterval(() => {
            attempts++;
            console.log(`🔄 Intento ${attempts}/${maxAttempts} de inicializar Firebase`);
            
            if (attemptFirebaseInitialization() || attempts >= maxAttempts) {
                clearInterval(retryInterval);
                if (attempts >= maxAttempts) {
                    console.error('❌ No se pudo inicializar Firebase después de múltiples intentos');
                }
            }
        }, 500);
    }
});

// También intentar si el script se carga después del DOM
if (document.readyState !== 'loading') {
    console.log('📱 DOM ya listo, inicializando Firebase directamente');
    attemptFirebaseInitialization();
}

// ====== FUNCIONES PÚBLICAS ======

// Exponer funciones inmediatamente (no esperar a inicialización)
window.initializeFirebase = initializeFirebase;
window.startQuizWithFirebase = startQuizWithFirebase;
window.validateFirebaseConfig = validateFirebaseConfig;
window.createFirebaseGame = createFirebaseGame;
window.getFirebaseGame = getFirebaseGame;

// Función para verificar estado Firebase
window.checkFirebaseStatus = function() {
    console.log('🔍 Estado Firebase:');
    console.log('- window.firebaseConfigured:', window.firebaseConfigured);
    console.log('- typeof firebase:', typeof firebase);
    console.log('- typeof window.firebase:', typeof window.firebase);
    console.log('- isFirebaseInitialized:', isFirebaseInitialized);
    console.log('- db disponible:', !!db);
    console.log('- startQuizWithFirebase disponible:', typeof window.startQuizWithFirebase);
    
    return {
        configured: window.firebaseConfigured,
        firebaseAvailable: typeof firebase !== 'undefined' || typeof window.firebase !== 'undefined',
        initialized: isFirebaseInitialized,
        dbReady: !!db,
        functionsExposed: typeof window.startQuizWithFirebase === 'function'
    };
};

console.log('📝 Funciones Firebase expuestas globalmente');