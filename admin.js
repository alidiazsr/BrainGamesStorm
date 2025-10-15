// admin-simple.js - Versión limpia sin código de debug

let currentQuiz = null;
let editingQuizId = null;
let questionCount = 0;

// ====== INICIALIZACIÓN ======

document.addEventListener('DOMContentLoaded', function() {
    // Verificar que las funciones principales de script.js estén disponibles
    if (typeof getAllQuizzes !== 'function' || typeof getQuizById !== 'function' || 
        typeof saveQuiz !== 'function' || typeof deleteQuiz !== 'function') {
        console.error('Error: Funciones de script.js no están disponibles');
        alert('Error del sistema: Algunas funciones no están disponibles. Por favor, recarga la página.');
        return;
    }
    
    loadQuizList();
    
    // Event listener solo para el input de archivo
    const jsonFileInput = document.getElementById('jsonFileInput');
    if (jsonFileInput) {
        jsonFileInput.addEventListener('change', handleJsonFileImport);
    }
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
                <button class="btn btn-primary" onclick="startQuiz('${quiz.id}')">
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
        // Formato simple compatible con la versión anterior
        const quizJson = {
            name: quiz.title,
            description: quiz.description || '',
            timeLimit: quiz.timeLimit || 30,
            questions: quiz.questions.map(q => ({
                question: q.text,
                options: q.options,
                answer: q.correctAnswer,
                justification: q.justification || ''
            }))
        };
        
        // Generar nombre de archivo
        const fileName = generateFileName(quiz.title);
        
        // Descargar archivo JSON
        downloadJsonFile(quizJson, fileName);
        
        alert('Cuestionario exportado exitosamente como JSON');
        
    } catch (error) {
        console.error('Error exportando cuestionario:', error);
        alert('Error al exportar el cuestionario: ' + error.message);
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
    // Verificar que las funciones de script.js estén disponibles
    if (typeof getQuizById !== 'function') {
        alert('Error: Las funciones del sistema no están disponibles. Recarga la página.');
        return;
    }
    
    const quiz = getQuizById(quizId);
    if (!quiz) {
        alert('Cuestionario no encontrado');
        return;
    }
    
    // Verificar si Firebase está configurado
    if (typeof firebase !== 'undefined' && window.firebaseConfigured) {
        // Usar Firebase (SOLUCIÓN DEFINITIVA)
        startQuizWithFirebase(quizId);
        return;
    }
    
    // Si no hay Firebase, mostrar opciones
    showSystemSelectionModal(quizId, quiz);
}

function showSystemSelectionModal(quizId, quiz) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; overflow-y: auto;';
    modal.innerHTML = 
        '<div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">' +
            '<h2 style="margin: 0 0 20px 0; color: #333; text-align: center;"><i class="fas fa-rocket"></i> Elegir Sistema para: ' + quiz.title + '</h2>' +
            
            '<div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
                '<h3 style="margin: 0 0 15px 0; color: #1976d2;"><i class="fas fa-info-circle"></i> ¿Qué necesitas?</h3>' +
                '<p style="margin: 0; color: #333;">Para que funcione desde <strong>cualquier dispositivo/red</strong>, necesitas un servidor en la nube.</p>' +
            '</div>' +
            
            '<div style="display: grid; gap: 15px; margin: 20px 0;">' +
                
                '<div style="border: 2px solid #4caf50; border-radius: 12px; padding: 20px; background: #f1f8e9; position: relative;">' +
                    '<div style="position: absolute; top: -10px; right: 10px; background: #4caf50; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold;">RECOMENDADO</div>' +
                    '<h4 style="margin: 0 0 10px 0; color: #2e7d32;"><i class="fas fa-fire"></i> Firebase - Gratis para Siempre</h4>' +
                    '<p style="margin: 0 0 15px 0; color: #333; font-size: 14px;">• Funciona desde cualquier dispositivo del mundo<br>• Tiempo real automático<br>• 1GB gratis (≈500,000 quizzes)<br>• Setup: 15 minutos</p>' +
                    '<button onclick="setupFirebase()" style="background: #4caf50; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; width: 100%;"><i class="fas fa-rocket"></i> Configurar Firebase (15 min)</button>' +
                '</div>' +
                
                '<div style="border: 2px solid #ff9800; border-radius: 12px; padding: 20px; background: #fff3e0;">' +
                    '<h4 style="margin: 0 0 10px 0; color: #f57c00;"><i class="fas fa-file-alt"></i> Sistema de Archivos (Actual)</h4>' +
                    '<p style="margin: 0 0 15px 0; color: #333; font-size: 14px;">• Solo funciona en la misma red<br>• Requiere subir archivos manualmente<br>• ❌ No resuelve tu problema actual</p>' +
                    '<button onclick="useFileSystem(' + quizId + ')" style="background: #ff9800; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; width: 100%;"><i class="fas fa-folder"></i> Usar Sistema Actual</button>' +
                '</div>' +
                
                '<details style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f9f9f9;">' +
                    '<summary style="cursor: pointer; font-weight: bold; color: #666;"><i class="fas fa-cog"></i> Opciones Avanzadas</summary>' +
                    '<div style="margin-top: 15px; font-size: 14px;">' +
                        '<p><strong>💪 PHP/MySQL:</strong> Si tienes hosting web con base de datos</p>' +
                        '<p><strong>⚡ Node.js:</strong> Si quieres máximo rendimiento y control</p>' +
                        '<p><strong>🛠️ Otros servicios:</strong> Supabase, Railway, etc.</p>' +
                        '<button onclick="showAdvancedOptions(' + quizId + ')" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-top: 10px;">Ver Opciones Avanzadas</button>' +
                    '</div>' +
                '</details>' +
            '</div>' +
            
            '<div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">' +
                '<h4 style="margin: 0 0 10px 0; color: #856404;"><i class="fas fa-lightbulb"></i> Recomendación</h4>' +
                '<p style="margin: 0; color: #856404; font-size: 14px;">Para resolver definitivamente el problema de <strong>"código inválido desde otros dispositivos"</strong>, elige Firebase. Es gratis y funciona perfectamente.</p>' +
            '</div>' +
            
            '<div style="text-align: center; margin-top: 20px;">' +
                '<button onclick="this.closest(\'div\').closest(\'div\').remove()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
}

