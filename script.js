// ====== FUNCIONES GLOBALES ======

// Navegar a la página de administrador
function goToAdmin() {
    window.location.href = 'admin.html';
}

// Navegar al inicio
function goHome() {
    window.location.href = 'index.html';
}

// Función para unirse a un juego desde la página principal
function joinGame() {
    const gameCode = document.getElementById('gameCode').value.trim().toUpperCase();
    
    if (!gameCode) {
        alert('Por favor, ingresa un código de juego');
        return;
    }
    
    if (gameCode.length !== 6) {
        alert('El código debe tener 6 caracteres');
        return;
    }
    
    // Verificar si el juego existe en el nuevo sistema QR
    const qrGameData = localStorage.getItem(`game_${gameCode}`);
    if (qrGameData) {
        // Juego encontrado en sistema QR - redirigir a student.html
        window.location.href = `student.html?code=${gameCode}`;
        return;
    }
    
    // Verificar en el sistema antiguo como fallback
    const activeGames = JSON.parse(localStorage.getItem('activeGames') || '{}');
    if (activeGames[gameCode]) {
        // Juego encontrado en sistema antiguo - redirigir a student.html
        window.location.href = `student.html?code=${gameCode}`;
        return;
    }
    
    // Si no se encuentra en ningún sistema
    alert('Código de juego inválido o el juego no está activo.\n\nVerifica:\n• Que el código esté bien escrito\n• Que el profesor haya iniciado el juego\n• Que estés en el mismo dispositivo o red que el profesor');
}

// ====== FUNCIONES DE UTILIDAD ======

// Generar código de juego aleatorio
function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Formatear fecha para mostrar
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validar estructura de cuestionario
function validateQuiz(quiz) {
    if (!quiz.title || quiz.title.trim() === '') {
        return 'El título es obligatorio';
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
        return 'Debe haber al menos una pregunta';
    }
    
    for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        if (!question.text || question.text.trim() === '') {
            return `La pregunta ${i + 1} no tiene texto`;
        }
        
        if (!question.options || question.options.length < 2) {
            return `La pregunta ${i + 1} debe tener al menos 2 opciones`;
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer === null) {
            return `La pregunta ${i + 1} debe tener una respuesta correcta seleccionada`;
        }
        
        let hasValidOptions = false;
        for (let j = 0; j < question.options.length; j++) {
            if (question.options[j] && question.options[j].trim() !== '') {
                hasValidOptions = true;
                break;
            }
        }
        
        if (!hasValidOptions) {
            return `La pregunta ${i + 1} debe tener al menos una opción válida`;
        }
    }
    
    return null; // No hay errores
}

// Calcular puntuación basada en tiempo
function calculateScore(timeRemaining, totalTime) {
    const baseScore = 1000;
    const timeBonus = Math.floor((timeRemaining / totalTime) * 500);
    return baseScore + timeBonus;
}

// ====== GESTIÓN DE ALMACENAMIENTO LOCAL ======

// Guardar cuestionario en localStorage
function saveQuiz(quiz) {
    try {
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        
        if (quiz.id) {
            // Verificar si ya existe un cuestionario con este ID
            const index = quizzes.findIndex(q => q.id === quiz.id);
            if (index !== -1) {
                // Actualizar cuestionario existente
                quizzes[index] = quiz;
            } else {
                // Nuevo cuestionario con ID específico
                quizzes.push(quiz);
            }
        } else {
            // Nuevo cuestionario sin ID - generar uno
            quiz.id = Date.now().toString();
            quiz.createdAt = new Date().toISOString();
            quizzes.push(quiz);
        }
        
        quiz.updatedAt = new Date().toISOString();
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        
        return quiz;
    } catch (error) {
        console.error('Error guardando cuestionario:', error);
        throw new Error('No se pudo guardar el cuestionario');
    }
}

// Obtener todos los cuestionarios
function getAllQuizzes() {
    try {
        return JSON.parse(localStorage.getItem('quizzes') || '[]');
    } catch (error) {
        console.error('Error cargando cuestionarios:', error);
        return [];
    }
}

// Obtener cuestionario por ID
function getQuizById(id) {
    try {
        const quizzes = getAllQuizzes();
        return quizzes.find(quiz => quiz.id === id);
    } catch (error) {
        console.error('Error cargando cuestionario:', error);
        return null;
    }
}

