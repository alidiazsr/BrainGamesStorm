// Sistema de archivos JSON estáticos - Funciona desde cualquier dispositivo
// Usa GitHub Pages para almacenar datos de juegos temporalmente

// ====== SISTEMA DE ARCHIVOS ESTÁTICOS ======

function createStaticGameFile(quizId) {
    console.log('📁 createStaticGameFile iniciada con quizId:', quizId);
    
    try {
        console.log('🔍 Verificando función getQuizById...');
        if (typeof getQuizById !== 'function') {
            console.error('❌ getQuizById no está disponible en file-game-system');
            alert('Error: getQuizById no está disponible');
            return;
        }
        
        const quiz = getQuizById(quizId);
        console.log('📋 Quiz obtenido:', quiz ? quiz.title : 'null');
        
        if (!quiz) {
            alert('Cuestionario no encontrado');
            return;
        }

        // Generar código único
        const gameCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        const timestamp = Date.now();
        
        console.log('🎲 Código generado:', gameCode);
        
        // Crear datos del juego
        const gameData = {
            gameCode: gameCode,
            quiz: quiz,
            players: {},
            status: 'waiting',
            currentQuestion: 0,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        };
        
        console.log('💾 Datos del juego creados');
        
        // Crear archivo JSON descargable
        const jsonContent = JSON.stringify(gameData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const fileName = 'game_' + gameCode + '.json';
        
        console.log('📄 Archivo JSON creado:', fileName);
        
        // Crear enlace de descarga
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        
        console.log('🔗 Enlace de descarga creado');
        
        // Mostrar instrucciones detalladas
        showStaticGameInstructions(gameCode, quiz.title, downloadLink, jsonContent);
        
        console.log('✅ createStaticGameFile completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en createStaticGameFile:', error);
        alert('Error al crear el juego: ' + error.message);
    }
}

function showStaticGameInstructions(gameCode, quizTitle, downloadLink, jsonContent) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; overflow-y: auto;';
    modal.innerHTML = 
        '<div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">' +
            '<h2 style="margin: 0 0 20px 0; color: #333; text-align: center;"><i class="fas fa-rocket"></i> Juego Creado: ' + quizTitle + '</h2>' +
            
            '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">' +
                '<h1 style="font-size: 3em; margin: 10px 0;">Código: ' + gameCode + '</h1>' +
                '<p style="margin: 0; font-size: 18px;">¡Tu juego está listo!</p>' +
            '</div>' +
            
            '<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">' +
                '<h3 style="margin: 0 0 15px 0; color: #856404;"><i class="fas fa-exclamation-triangle"></i> IMPORTANTE - Para usar desde otros dispositivos:</h3>' +
                '<p style="margin: 0 0 10px 0; color: #856404;">Este sistema funciona localmente. Para que funcione desde otros dispositivos:</p>' +
                '<ol style="margin: 0; padding-left: 20px; color: #856404;">' +
                    '<li><strong>Descarga el archivo del juego</strong> (botón abajo)</li>' +
                    '<li><strong>Súbelo a tu GitHub</strong> o servicio en la nube</li>' +
                    '<li><strong>Comparte el enlace directo del archivo</strong> con estudiantes</li>' +
                '</ol>' +
            '</div>' +
            
            '<div style="text-align: center; margin: 20px 0;">' +
                '<button id="downloadGameBtn" style="background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 5px;"><i class="fas fa-download"></i> Descargar Archivo del Juego</button>' +
                '<button onclick="copyGameData()" style="background: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 5px;"><i class="fas fa-copy"></i> Copiar Datos JSON</button>' +
            '</div>' +
            
            '<div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">' +
                '<h4 style="margin: 0 0 10px 0; color: #4caf50;"><i class="fas fa-info-circle"></i> Pasos para usar en múltiples dispositivos:</h4>' +
                '<ol style="margin: 0; padding-left: 20px; color: #333;">' +
                    '<li><strong>Descarga el archivo</strong> game_' + gameCode + '.json</li>' +
                    '<li><strong>Súbelo a GitHub:</strong></li>' +
                    '<ul style="margin: 5px 0; padding-left: 20px;">' +
                        '<li>Ve a tu repositorio BrainGamesStorm</li>' +
                        '<li>Haz clic en "Add file" → "Upload files"</li>' +
                        '<li>Arrastra el archivo .json</li>' +
                        '<li>Haz commit</li>' +
                    '</ul>' +
                    '<li><strong>Copia la URL del archivo:</strong></li>' +
                    '<ul style="margin: 5px 0; padding-left: 20px;">' +
                        '<li>https://alidiazsr.github.io/BrainGamesStorm/game_' + gameCode + '.json</li>' +
                    '</ul>' +
                    '<li><strong>Comparte con estudiantes:</strong></li>' +
                    '<ul style="margin: 5px 0; padding-left: 20px;">' +
                        '<li>https://alidiazsr.github.io/BrainGamesStorm/?gameFile=game_' + gameCode + '.json</li>' +
                    '</ul>' +
                '</ol>' +
            '</div>' +
            
            '<textarea id="gameDataArea" readonly style="width: 100%; height: 150px; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: monospace; font-size: 10px; background: #f8f9fa;" placeholder="Datos JSON del juego aparecerán aquí...">' + jsonContent + '</textarea>' +
            
            '<div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">' +
                '<button onclick="this.closest(\'div\').closest(\'div\').remove()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cerrar</button>' +
                '<button onclick="window.open(\'https://github.com/alidiazsr/BrainGamesStorm\', \'_blank\')" style="padding: 12px 24px; background: #333; color: white; border: none; border-radius: 8px; cursor: pointer;"><i class="fab fa-github"></i> Ir a GitHub</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    // Configurar descarga
    document.getElementById('downloadGameBtn').onclick = function() {
        downloadLink.click();
        
        // Cambiar texto del botón
        this.innerHTML = '<i class="fas fa-check"></i> ¡Archivo Descargado!';
        this.style.backgroundColor = '#28a745';
    };
    
    // Función para copiar datos
    window.copyGameData = function() {
        const textarea = document.getElementById('gameDataArea');
        textarea.select();
        document.execCommand('copy');
        
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> ¡JSON Copiado!';
        btn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '#007bff';
        }, 3000);
    };
}

