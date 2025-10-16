// ====== BRAIN GAMES STORM - PANEL DE ADMINISTRACIÓN ======
// Versión simplificada y funcional

// Variables globales
let currentQuiz = null;

// ====== INICIALIZACIÓN ======

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando panel de administración...');
    
    // Cargar lista de quizzes
    loadQuizList();
    
    // Verificar que script.js esté disponible
    if (typeof getAllQuizzes !== 'function') {
        console.error('❌ script.js no está disponible');
        alert('Error: Funciones del sistema no disponibles. Recarga la página.');
        return;
    }
    
    // Configurar importación de JSON
    const jsonInput = document.getElementById('jsonFileInput');
    if (jsonInput) {
        jsonInput.addEventListener('change', handleJsonFileImport);
    }
    
    console.log('✅ Panel de administración inicializado');
});

// ====== GESTIÓN DE QUIZZES ======

function loadQuizList() {
    console.log('📚 Cargando lista de quizzes...');
    
    const quizzes = getAllQuizzes();
    const container = document.getElementById('quizContainer');
    
    if (!container) {
        console.error('❌ Contenedor de quizzes no encontrado');
        return;
    }
    
    if (quizzes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No hay cuestionarios</h3>
                <p>Crea tu primer cuestionario para comenzar</p>
                <button class="btn btn-primary" onclick="createNewQuiz()">
                    <i class="fas fa-plus"></i>
                    Crear Cuestionario
                </button>
            </div>
        `;
        return;
    }
    
    let html = quizzes.map(quiz => `
        <div class="quiz-card" data-quiz-id="${quiz.id}">
            <div class="quiz-header">
                <h3>${escapeHtml(quiz.title)}</h3>
                <div class="quiz-meta">
                    <span class="question-count">
                        <i class="fas fa-question-circle"></i>
                        ${quiz.questions?.length || 0} preguntas
                    </span>
                </div>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-outline" onclick="editQuiz('${quiz.id}')">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn btn-primary" onclick="startQuiz('${quiz.id}')">
                    <i class="fas fa-play"></i>
                    Iniciar
                </button>
                <button class="btn btn-secondary" onclick="duplicateQuiz('${quiz.id}')">
                    <i class="fas fa-copy"></i>
                    Duplicar
                </button>
                <button class="btn btn-danger" onclick="deleteQuizConfirm('${quiz.id}')">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    console.log(`✅ ${quizzes.length} quizzes cargados`);
}

function createNewQuiz() {
    currentQuiz = {
        id: generateQuizId(),
        title: '',
        questions: []
    };
    
    showQuizForm();
}

function editQuiz(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    currentQuiz = { ...quiz };
    showQuizForm();
}

function showQuizForm() {
    const formContainer = document.getElementById('quizFormContainer');
    if (formContainer) {
        formContainer.style.display = 'block';
        
        // Llenar datos del quiz
        const titleInput = document.getElementById('quizTitle');
        if (titleInput) {
            titleInput.value = currentQuiz.title || '';
        }
        
        // Cargar preguntas
        renderQuestions();
    }
}

function closeQuizForm() {
    const formContainer = document.getElementById('quizFormContainer');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    currentQuiz = null;
}

// ====== FUNCIÓN PRINCIPAL: INICIAR QUIZ ======

async function startQuiz(quizId) {
    console.log('🎮 Iniciando quiz:', quizId);
    
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
        alert('El cuestionario no tiene preguntas');
        return;
    }
    
    try {
        // Intentar usar Firebase Simple
        if (typeof window.initFirebase === 'function' && typeof window.createGameInFirebase === 'function') {
            console.log('🔥 Usando Firebase Simple...');
            
            // Inicializar Firebase
            const firebaseReady = await window.initFirebase();
            
            if (firebaseReady) {
                // Crear juego en Firebase
                const gameCode = await window.createGameInFirebase(quizId);
                
                // Mostrar código de juego
                showGameCode(gameCode, quiz);
                
                // Mensaje de éxito
                setTimeout(() => {
                    alert(`✅ Juego creado en Firestore!\n\n📱 Código: ${gameCode}\n\n🌐 Los estudiantes pueden unirse desde cualquier dispositivo usando este código.`);
                }, 500);
                
                return;
            }
        }
        
        // Fallback al sistema local
        console.log('📁 Usando sistema local...');
        const localCode = 'LOCAL-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        showGameCode(localCode, quiz);
        
        alert(`⚠️ Juego creado localmente\n\n📱 Código: ${localCode}\n\n⚠️ Solo funciona en este dispositivo.\nPara jugar desde múltiples dispositivos, verifica tu conexión a internet.`);
        
    } catch (error) {
        console.error('❌ Error creando juego:', error);
        
        // Sistema de respaldo
        const backupCode = 'ERROR-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        showGameCode(backupCode, quiz);
        
        alert(`❌ Error del sistema\n\n📱 Código de respaldo: ${backupCode}\n\n⚠️ Solo funciona en este dispositivo.`);
    }
}

