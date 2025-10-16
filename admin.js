// admin-simple.js - Versión limpia sin código de debug

let currentQuiz = null;
let editingQuizId = null;
let questionCount = 0;

// ====== INICIALIZACIÓN ======

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin panel cargando...');
    
    // FORZAR inicialización Firebase inmediatamente
    setTimeout(() => {
        console.log('🔥 Forzando inicialización Firebase desde admin...');
        if (typeof window.forceFirebaseInitialization === 'function') {
            window.forceFirebaseInitialization();
        } else if (typeof window.initializeFirebase === 'function') {
            window.initializeFirebase();
        } else {
            console.log('⚠️ Funciones Firebase no disponibles, reintentando...');
            setTimeout(() => {
                if (typeof window.forceFirebaseInitialization === 'function') {
                    window.forceFirebaseInitialization();
                }
            }, 2000);
        }
    }, 500);
    
    // Debug del sistema
    setTimeout(() => {
        debugSystemStatus();
    }, 1000);
    
    // Verificar que las funciones principales de script.js estén disponibles
    if (typeof getAllQuizzes !== 'function' || typeof getQuizById !== 'function' || 
        typeof saveQuiz !== 'function' || typeof deleteQuiz !== 'function') {
        console.error('Error: Funciones de script.js no están disponibles');
        alert('Error del sistema: Algunas funciones no están disponibles. Por favor, recarga la página.');
        return;
    }
    
    console.log('✅ Funciones básicas de script.js disponibles');
    
    loadQuizList();
    
    // Event listener solo para el input de archivo
    const jsonFileInput = document.getElementById('jsonFileInput');
    if (jsonFileInput) {
        jsonFileInput.addEventListener('change', handleJsonFileImport);
    }
    
    console.log('✅ Admin panel cargado completamente');
});

// ====== CARGA DE CUESTIONARIOS ======

