// ====== FIREBASE SIMPLE - SISTEMA MEJORADO ======

// Variables globales
let db = null;
let isFirebaseReady = false;

// Configuración Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBs28A1nAjzVgzpHeS_7DxLbNKIv8zwWqE",
    authDomain: "braingamesstorm.firebaseapp.com",
    projectId: "braingamesstorm",
    storageBucket: "braingamesstorm.appspot.com",
    messagingSenderId: "444444279144",
    appId: "1:444444279144:web:7fd1b2c5c1438190ba8ac5"
};

// Función para cargar Firebase de forma confiable
async function loadFirebaseSDK() {
    console.log('📦 Iniciando carga Firebase SDK...');
    
    // Si ya está cargado, salir
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase SDK ya disponible');
        return true;
    }
    
    return new Promise((resolve, reject) => {
        // Cargar Firebase App
        const script1 = document.createElement('script');
        script1.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
        script1.onload = () => {
            console.log('📦 Firebase App cargado');
            
            // Cargar Firestore
            const script2 = document.createElement('script');
            script2.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
            script2.onload = () => {
                console.log('📦 Firebase Firestore cargado');
                
                // Esperar a que Firebase esté disponible
                setTimeout(() => {
                    if (typeof firebase !== 'undefined') {
                        console.log('✅ Firebase completamente disponible');
                        resolve(true);
                    } else {
                        console.error('❌ Firebase no disponible después de cargar scripts');
                        reject(new Error('Firebase no disponible'));
                    }
                }, 500);
            };
            script2.onerror = () => reject(new Error('Error cargando Firestore'));
            document.head.appendChild(script2);
        };
        script1.onerror = () => reject(new Error('Error cargando Firebase App'));
        document.head.appendChild(script1);
    });
}

// Función para inicializar Firebase
async function initFirebase() {
    console.log('🔥 Iniciando Firebase...');
    
    try {
        // 1. Cargar SDK si es necesario
        if (typeof firebase === 'undefined') {
            await loadFirebaseSDK();
        }
        
        // 2. Inicializar app
        if (!firebase.apps.length) {
            console.log('🔧 Inicializando Firebase app...');
            firebase.initializeApp(firebaseConfig);
        }
        
        // 3. Obtener Firestore
        db = firebase.firestore();
        isFirebaseReady = true;
        
        console.log('✅ Firebase completamente inicializado');
        
        // Mostrar mensaje de éxito
        showSuccessMessage();
        
        return true;
        
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        return false;
    }
}

// Función para mostrar mensaje de éxito
function showSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    `;
    message.textContent = '✅ Firebase inicializado correctamente';
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (document.body.contains(message)) {
            document.body.removeChild(message);
        }
    }, 5000);
}

// Función para crear juego Firebase
async function createGameInFirebase(quizId) {
    if (!isFirebaseReady) {
        console.log('🔄 Firebase no listo, inicializando...');
        const success = await initFirebase();
        if (!success) {
            throw new Error('No se pudo inicializar Firebase');
        }
    }
    
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gameData = {
        quizId: quizId,
        gameCode: gameCode,
        players: [],
        status: 'waiting',
        created: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
    };
    
    console.log('💾 Creando juego en Firestore:', gameCode);
    
    try {
        await db.collection('games').doc(gameCode).set(gameData);
        console.log('✅ Juego creado en Firestore:', gameCode);
        return gameCode;
    } catch (error) {
        console.error('❌ Error creando juego:', error);
        throw error;
    }
}

// Función de diagnóstico simple
function diagnosticFirebase() {
    console.log('🔍 Diagnóstico Firebase Simple:');
    console.log('- Firebase SDK:', typeof firebase !== 'undefined' ? '✅' : '❌');
    console.log('- Firebase Ready:', isFirebaseReady ? '✅' : '❌');
    console.log('- Firestore DB:', db ? '✅' : '❌');
    console.log('- Firebase Apps:', firebase?.apps?.length || 0);
}

// Auto-inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando auto-inicialización Firebase...');
    
    setTimeout(async () => {
        try {
            await initFirebase();
            console.log('🎉 Auto-inicialización completada');
        } catch (error) {
            console.error('❌ Error en auto-inicialización:', error);
        }
    }, 1000);
});

// Exponer funciones globalmente
window.initFirebase = initFirebase;
window.createGameInFirebase = createGameInFirebase;
window.diagnosticFirebase = diagnosticFirebase;
window.isFirebaseReady = () => isFirebaseReady;

console.log('📝 Firebase Simple cargado');