// Eliminar cuestionario
function deleteQuiz(id) {
    try {
        const quizzes = getAllQuizzes();
        const filteredQuizzes = quizzes.filter(quiz => quiz.id !== id);
        localStorage.setItem('quizzes', JSON.stringify(filteredQuizzes));
        return true;
    } catch (error) {
        console.error('Error eliminando cuestionario:', error);
        return false;
    }
}

// Gestión de juegos activos
function createActiveGame(quizId, gameCode) {
    try {
        const activeGames = JSON.parse(localStorage.getItem('activeGames') || '{}');
        const quiz = getQuizById(quizId);
        
        if (!quiz) {
            throw new Error('Cuestionario no encontrado');
        }
        
        activeGames[gameCode] = {
            quizId: quizId,
            quiz: quiz,
            createdAt: new Date().toISOString(),
            status: 'waiting', // waiting, active, finished
            currentQuestion: 0,
            players: {},
            startTime: null
        };
        
        localStorage.setItem('activeGames', JSON.stringify(activeGames));
        return activeGames[gameCode];
    } catch (error) {
        console.error('Error creando juego activo:', error);
        throw error;
    }
}

// Obtener juego activo
function getActiveGame(gameCode) {
    try {
        // Primero verificar en el nuevo sistema QR
        const qrGameData = localStorage.getItem('game_' + gameCode);
        if (qrGameData) {
            return JSON.parse(qrGameData);
        }
        
        // Si no está en QR, verificar en el sistema antiguo
        const activeGames = JSON.parse(localStorage.getItem('activeGames') || '{}');
        return activeGames[gameCode] || null;
    } catch (error) {
        console.error('Error obteniendo juego activo:', error);
        return null;
    }
}

// Actualizar juego activo
function updateActiveGame(gameCode, gameData) {
    try {
        // Verificar si existe en sistema QR
        const qrGameData = localStorage.getItem('game_' + gameCode);
        if (qrGameData) {
            const updatedGame = { ...JSON.parse(qrGameData), ...gameData };
            localStorage.setItem('game_' + gameCode, JSON.stringify(updatedGame));
            return updatedGame;
        }
        
        // Si no está en QR, actualizar en sistema antiguo
        const activeGames = JSON.parse(localStorage.getItem('activeGames') || '{}');
        if (activeGames[gameCode]) {
            activeGames[gameCode] = { ...activeGames[gameCode], ...gameData };
            localStorage.setItem('activeGames', JSON.stringify(activeGames));
            return activeGames[gameCode];
        }
        return null;
    } catch (error) {
        console.error('Error actualizando juego activo:', error);
        return null;
    }
}

// Agregar jugador al juego
function addPlayerToGame(gameCode, playerName, avatar = '😎') {
    try {
        const game = getActiveGame(gameCode);
        if (!game) {
            throw new Error('Juego no encontrado');
        }
        
        // Verificar el estado del juego
        if (game.status === 'active') {
            throw new Error('El juego ya ha comenzado. No es posible unirse ahora.');
        }
        
        if (game.status === 'finished') {
            throw new Error('El juego ya ha terminado. No es posible unirse.');
        }
        
        if (game.status !== 'waiting') {
            throw new Error('El juego no está disponible para nuevos jugadores.');
        }
        
        const playerId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        if (!game.players) {
            game.players = {};
        }
        
        // Verificar si el nombre ya existe
        const existingPlayer = Object.values(game.players).find(player => 
            player.name.toLowerCase() === playerName.toLowerCase()
        );
        
        if (existingPlayer) {
            throw new Error('Ya existe un jugador con ese nombre');
        }
        
        game.players[playerId] = {
            id: playerId,
            name: playerName,
            avatar: avatar,
            score: 0,
            answers: [],
            joinedAt: new Date().toISOString()
        };
        
        updateActiveGame(gameCode, game);
        return playerId;
    } catch (error) {
        console.error('Error agregando jugador:', error);
        throw error;
    }
}

// Eliminar juego activo
function deleteActiveGame(gameCode) {
    try {
        const activeGames = JSON.parse(localStorage.getItem('activeGames') || '{}');
        delete activeGames[gameCode];
        localStorage.setItem('activeGames', JSON.stringify(activeGames));
        return true;
    } catch (error) {
        console.error('Error eliminando juego activo:', error);
        return false;
    }
}

// ====== EVENTOS DE LA PÁGINA PRINCIPAL ======