function setupFirebase() {
    window.open('firebase-setup.html', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
}

function useFileSystem(quizId) {
    // Cerrar modal
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
    
    // Confirmar inicio del quiz
    const quiz = getQuizById(quizId);
    if (!confirm('¿Iniciar el cuestionario "' + quiz.title + '"?\n\n' + quiz.questions.length + ' preguntas • ' + (quiz.timeLimit || 30) + 's por pregunta\n\n⚠️ NOTA: Este sistema solo funciona en la misma red. Para otros dispositivos, configura Firebase.')) {
        return;
    }
    
    try {
        // Usar el sistema de archivos estáticos
        createStaticGameFile(quizId);
        
    } catch (error) {
        console.error('Error al iniciar quiz:', error);
        alert('Error al iniciar el cuestionario: ' + error.message);
    }
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
            
            // Mostrar detalles de lo importado
            const questionSummary = quiz.questions.map((q, i) => (i + 1) + '. ' + q.text).join('\n');
            alert('Cuestionario importado exitosamente!\n\nTítulo: ' + quiz.title + '\nDescripción: ' + (quiz.description || 'Sin descripción') + '\nTiempo límite: ' + quiz.timeLimit + ' segundos\nPreguntas importadas: ' + quiz.questions.length + '\n\nPreguntas:\n' + questionSummary);
            
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

function downloadJsonFile(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        // Recopilar datos actuales del formulario
        const title = document.getElementById('quizTitle').value.trim();
        const description = document.getElementById('quizDescription').value.trim();
        const timeLimit = parseInt(document.getElementById('timeLimit').value);
        
        // Recopilar preguntas
        const questions = [];
        const questionElements = document.querySelectorAll('.question-item');
        
        questionElements.forEach((questionEl, index) => {
            const questionText = questionEl.querySelector('.question-text').value.trim();
            const options = Array.from(questionEl.querySelectorAll('.answer-option input[type="text"]'))
                .map(input => input.value.trim());
            const correctAnswerRadio = questionEl.querySelector('input[name="correct_' + questionEl.dataset.questionId + '"]:checked');
            
            if (questionText && correctAnswerRadio) {
                questions.push({
                    question: questionText,
                    options: options,
                    answer: parseInt(correctAnswerRadio.value),
                    justification: ''
                });
            }
        });
        
        // Crear objeto JSON simple
        const quizJson = {
            name: title,
            description: description,
            timeLimit: timeLimit,
            questions: questions
        };
        
        // Generar nombre de archivo
        const fileName = generateFileName(title);
        
        // Descargar archivo JSON
        downloadJsonFile(quizJson, fileName);
        
        alert('Cuestionario exportado exitosamente como JSON');
        
    } catch (error) {
        console.error('Error exportando cuestionario:', error);
        alert('Error al exportar el cuestionario: ' + error.message);
    }
}