function showGameCode(gameCode, quiz) {
    console.log('📺 Mostrando código de juego:', gameCode);
    
    // Actualizar el modal
    const gameCodeDisplay = document.getElementById('gameCodeDisplay');
    if (gameCodeDisplay) {
        gameCodeDisplay.textContent = gameCode;
    }
    
    // Mostrar modal
    const startModal = document.getElementById('startModal');
    if (startModal) {
        startModal.style.display = 'flex';
    }
    
    // Copiar al portapapeles
    if (navigator.clipboard && window.location.protocol === 'https:') {
        navigator.clipboard.writeText(gameCode).then(() => {
            console.log('📋 Código copiado al portapapeles');
        }).catch(() => {
            console.log('⚠️ No se pudo copiar al portapapeles');
        });
    }
    
    console.log(`🎮 ${quiz.title} - Código: ${gameCode}`);
}

function closeStartModal() {
    const startModal = document.getElementById('startModal');
    if (startModal) {
        startModal.style.display = 'none';
    }
}

function startQuizSession() {
    // Abrir game.html para controlar la sesión
    window.open('game.html', '_blank');
    closeStartModal();
}

// ====== GESTIÓN DE PREGUNTAS ======

function addQuestion() {
    if (!currentQuiz) return;
    
    const newQuestion = {
        id: Date.now().toString(),
        question: '',
        answers: ['', '', '', ''],
        correctAnswer: 0
    };
    
    currentQuiz.questions.push(newQuestion);
    renderQuestions();
}

function removeQuestion(questionId) {
    if (!currentQuiz) return;
    
    currentQuiz.questions = currentQuiz.questions.filter(q => q.id !== questionId);
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container || !currentQuiz) return;
    
    if (currentQuiz.questions.length === 0) {
        container.innerHTML = `
            <div class="empty-questions">
                <p>No hay preguntas. Agrega la primera pregunta.</p>
                <button class="btn btn-primary" onclick="addQuestion()">
                    <i class="fas fa-plus"></i>
                    Agregar Pregunta
                </button>
            </div>
        `;
        return;
    }
    
    const html = currentQuiz.questions.map((question, index) => `
        <div class="question-item" data-question-id="${question.id}">
            <div class="question-header">
                <h4>Pregunta ${index + 1}</h4>
                <button class="btn btn-danger btn-sm" onclick="removeQuestion('${question.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="question-content">
                <label>Pregunta:</label>
                <input type="text" value="${escapeHtml(question.question)}" 
                       onchange="updateQuestion('${question.id}', 'question', this.value)">
                
                <label>Respuestas:</label>
                <div class="answers-grid">
                    ${question.answers.map((answer, answerIndex) => `
                        <div class="answer-option ${question.correctAnswer === answerIndex ? 'correct' : ''}">
                            <input type="text" value="${escapeHtml(answer)}" 
                                   onchange="updateQuestion('${question.id}', 'answer', this.value, ${answerIndex})">
                            <button class="btn btn-sm ${question.correctAnswer === answerIndex ? 'btn-success' : 'btn-outline'}" 
                                    onclick="setCorrectAnswer('${question.id}', ${answerIndex})">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function updateQuestion(questionId, field, value, index = null) {
    if (!currentQuiz) return;
    
    const question = currentQuiz.questions.find(q => q.id === questionId);
    if (!question) return;
    
    if (field === 'question') {
        question.question = value;
    } else if (field === 'answer' && index !== null) {
        question.answers[index] = value;
    }
}

function setCorrectAnswer(questionId, answerIndex) {
    if (!currentQuiz) return;
    
    const question = currentQuiz.questions.find(q => q.id === questionId);
    if (!question) return;
    
    question.correctAnswer = answerIndex;
    renderQuestions();
}

// ====== GUARDAR Y GESTIÓN ======

function saveQuiz() {
    if (!currentQuiz) return;
    
    const titleInput = document.getElementById('quizTitle');
    if (titleInput) {
        currentQuiz.title = titleInput.value.trim();
    }
    
    if (!currentQuiz.title) {
        alert('El título del cuestionario es requerido');
        return;
    }
    
    if (currentQuiz.questions.length === 0) {
        alert('Agrega al menos una pregunta');
        return;
    }
    
    // Validar preguntas
    for (let i = 0; i < currentQuiz.questions.length; i++) {
        const question = currentQuiz.questions[i];
        if (!question.question.trim()) {
            alert(`La pregunta ${i + 1} está vacía`);
            return;
        }
        
        const validAnswers = question.answers.filter(a => a.trim()).length;
        if (validAnswers < 2) {
            alert(`La pregunta ${i + 1} debe tener al menos 2 respuestas`);
            return;
        }
    }
    
    // Guardar quiz
    try {
        saveQuiz(currentQuiz);
        alert('✅ Cuestionario guardado exitosamente');
        closeQuizForm();
        loadQuizList();
    } catch (error) {
        console.error('Error guardando quiz:', error);
        alert('❌ Error guardando el cuestionario');
    }
}

function deleteQuizConfirm(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) return;
    
    if (confirm(`¿Eliminar "${quiz.title}"?`)) {
        deleteQuiz(quizId);
        loadQuizList();
        alert('Cuestionario eliminado');
    }
}