// ====== SISTEMA PARA CARGAR JUEGOS DESDE ARCHIVOS ======

function loadGameFromFile() {
    // Verificar si hay parámetro gameFile en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameFile = urlParams.get('gameFile');
    
    if (gameFile) {
        loadGameFromURL(gameFile);
        return;
    }
    
    // Si no hay parámetro, mostrar selector de archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const gameData = JSON.parse(e.target.result);
                    initializeGameFromData(gameData);
                } catch (error) {
                    alert('Error al leer el archivo: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function loadGameFromURL(gameFile) {
    const fileURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + gameFile;
    
    fetch(fileURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Archivo de juego no encontrado');
            }
            return response.json();
        })
        .then(gameData => {
            initializeGameFromData(gameData);
        })
        .catch(error => {
            console.error('Error al cargar juego:', error);
            alert('Error al cargar el juego: ' + error.message + '\n\nVerifica que el archivo existe en: ' + fileURL);
        });
}

function initializeGameFromData(gameData) {
    // Verificar si el juego ha expirado
    if (gameData.expiresAt && new Date() > new Date(gameData.expiresAt)) {
        alert('Este juego ha expirado. Solicita un nuevo enlace al profesor.');
        return;
    }
    
    // Guardar datos del juego globalmente
    window.currentGameData = gameData;
    
    // Redirigir a la página de estudiante con los datos
    const studentURL = 'student.html?gameCode=' + gameData.gameCode + '&fromFile=true';
    window.location.href = studentURL;
}

// ====== INTEGRACIÓN CON SISTEMA EXISTENTE ======

// Reemplazar función de inicio de quiz
function startQuizWithFileSystem(quizId) {
    createStaticGameFile(quizId);
}

// Auto-cargar si viene de un enlace con archivo
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameFile = urlParams.get('gameFile');
    
    if (gameFile && window.location.pathname.includes('index.html')) {
        loadGameFromURL(gameFile);
    }
});