function loadQuizList() {
    // Verificar que getAllQuizzes esté disponible
    if (typeof getAllQuizzes !== 'function') {
        console.error('getAllQuizzes no está disponible');
        return;
    }
    
    const quizzes = getAllQuizzes();
    const quizList = document.getElementById('quizList');
    
    if (!quizList) return;
    
    if (quizzes.length === 0) {
        quizList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No hay cuestionarios</h3>
                <p>Crea tu primer cuestionario o importa uno desde JSON</p>
                <button class="btn btn-primary" onclick="createNewQuiz()">
                    <i class="fas fa-plus"></i>
                    Crear Cuestionario
                </button>
            </div>
        `;
        return;
    }
    
    const quizzesHTML = quizzes.map(quiz => `
        <div class="quiz-card">
            <div class="quiz-info">
                <h3>${escapeHtml(quiz.title)}</h3>
                <p class="quiz-meta">
                    ${quiz.questions.length} preguntas • ${quiz.timeLimit || 30}s por pregunta
                </p>
                ${quiz.description ? `<p class="quiz-description">${escapeHtml(quiz.description)}</p>` : ''}
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="console.log('🔴 Botón Iniciar clickeado para quiz:', '${quiz.id}'); startQuiz('${quiz.id}')">
                    <i class="fas fa-play"></i>
                    Iniciar
                </button>
                <button class="btn btn-secondary" onclick="editQuiz('${quiz.id}')">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn btn-outline" onclick="exportQuizDirectly('${quiz.id}')" style="color: var(--success-green); border-color: var(--success-green);">
                    <i class="fas fa-download"></i>
                    JSON
                </button>
                <button class="btn btn-outline" onclick="duplicateQuiz('${quiz.id}')" style="color: var(--primary-blue); border-color: var(--primary-blue);">
                    <i class="fas fa-copy"></i>
                    Duplicar
                </button>
                <button class="btn btn-outline" onclick="deleteQuizConfirm('${quiz.id}')" style="color: var(--danger-red); border-color: var(--danger-red);">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
    
    quizList.innerHTML = quizzesHTML;
}

// ====== CREACIÓN Y EDICIÓN DE CUESTIONARIOS ======

function createNewQuiz() {
    editingQuizId = null;
    currentQuiz = {
        title: '',
        description: '',
        timeLimit: 30,
        questions: []
    };
    
    document.getElementById('formTitle').textContent = 'Nuevo Cuestionario';
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDescription').value = '';
    document.getElementById('timeLimit').value = 30;
    
    // Ocultar botón de exportar JSON para cuestionarios nuevos
    document.getElementById('exportJsonBtn').style.display = 'none';
    
    questionCount = 0;
    document.getElementById('questionsContainer').innerHTML = '';
    
    // Agregar primera pregunta automáticamente
    addQuestion();
    
    document.getElementById('quizFormContainer').style.display = 'flex';
}

function editQuiz(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    editingQuizId = quizId;
    currentQuiz = { ...quiz };
    
    document.getElementById('formTitle').textContent = 'Editar Cuestionario';
    document.getElementById('quizTitle').value = quiz.title;
    document.getElementById('quizDescription').value = quiz.description || '';
    document.getElementById('timeLimit').value = quiz.timeLimit || 30;
    
    // Mostrar botón de exportar JSON para cuestionarios existentes
    document.getElementById('exportJsonBtn').style.display = 'inline-flex';
    
    // Cargar preguntas
    questionCount = 0;
    document.getElementById('questionsContainer').innerHTML = '';
    
    quiz.questions.forEach(question => {
        addQuestion(question);
    });
    
    document.getElementById('quizFormContainer').style.display = 'flex';
}

function closeQuizForm() {
    document.getElementById('quizFormContainer').style.display = 'none';
    document.getElementById('exportJsonBtn').style.display = 'none';
    currentQuiz = null;
    editingQuizId = null;
}

// ====== GESTIÓN DE PREGUNTAS ======

function addQuestion(questionData = null) {
    questionCount++;
    const questionId = 'q' + questionCount;
    
    const questionHTML = `
        <div class="question-item" data-question-id="${questionId}">
            <div class="question-header">
                <span class="question-number">Pregunta ${questionCount}</span>
                <button type="button" class="remove-question" onclick="removeQuestion('${questionId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="form-group">
                <label>Texto de la pregunta</label>
                <input type="text" class="question-text" placeholder="Escribe tu pregunta aquí..." 
                       value="${questionData ? escapeHtml(questionData.text) : ''}" required>
            </div>
            
            <div class="form-group">
                <label>Opciones de respuesta</label>
                <div class="answers-container">
                    ${generateAnswerOptions(questionId, questionData)}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHTML);
    
    // Si es una pregunta nueva (no cargada), hacer scroll hasta ella
    if (!questionData) {
        const newQuestion = document.querySelector(`[data-question-id="${questionId}"]`);
        newQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function generateAnswerOptions(questionId, questionData = null) {
    const options = ['A', 'B', 'C', 'D'];
    const colors = ['option-a', 'option-b', 'option-c', 'option-d'];
    
    return options.map((option, index) => {
        const isCorrect = questionData && questionData.correctAnswer === index;
        const optionText = questionData && questionData.options[index] ? questionData.options[index] : '';
        
        return `
            <div class="answer-option ${isCorrect ? 'correct' : ''}">
                <input type="radio" name="correct_${questionId}" value="${index}" 
                       ${isCorrect ? 'checked' : ''} 
                       onchange="updateCorrectAnswer('${questionId}', ${index})">
                <span class="option-label ${colors[index]}">${option}</span>
                <input type="text" placeholder="Opción ${option}" 
                       value="${escapeHtml(optionText)}" 
                       onchange="updateQuestionData('${questionId}')">
            </div>
        `;
    }).join('');
}

function updateCorrectAnswer(questionId, answerIndex) {
    const questionEl = document.querySelector(`[data-question-id="${questionId}"]`);
    const answerOptions = questionEl.querySelectorAll('.answer-option');
    
    answerOptions.forEach((option, index) => {
        if (index === answerIndex) {
            option.classList.add('correct');
        } else {
            option.classList.remove('correct');
        }
    });
}

function removeQuestion(questionId) {
    if (document.querySelectorAll('.question-item').length <= 1) {
        alert('Debe haber al menos una pregunta');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
        document.querySelector(`[data-question-id="${questionId}"]`).remove();
        updateQuestionNumbers();
    }
}

function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-item');
    questions.forEach((question, index) => {
        const numberSpan = question.querySelector('.question-number');
        numberSpan.textContent = 'Pregunta ' + (index + 1);
    });
}

// ====== DEBUG Y VERIFICACIÓN ======

function debugSystemStatus() {
    console.log('🔍 === ESTADO DEL SISTEMA ===');
    console.log('script.js funciones:');
    console.log('- getQuizById:', typeof getQuizById);
    console.log('- getAllQuizzes:', typeof getAllQuizzes);
    
    console.log('Firebase:');
    console.log('- firebase global:', typeof firebase);
    console.log('- window.firebaseConfigured:', window.firebaseConfigured);
    console.log('- initializeFirebase:', typeof initializeFirebase);
    console.log('- startQuizWithFirebase:', typeof startQuizWithFirebase);
    
    console.log('Admin funciones:');
    console.log('- startQuiz:', typeof startQuiz);
    console.log('- loadQuizList:', typeof loadQuizList);
    console.log('========================');
}

// ====== GESTIÓN DE CUESTIONARIOS ======

function duplicateQuiz(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    const duplicatedQuiz = {
        ...quiz,
        title: quiz.title + ' (Copia)',
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
    };
    
    try {
        saveQuiz(duplicatedQuiz);
        loadQuizList();
        alert('Cuestionario duplicado correctamente');
    } catch (error) {
        alert('Error al duplicar el cuestionario: ' + error.message);
    }
}

function exportQuizDirectly(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    try {
        // Mostrar mensaje de que la función fue eliminada por seguridad
        alert('⚠️ Función de exportación eliminada por seguridad\n\nEsta función podría exponer las respuestas correctas a los estudiantes.\n\nPara crear juegos, usa el botón "Iniciar Quiz" que es seguro.');
        
    } catch (error) {
        console.error('Error en exportQuizDirectly:', error);
        alert('Error: ' + error.message);
    }
}

function deleteQuizConfirm(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar "' + quiz.title + '"?\n\nEsta acción no se puede deshacer.')) {
        if (deleteQuiz(quizId)) {
            loadQuizList();
            alert('Cuestionario eliminado correctamente');
        } else {
            alert('Error al eliminar el cuestionario');
        }
    }
}

function startQuiz(quizId) {
    console.log('🔍 startQuiz llamada con quizId:', quizId);
    
    // Verificar que las funciones de script.js estén disponibles
    if (typeof getQuizById !== 'function') {
        console.error('❌ getQuizById no está disponible');
        alert('Error: Las funciones del sistema no están disponibles. Recarga la página.');
        return;
    }
    
    const quiz = getQuizById(quizId);
    if (!quiz) {
        console.error('❌ Quiz no encontrado para ID:', quizId);
        alert('Cuestionario no encontrado');
        return;
    }
    
    console.log('✅ Quiz encontrado:', quiz.title);
    console.log('🔍 Verificando estado Firebase...');
    
    // Verificar estado completo de Firebase
    if (typeof window.checkFirebaseStatus === 'function') {
        const status = window.checkFirebaseStatus();
        console.log('📊 Estado detallado Firebase:', status);
    } else {
        console.log('- window.firebaseConfigured:', window.firebaseConfigured);
        console.log('- typeof startQuizWithFirebase:', typeof startQuizWithFirebase);
        console.log('- typeof firebase:', typeof firebase);
        console.log('- typeof window.firebase:', typeof window.firebase);
    }
    
    // Intentar forzar inicialización Firebase si no está configurado
    if (!window.firebaseConfigured) {
        console.log('🔄 Firebase no configurado, forzando inicialización...');
        
        if (typeof window.forceFirebaseInitialization === 'function') {
            console.log('� Usando inicialización forzada...');
            const initialized = window.forceFirebaseInitialization();
            if (initialized) {
                console.log('✅ Firebase inicializado exitosamente con forzado');
            } else {
                console.log('⏳ Firebase SDK cargando, esperando...');
            }
        } else if (typeof window.initializeFirebase === 'function') {
            console.log('🔄 Usando inicialización normal...');
            const initialized = window.initializeFirebase();
            if (initialized) {
                console.log('✅ Firebase inicializado exitosamente');
            } else {
                console.log('⏳ Firebase aún no disponible');
            }
        } else {
            console.log('❌ Funciones de Firebase no disponibles');
        }
    }
    
    // Verificar si Firebase está listo después del intento de inicialización
    if (window.firebaseConfigured && typeof startQuizWithFirebase === 'function') {
        // Usar Firebase (FUNCIONA DESDE CUALQUIER DISPOSITIVO)
        console.log('🔥 Usando Firebase para múltiples dispositivos');
        try {
            startQuizWithFirebase(quizId);
            return;
        } catch (error) {
            console.error('❌ Error con Firebase:', error);
            alert('Error con Firebase: ' + error.message + '\nUsando sistema de archivos como respaldo.');
        }
    }
    
    // Si Firebase no está listo, intentar inicializarlo
    if (typeof initializeFirebase === 'function') {
        console.log('🔄 Intentando inicializar Firebase...');
        const firebaseReady = initializeFirebase();
        if (firebaseReady) {
            console.log('✅ Firebase inicializado, reintentando...');
            setTimeout(() => {
                if (window.firebaseConfigured && typeof startQuizWithFirebase === 'function') {
                    startQuizWithFirebase(quizId);
                } else {
                    console.log('⚠️ Firebase aún no listo, usando sistema de archivos');
                    useFileSystemWithWarning(quizId, quiz);
                }
            }, 1000);
            return;
        } else {
            console.log('❌ No se pudo inicializar Firebase');
        }
    } else {
        console.log('❌ initializeFirebase no está disponible');
    }
    
    // Fallback final
    console.log('📁 Usando sistema de archivos como fallback');
    useFileSystemWithWarning(quizId, quiz);
}

function useFileSystemWithWarning(quizId, quiz) {
    console.log('⚠️ Sistema de archivos deshabilitado por seguridad');
    
    alert('⚠️ Sistema de archivos deshabilitado por seguridad\n\n' + 
          'El sistema de archivos estáticos fue eliminado porque podía exponer respuestas.\n\n' +
          '✅ Usa Firebase para un sistema seguro y funcional desde cualquier dispositivo.\n\n' +
          'Configura las reglas de Firebase y usa "Iniciar Quiz con Firebase".');
}

function showAdvancedOptions(quizId) {
    alert('📖 Opciones Avanzadas disponibles:\n\n' +
          '💪 PHP/MySQL: Ver archivo api.php\n' +
          '⚡ Node.js: Ver archivo server.js\n' +
          '🛠️ Cliente universal: Ver archivo remote-client.js\n\n' +
          '📋 Consulta SOLUCIONES_MULTIPLES_DISPOSITIVOS.md para instrucciones detalladas de cada opción.');
}

function startQuizOldSystem(quizId) {
    // Sistema antiguo como fallback
    if (typeof generateGameCode !== 'function' || typeof createActiveGame !== 'function') {
        alert('Sistema de códigos no disponible');
        return;
    }
    
    // Generar código de juego único
    let gameCode;
    let attempts = 0;
    do {
        gameCode = generateGameCode();
        attempts++;
    } while (getActiveGame && getActiveGame(gameCode) && attempts < 10);
    
    if (attempts >= 10) {
        alert('Error generando código de juego. Intenta de nuevo.');
        return;
    }
    
    // Crear y activar juego
    createActiveGame(quizId, gameCode);
    
    if (typeof updateActiveGame === 'function') {
        updateActiveGame(gameCode, { 
            status: 'waiting', 
            startTime: new Date().toISOString(),
            currentQuestion: 0,
            phase: 'waiting'
        });
    }
    
    // Abrir ventana de control
    const controlUrl = 'admin-control.html?code=' + gameCode;
    window.open(controlUrl, '_blank', 'width=1200,height=800');
    
    const quiz = getQuizById(quizId);
    alert('Cuestionario iniciado exitosamente\n\nCuestionario: ' + quiz.title + '\nCódigo para estudiantes: ' + gameCode + '\nLos estudiantes pueden unirse ahora\nSe ha abierto la ventana de control\n\nLos estudiantes deben ir a la página principal e ingresar el código: ' + gameCode);
}

// ====== IMPORTACIÓN JSON SIMPLE ======

function importQuizFromJson() {
    const jsonFileInput = document.getElementById('jsonFileInput');
    
    if (jsonFileInput) {
        jsonFileInput.click();
    } else {
        alert('Error: No se puede acceder al selector de archivos');
    }
}

function handleJsonFileImport(event) {
    // Verificar que saveQuiz esté disponible
    if (typeof saveQuiz !== 'function') {
        alert('Error: La función saveQuiz no está disponible. Recarga la página.');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Por favor, selecciona un archivo JSON válido');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            
            // Detectar y adaptar diferentes formatos de JSON
            let quizData = jsonData;
            
            // Si es formato Brain Games Storm con estructura anidada
            if (jsonData.format === 'BrainGamesStorm' && jsonData.quiz) {
                quizData = jsonData.quiz;
            }
            
            // Validar estructura básica
            if (!quizData.questions || !Array.isArray(quizData.questions)) {
                alert('El archivo JSON debe tener una propiedad "questions" que sea un array');
                return;
            }
            
            // Validar cada pregunta
            for (let i = 0; i < quizData.questions.length; i++) {
                const q = quizData.questions[i];
                console.log('Validando pregunta ' + (i + 1) + ':', q);
                
                if (!q.question) {
                    console.log('Error en pregunta ' + (i + 1) + ': falta texto de pregunta');
                    alert('Error en pregunta ' + (i + 1) + ': debe tener "question"');
                    return;
                }
                
                // Formato nuevo: "answers" con objetos {text, correct}
                if (q.answers && Array.isArray(q.answers)) {
                    if (q.answers.length < 2) {
                        console.log('Error en pregunta ' + (i + 1) + ': pocas respuestas');
                        alert('Error en pregunta ' + (i + 1) + ': debe tener al menos 2 respuestas');
                        return;
                    }
                    
                    const correctAnswers = q.answers.filter(a => a.correct === true);
                    if (correctAnswers.length !== 1) {
                        console.log('Error en pregunta ' + (i + 1) + ': respuestas correctas inválidas');
                        alert('Error en pregunta ' + (i + 1) + ': debe tener exactamente una respuesta marcada como "correct": true');
                        return;
                    }
                    
                    for (let j = 0; j < q.answers.length; j++) {
                        if (!q.answers[j].text || typeof q.answers[j].correct !== 'boolean') {
                            console.log('Error en pregunta ' + (i + 1) + ', respuesta ' + (j + 1) + ': formato inválido');
                            alert('Error en pregunta ' + (i + 1) + ': cada respuesta debe tener "text" y "correct" (boolean)');
                            return;
                        }
                    }
                }
                // Formato viejo: "options" con array de strings + "answer" numérico
                else if (q.options && Array.isArray(q.options)) {
                    if (q.options.length < 2) {
                        console.log('Error en pregunta ' + (i + 1) + ': pocas opciones');
                        alert('Error en pregunta ' + (i + 1) + ': debe tener al menos 2 opciones');
                        return;
                    }
                    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
                        console.log('Error en pregunta ' + (i + 1) + ': answer inválido');
                        alert('Error en pregunta ' + (i + 1) + ': "answer" debe ser un número válido (índice de la opción correcta)');
                        return;
                    }
                }
                else {
                    console.log('Error en pregunta ' + (i + 1) + ': formato no reconocido');
                    alert('Error en pregunta ' + (i + 1) + ': debe tener "answers" (formato nuevo) o "options" + "answer" (formato viejo)');
                    return;
                }
            }
            
            console.log('Todas las preguntas son válidas');
            
            // Crear cuestionario con formato compatible
            const quiz = {
                id: Date.now().toString(),
                title: quizData.name || 'Cuestionario Importado',
                description: quizData.description || '',
                timeLimit: quizData.timePerQuestion || quizData.timeLimit || 30,
                questions: quizData.questions.map(q => {
                    // Formato nuevo: "answers" con objetos {text, correct}
                    if (q.answers && Array.isArray(q.answers)) {
                        const options = q.answers.map(a => a.text);
                        const correctAnswer = q.answers.findIndex(a => a.correct === true);
                        return {
                            text: q.question,
                            options: options,
                            correctAnswer: correctAnswer,
                            justification: q.justification || ''
                        };
                    }
                    // Formato viejo: "options" + "answer"
                    else {
                        return {
                            text: q.question,
                            options: q.options,
                            correctAnswer: q.answer,
                            justification: q.justification || ''
                        };
                    }
                }),
                createdAt: new Date().toISOString()
            };
            
            // Guardar cuestionario
            saveQuiz(quiz);
            
            // Verificar que se guardó correctamente
            const allQuizzesAfterSave = getAllQuizzes();
            
            // Actualizar lista
            loadQuizList();
            
            // Limpiar input
            event.target.value = '';
            
            // Mostrar detalles de lo importado y ofrecer crear juego Firebase
            const questionSummary = quiz.questions.map((q, i) => (i + 1) + '. ' + q.text).join('\n');
            
            const createGame = confirm('✅ Cuestionario importado exitosamente!\n\n' +
                'Título: ' + quiz.title + '\n' +
                'Descripción: ' + (quiz.description || 'Sin descripción') + '\n' +
                'Tiempo límite: ' + quiz.timeLimit + ' segundos\n' +
                'Preguntas importadas: ' + quiz.questions.length + '\n\n' +
                '🎮 ¿Quieres crear un juego Firebase AHORA para compartir con estudiantes?\n\n' +
                '✅ SÍ - Crear juego y obtener código\n' +
                '❌ NO - Solo guardar localmente');
            
            if (createGame) {
                // Crear juego Firebase automáticamente
                console.log('🎮 Creando juego Firebase automáticamente para quiz importado:', quiz.id);
                startQuizWithFirebase(quiz.id, true);
            }
            
        } catch (error) {
            alert('Error al procesar el archivo JSON: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// ====== FUNCIONES DE UTILIDAD ======

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateFileName(title) {
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    return cleanTitle + '_' + timestamp + '.json';
}

// ====== NAVEGACIÓN ======

function clearAllQuizzes() {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los cuestionarios?\n\nEsta acción no se puede deshacer.')) {
        if (confirm('🔴 ÚLTIMA CONFIRMACIÓN: Esto eliminará permanentemente todos los cuestionarios. ¿Continuar?')) {
            localStorage.removeItem('quizzes');
            localStorage.removeItem('activeGames');
            loadQuizList();
            alert('✅ Todos los cuestionarios han sido eliminados');
        }
    }
}

function goHome() {
    window.location.href = 'index.html';
}

// ====== EXPORTACIÓN JSON DESDE FORMULARIO ======

function exportQuizAsJson() {
    if (!currentQuiz) {
        alert('No hay cuestionario para exportar');
        return;
    }
    
    try {
        // Mostrar mensaje de que la función fue eliminada por seguridad
        alert('⚠️ Función de exportación eliminada por seguridad\n\nEsta función podría exponer las respuestas correctas a los estudiantes.\n\nPara crear juegos, usa el botón "Iniciar Quiz" que es seguro.');
        
    } catch (error) {
        console.error('Error en exportQuizAsJson:', error);
        alert('Error: ' + error.message);
    }
}