function duplicateQuiz(quizId) {
    const quiz = getQuizById(quizId);
    if (!quiz) return;
    
    const newQuiz = {
        ...quiz,
        id: generateQuizId(),
        title: `${quiz.title} (Copia)`
    };
    
    saveQuiz(newQuiz);
    loadQuizList();
    alert('Cuestionario duplicado');
}

// ====== IMPORTACIÓN JSON ======

function importQuizFromJson() {
    const input = document.getElementById('jsonFileInput');
    if (input) {
        input.click();
    }
}

async function handleJsonFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validar estructura
        if (!data.title || !Array.isArray(data.questions)) {
            throw new Error('Formato JSON inválido');
        }
        
        // Crear quiz
        const quiz = {
            id: generateQuizId(),
            title: data.title,
            questions: data.questions.map(q => ({
                id: Date.now().toString() + Math.random(),
                question: q.question || q.pregunta || '',
                answers: q.answers || q.respuestas || [],
                correctAnswer: q.correctAnswer || q.respuestaCorrecta || 0
            }))
        };
        
        // Guardar
        saveQuiz(quiz);
        loadQuizList();
        
        // Preguntar si quiere crear juego inmediatamente
        if (confirm(`✅ "${quiz.title}" importado exitosamente!\n\n¿Crear juego inmediatamente?`)) {
            startQuiz(quiz.id);
        }
        
    } catch (error) {
        console.error('Error importando JSON:', error);
        alert('❌ Error al importar: ' + error.message);
    }
    
    // Limpiar input
    event.target.value = '';
}

// ====== UTILIDADES ======

function generateQuizId() {
    return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substring(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearAllQuizzes() {
    if (confirm('⚠️ ¿Eliminar TODOS los cuestionarios?\n\nEsta acción no se puede deshacer.')) {
        localStorage.removeItem('quizzes');
        loadQuizList();
        alert('✅ Todos los cuestionarios han sido eliminados');
    }
}

// ====== DIAGNÓSTICO SIMPLE ======

function diagnosticFirebase() {
    console.log('🔍 Diagnóstico Firebase...');
    
    const checks = [
        { name: 'Firebase Simple cargado', check: () => typeof window.initFirebase === 'function' },
        { name: 'Firebase SDK disponible', check: () => typeof firebase !== 'undefined' },
        { name: 'Función createGame disponible', check: () => typeof window.createGameInFirebase === 'function' },
        { name: 'HTTPS (requerido)', check: () => window.location.protocol === 'https:' },
        { name: 'Conexión a internet', check: () => navigator.onLine }
    ];
    
    const results = checks.map(check => {
        const status = check.check();
        return `${status ? '✅' : '❌'} ${check.name}`;
    });
    
    const summary = results.join('\n');
    console.log('📋 Diagnóstico:\n' + summary);
    
    alert(`🔍 DIAGNÓSTICO FIREBASE\n\n${summary}\n\n${results.filter(r => r.startsWith('❌')).length === 0 ? 
        '🎉 Todo parece estar bien!' : 
        '⚠️ Se encontraron problemas. Revisa la consola.'}`);
}

console.log('📝 Admin panel limpio cargado');