document.addEventListener('DOMContentLoaded', function() {
    // Configurar evento para el formulario de unirse al juego
    const gameCodeInput = document.getElementById('gameCode');
    if (gameCodeInput) {
        gameCodeInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
        
        gameCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinGame();
            }
        });
    }
    
    // Limpiar juegos activos antiguos (más de 24 horas)
    cleanupOldActiveGames();
});

// Limpiar juegos activos antiguos
function cleanupOldActiveGames() {
    try {
        const activeGames = JSON.parse(localStorage.getItem('activeGames') || '{}');
        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        let hasChanges = false;
        
        Object.keys(activeGames).forEach(gameCode => {
            const game = activeGames[gameCode];
            const gameTime = new Date(game.createdAt).getTime();
            
            if (now - gameTime > twentyFourHours) {
                delete activeGames[gameCode];
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            localStorage.setItem('activeGames', JSON.stringify(activeGames));
        }
    } catch (error) {
        console.error('Error limpiando juegos antiguos:', error);
    }
}

// ====== FUNCIONES DE COMUNICACIÓN ENTRE VENTANAS ======

// Sistema básico de comunicación usando localStorage para simular tiempo real
function broadcastGameUpdate(gameCode, updateType, data) {
    try {
        const update = {
            gameCode: gameCode,
            type: updateType,
            data: data,
            timestamp: Date.now()
        };
        
        // Guardar la actualización en localStorage
        const updates = JSON.parse(localStorage.getItem('gameUpdates') || '[]');
        updates.push(update);
        
        // Mantener solo las últimas 100 actualizaciones
        if (updates.length > 100) {
            updates.splice(0, updates.length - 100);
        }
        
        localStorage.setItem('gameUpdates', JSON.stringify(updates));
        
        // Disparar evento personalizado para que otras ventanas puedan escuchar
        window.dispatchEvent(new CustomEvent('gameUpdate', { detail: update }));
        
    } catch (error) {
        console.error('Error enviando actualización del juego:', error);
    }
}

// Escuchar actualizaciones del juego
function listenForGameUpdates(gameCode, callback) {
    function handleStorageChange(e) {
        if (e.key === 'gameUpdates') {
            try {
                const updates = JSON.parse(e.newValue || '[]');
                const relevantUpdate = updates
                    .filter(update => update.gameCode === gameCode)
                    .sort((a, b) => b.timestamp - a.timestamp)[0];
                
                if (relevantUpdate && callback) {
                    callback(relevantUpdate);
                }
            } catch (error) {
                console.error('Error procesando actualización del juego:', error);
            }
        }
    }
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados en la misma ventana
    function handleCustomEvent(e) {
        if (e.detail.gameCode === gameCode && callback) {
            callback(e.detail);
        }
    }
    
    window.addEventListener('gameUpdate', handleCustomEvent);
    
    // Retornar función para limpiar los listeners
    return function cleanup() {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('gameUpdate', handleCustomEvent);
    };
}

// ====== DATOS DE EJEMPLO ======

// Función para crear datos de ejemplo si no existen
function createSampleData() {
    const quizzes = getAllQuizzes();
    
    if (quizzes.length === 0) {
        const sampleQuiz = {
            title: "Conocimientos Generales",
            description: "Un cuestionario básico de cultura general",
            timeLimit: 30,
            questions: [
                {
                    text: "¿Cuál es la capital de Francia?",
                    options: ["Londres", "París", "Madrid", "Roma"],
                    correctAnswer: 1
                },
                {
                    text: "¿En qué año llegó el hombre a la Luna?",
                    options: ["1967", "1968", "1969", "1970"],
                    correctAnswer: 2
                },
                {
                    text: "¿Cuál es el planeta más grande del sistema solar?",
                    options: ["Tierra", "Saturno", "Júpiter", "Neptuno"],
                    correctAnswer: 2
                },
                {
                    text: "¿Quién escribió 'Don Quijote de la Mancha'?",
                    options: ["Miguel de Cervantes", "Lope de Vega", "Calderón de la Barca", "Francisco de Quevedo"],
                    correctAnswer: 0
                },
                {
                    text: "¿Cuál es el océano más grande del mundo?",
                    options: ["Atlántico", "Índico", "Ártico", "Pacífico"],
                    correctAnswer: 3
                }
            ]
        };
        
        saveQuiz(sampleQuiz);
        console.log('Datos de ejemplo creados');
    }
}

// Crear datos de ejemplo al cargar la página
if (typeof window !== 'undefined') {
    createSampleData();
}