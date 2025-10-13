// ====== VARIABLES GLOBALES ======

let gameCode = null;
let currentGame = null;
let currentQuestionIndex = 0;
let gameUpdateListener = null;
let refreshInterval = null;

// ====== INICIALIZACIÓN ======

document.addEventListener('DOMContentLoaded', function() {
    // Obtener código del juego de la URL
    const urlParams = new URLSearchParams(window.location.search);
    gameCode = urlParams.get('code');
    
    if (!gameCode) {
        alert('Código de juego no encontrado');
        window.close();
        return;
    }
    
    // Cargar datos del juego
    loadGameData();
    
    // Configurar actualizaciones
    setupGameUpdateListener();
    setupRefreshInterval();
});

function loadGameData() {
    currentGame = getActiveGame(gameCode);
    
    if (!currentGame) {
        alert('Juego no encontrado');
        window.close();
        return;
    }
    
    // Actualizar UI
    document.getElementById('gameCodeDisplay').textContent = gameCode;
    document.getElementById('quizTitle').textContent = currentGame.quiz.title;
    
    updateGameState();
    updatePlayersList();
    updateStats();
}

function setupGameUpdateListener() {
    gameUpdateListener = listenForGameUpdates(gameCode, handleGameUpdate);
}

function setupRefreshInterval() {
    // Actualizar datos cada 2 segundos
    refreshInterval = setInterval(() => {
        loadGameData();
    }, 2000);
}

function handleGameUpdate(update) {
    console.log('Actualización recibida en control:', update);
    
    switch (update.type) {
        case 'player_joined':
        case 'player_left':
        case 'answer_submitted':
            loadGameData();
            break;
    }
}

// ====== GESTIÓN DEL ESTADO DEL JUEGO ======

function updateGameState() {
    const waitingState = document.getElementById('waitingState');
    const questionState = document.getElementById('questionState');
    const finishedState = document.getElementById('finishedState');
    const startBtn = document.getElementById('startBtn');
    
    // Habilitar botón de inicio si hay al menos un jugador
    const playerCount = Object.keys(currentGame.players || {}).length;
    startBtn.disabled = playerCount === 0;
    
    if (currentGame.status === 'waiting') {
        waitingState.style.display = 'block';
        questionState.style.display = 'none';
        finishedState.style.display = 'none';
    } else if (currentGame.status === 'active') {
        waitingState.style.display = 'none';
        questionState.style.display = 'block';
        finishedState.style.display = 'none';
        
        updateQuestionDisplay();
        updateQuestionControls();
    } else if (currentGame.status === 'finished') {
        waitingState.style.display = 'none';
        questionState.style.display = 'none';
        finishedState.style.display = 'block';
    }
}

function updateQuestionDisplay() {
    const questionDisplay = document.getElementById('questionDisplay');
    const question = currentGame.quiz.questions[currentQuestionIndex];
    
    if (!question) return;
    
    // Mostrar pregunta sin respuesta correcta marcada (como lo ven los estudiantes)
    questionDisplay.innerHTML = `
        <h4>Pregunta ${currentQuestionIndex + 1} de ${currentGame.quiz.questions.length}</h4>
        <h3 style="margin: 16px 0; color: var(--primary-purple);">${escapeHtml(question.text)}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
            ${question.options.map((option, index) => {
                if (!option || option.trim() === '') return '';
                const optionLabels = ['A', 'B', 'C', 'D'];
                const optionColors = ['var(--answer-red)', 'var(--answer-blue)', 'var(--answer-yellow)', 'var(--answer-green)'];
                
                return `
                    <div style="padding: 12px; background: ${optionColors[index]}; color: ${index === 2 ? 'var(--dark-gray)' : 'var(--white)'}; border-radius: var(--radius-medium); text-align: center;">
                        <strong>${optionLabels[index]}</strong>: ${escapeHtml(option)}
                    </div>
                `;
            }).filter(html => html !== '').join('')}
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 8px;"></i>
            <strong>Vista del Profesor:</strong> Los estudiantes ven la misma pregunta sin indicadores de respuesta correcta.
        </div>
    `;
}

function showQuestionResults() {
    const questionDisplay = document.getElementById('questionDisplay');
    const question = currentGame.quiz.questions[currentQuestionIndex];
    
    if (!question) return;
    
    // Calcular estadísticas de respuestas
    const players = Object.values(currentGame.players || {});
    const answerStats = [0, 0, 0, 0];
    let totalAnswered = 0;
    
    players.forEach(player => {
        const currentAnswer = player.answers && player.answers[currentQuestionIndex];
        if (currentAnswer !== undefined && currentAnswer !== null) {
            answerStats[currentAnswer]++;
            totalAnswered++;
        }
    });
    
    // Mostrar resultados con justificación
    questionDisplay.innerHTML = `
        <h4>Resultados - Pregunta ${currentQuestionIndex + 1} de ${currentGame.quiz.questions.length}</h4>
        <h3 style="margin: 16px 0; color: var(--primary-purple);">${escapeHtml(question.text)}</h3>
        
        <!-- Respuesta correcta destacada -->
        <div style="margin: 20px 0; padding: 15px; background: #22c55e; color: white; border-radius: 10px; text-align: center;">
            <i class="fas fa-check-circle" style="font-size: 1.5rem; margin-right: 10px;"></i>
            <strong>Respuesta Correcta: ${['A', 'B', 'C', 'D'][question.correctAnswer]} - ${escapeHtml(question.options[question.correctAnswer])}</strong>
        </div>
        
        <!-- Justificación para explicar a los estudiantes -->
        ${question.justification ? `
            <div style="margin: 20px 0; padding: 20px; background: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0 0 10px 0; color: #92400e; display: flex; align-items: center;">
                    <i class="fas fa-lightbulb" style="margin-right: 10px;"></i>
                    Explicación para los Estudiantes:
                </h4>
                <p style="margin: 0; color: #78350f; font-size: 1.1rem; line-height: 1.6;">${escapeHtml(question.justification)}</p>
            </div>
        ` : ''}
        
        <!-- Estadísticas de respuestas -->
        <div style="margin: 20px 0;">
            <h4 style="margin-bottom: 15px; color: #374151;">Estadísticas de Respuestas (${totalAnswered} estudiantes respondieron):</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                ${question.options.map((option, index) => {
                    if (!option || option.trim() === '') return '';
                    const isCorrect = index === question.correctAnswer;
                    const count = answerStats[index];
                    const percentage = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
                    const optionLabels = ['A', 'B', 'C', 'D'];
                    const optionColors = ['var(--answer-red)', 'var(--answer-blue)', 'var(--answer-yellow)', 'var(--answer-green)'];
                    
                    return `
                        <div style="padding: 15px; background: ${optionColors[index]}; color: ${index === 2 ? 'var(--dark-gray)' : 'var(--white)'}; border-radius: var(--radius-medium); text-align: center; position: relative; ${isCorrect ? 'border: 3px solid #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);' : ''}">
                            <strong>${optionLabels[index]}</strong>: ${escapeHtml(option)}
                            ${isCorrect ? '<i class="fas fa-crown" style="position: absolute; top: 8px; right: 8px; color: #fbbf24;"></i>' : ''}
                            <div style="margin-top: 10px; font-size: 1.2rem; font-weight: bold;">
                                ${count} estudiante${count !== 1 ? 's' : ''} (${percentage}%)
                            </div>
                        </div>
                    `;
                }).filter(html => html !== '').join('')}
            </div>
        </div>
        
        <!-- Consejos para el profesor -->
        <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px; border-left: 4px solid #0284c7;">
            <i class="fas fa-chalkboard-teacher" style="color: #0284c7; margin-right: 8px;"></i>
            <strong>Momento de Aprendizaje:</strong> Usa la explicación anterior para discutir la respuesta con los estudiantes. Pregúntales por qué eligieron sus respuestas y fomenta el debate constructivo.
        </div>
    `;
}

function updateQuestionControls() {
    const showResultsBtn = document.getElementById('showResultsBtn');
    const openResultsWindowBtn = document.getElementById('openResultsWindowBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    
    // Verificar cuántos jugadores han respondido
    const totalPlayers = Object.keys(currentGame.players || {}).length;
    const playersAnswered = getPlayersAnsweredCurrentQuestion();
    
    // Habilitar botones de resultados si al menos un jugador respondió
    const canShowResults = playersAnswered > 0;
    showResultsBtn.disabled = !canShowResults;
    openResultsWindowBtn.disabled = !canShowResults;
    
    // Habilitar botón de siguiente pregunta si todos respondieron o se mostraron resultados
    const allAnswered = playersAnswered === totalPlayers && totalPlayers > 0;
    nextQuestionBtn.disabled = !allAnswered;
    
    // Si es la última pregunta, cambiar texto del botón
    if (currentQuestionIndex >= currentGame.quiz.questions.length - 1) {
        nextQuestionBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> Finalizar Cuestionario';
    }
}

function getPlayersAnsweredCurrentQuestion() {
    let count = 0;
    Object.values(currentGame.players || {}).forEach(player => {
        if (player.answers && player.answers.length > currentQuestionIndex) {
            count++;
        }
    });
    return count;
}

// ====== CONTROL DE CUESTIONARIO ======

function startQuiz() {
    try {
        currentGame.status = 'active';
        currentGame.startTime = new Date().toISOString();
        currentQuestionIndex = 0;
        
        updateActiveGame(gameCode, currentGame);
        
        // Broadcast inicio del juego
        broadcastGameUpdate(gameCode, 'game_started', {
            startTime: currentGame.startTime,
            questionIndex: currentQuestionIndex
        });
        
        updateGameState();
        
        setTimeout(() => {
            // Enviar primera pregunta
            broadcastGameUpdate(gameCode, 'next_question', {
                questionIndex: currentQuestionIndex
            });
        }, 1000);
        
    } catch (error) {
        alert('Error al iniciar el cuestionario: ' + error.message);
    }
}

function showResults() {
    // Mostrar los resultados con justificación en el panel principal
    showQuestionResults();
    
    // Broadcast de resultados a estudiantes
    broadcastGameUpdate(gameCode, 'show_results', {
        questionIndex: currentQuestionIndex,
        question: currentGame.quiz.questions[currentQuestionIndex],
        correctAnswer: currentGame.quiz.questions[currentQuestionIndex].correctAnswer
    });
    
    // Actualizar controles
    updateQuestionControls();
}

function openResultsWindow() {
    const question = currentGame.quiz.questions[currentQuestionIndex];
    
    // Calcular estadísticas de respuestas
    const players = Object.values(currentGame.players || {});
    const answerStats = [0, 0, 0, 0];
    let totalAnswered = 0;
    
    players.forEach(player => {
        const currentAnswer = player.answers && player.answers[currentQuestionIndex];
        if (currentAnswer !== undefined && currentAnswer !== null) {
            answerStats[currentAnswer]++;
            totalAnswered++;
        }
    });
    
    // Preparar datos para la ventana de resultados
    const resultsData = {
        question: question,
        questionIndex: currentQuestionIndex,
        totalQuestions: currentGame.quiz.questions.length,
        answerStats: answerStats,
        totalAnswered: totalAnswered,
        justification: question.justification || null
    };
    
    // Guardar en localStorage para que la ventana pueda acceder
    localStorage.setItem('currentQuestionResults', JSON.stringify(resultsData));
    
    // Abrir nueva ventana con los resultados
    const resultsWindow = window.open(
        'results-display.html',
        'kahoot-results',
        'width=1200,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no'
    );
    
    // Enviar datos a la ventana cuando se abra
    if (resultsWindow) {
        resultsWindow.onload = function() {
            resultsWindow.postMessage({
                type: 'showResults',
                results: resultsData
            }, '*');
        };
        
        // También broadcast a estudiantes
        broadcastGameUpdate(gameCode, 'show_results', {
            questionIndex: currentQuestionIndex,
            question: question,
            correctAnswer: question.correctAnswer
        });
        
        // Actualizar controles
        updateQuestionControls();
        
        // Opcional: mostrar mensaje de confirmación
        setTimeout(() => {
            alert('¡Ventana de resultados abierta! Puedes compartir esta ventana con los estudiantes mientras mantienes privado el panel de control.');
        }, 500);
    } else {
        alert('No se pudo abrir la ventana de resultados. Asegúrate de que el navegador permita ventanas emergentes.');
    }
}

function hideResults() {
    document.getElementById('resultsPanel').style.display = 'none';
}

function nextQuestion() {
    if (currentQuestionIndex >= currentGame.quiz.questions.length - 1) {
        // Finalizar cuestionario
        finishQuiz();
        return;
    }
    
    currentQuestionIndex++;
    
    // Actualizar juego
    currentGame.currentQuestion = currentQuestionIndex;
    updateActiveGame(gameCode, currentGame);
    
    // Ocultar resultados
    hideResults();
    
    // Broadcast siguiente pregunta
    broadcastGameUpdate(gameCode, 'next_question', {
        questionIndex: currentQuestionIndex
    });
    
    updateGameState();
}

function finishQuiz() {
    currentGame.status = 'finished';
    currentGame.endTime = new Date().toISOString();
    
    updateActiveGame(gameCode, currentGame);
    
    // Preparar datos del ranking final para compartir
    const players = Object.values(currentGame.players || {});
    players.sort((a, b) => b.score - a.score);
    
    const totalQuestions = currentGame.quiz.questions.length;
    const finalRankingData = {
        endTime: currentGame.endTime,
        totalQuestions: totalQuestions,
        totalPlayers: players.length,
        rankings: players.map((player, index) => {
            const correctAnswers = player.answers ? player.answers.filter(a => a.isCorrect).length : 0;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            
            return {
                position: index + 1,
                id: player.id,
                name: player.name,
                avatar: player.avatar || '👤',
                score: player.score,
                correctAnswers: correctAnswers,
                totalAnswers: player.answers ? player.answers.length : 0,
                accuracy: accuracy
            };
        })
    };
    
    // Broadcast fin del cuestionario con ranking completo
    broadcastGameUpdate(gameCode, 'quiz_finished', finalRankingData);
    
    updateGameState();
    showFinalLeaderboard();
}

function endQuiz() {
    if (confirm('¿Estás seguro de que quieres terminar el cuestionario? Esta acción no se puede deshacer.')) {
        // Broadcast fin del juego
        broadcastGameUpdate(gameCode, 'game_ended', {
            endTime: new Date().toISOString()
        });
        
        // Eliminar juego activo
        deleteActiveGame(gameCode);
        
        alert('Cuestionario terminado. Esta ventana se cerrará.');
        window.close();
    }
}

// ====== ACTUALIZACIÓN DE UI ======

function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    const players = Object.values(currentGame.players || {});
    
    if (players.length === 0) {
        playersList.innerHTML = `
            <div style="text-align: center; color: var(--medium-gray); padding: 20px;">
                <i class="fas fa-user-clock"></i>
                <p>Esperando jugadores...</p>
            </div>
        `;
        return;
    }
    
    // Ordenar jugadores por puntuación
    players.sort((a, b) => b.score - a.score);
    
    playersList.innerHTML = players.map((player, index) => {
        const hasAnsweredCurrent = player.answers && player.answers.length > currentQuestionIndex;
        const statusIcon = hasAnsweredCurrent ? 
            '<i class="fas fa-check" style="color: var(--success-green);"></i>' : 
            '<i class="fas fa-clock" style="color: var(--warning-orange);"></i>';
        
        return `
            <div class="player-item">
                <div class="player-info">
                    <div class="player-avatar">${player.avatar || player.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style="font-weight: 600;">${escapeHtml(player.name)}</div>
                        <div style="font-size: 12px; color: var(--medium-gray);">
                            ${player.answers ? player.answers.length : 0} respuestas
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--primary-purple);">${player.score} pts</div>
                    <div style="font-size: 12px;">${statusIcon}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const players = Object.values(currentGame.players || {});
    const playersCount = players.length;
    const answeredCount = getPlayersAnsweredCurrentQuestion();
    const averageScore = playersCount > 0 ? Math.round(players.reduce((sum, p) => sum + p.score, 0) / playersCount) : 0;
    
    document.getElementById('playersCount').textContent = playersCount;
    document.getElementById('currentQuestionNum').textContent = 
        currentGame.status === 'active' ? currentQuestionIndex + 1 : '-';
    document.getElementById('answeredCount').textContent = answeredCount;
    document.getElementById('averageScore').textContent = averageScore;
}

function showFinalLeaderboard() {
    const leaderboardPanel = document.getElementById('leaderboardPanel');
    const leaderboardContent = document.getElementById('leaderboardContent');
    
    const players = Object.values(currentGame.players || {});
    players.sort((a, b) => b.score - a.score);
    
    const totalQuestions = currentGame.quiz.questions.length;
    
    leaderboardContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Clasificación Final</h4>
            <p style="color: var(--medium-gray);">${players.length} jugadores • ${totalQuestions} preguntas</p>
        </div>
        <div style="display: grid; gap: 12px;">
            ${players.map((player, index) => {
                const correctAnswers = player.answers ? player.answers.filter(a => a.isCorrect).length : 0;
                const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
                
                const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Oro, Plata, Bronce
                const backgroundColor = index < 3 ? podiumColors[index] : 'var(--light-gray)';
                const textColor = index < 3 ? 'var(--dark-gray)' : 'var(--dark-gray)';
                
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: ${backgroundColor}; color: ${textColor}; border-radius: var(--radius-medium); font-weight: 600;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 20px; font-weight: 700; min-width: 30px;">
                                ${index + 1}${index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                            </div>
                            <div style="font-size: 24px;">${player.avatar || '👤'}</div>
                            <div>
                                <div style="font-size: 16px;">${escapeHtml(player.name)}</div>
                                <div style="font-size: 12px; opacity: 0.8;">${correctAnswers}/${totalQuestions} correctas (${accuracy}%)</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: 700;">${player.score}</div>
                            <div style="font-size: 12px; opacity: 0.8;">puntos</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top: 24px; text-align: center;">
            <button class="btn btn-primary" onclick="downloadResults()">
                <i class="fas fa-download"></i>
                Descargar Resultados
            </button>
        </div>
    `;
    
    leaderboardPanel.style.display = 'block';
}

function downloadResults() {
    const players = Object.values(currentGame.players || {});
    const quiz = currentGame.quiz;
    
    // Crear CSV con los resultados
    let csv = 'Nombre,Puntuación,Respuestas Correctas,Precisión\n';
    
    players.forEach(player => {
        const correctAnswers = player.answers ? player.answers.filter(a => a.isCorrect).length : 0;
        const totalQuestions = quiz.questions.length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        csv += `"${player.name}",${player.score},${correctAnswers}/${totalQuestions},${accuracy}%\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados_${quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ====== FUNCIONES DE UTILIDAD ======

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ====== CLEANUP ======

window.addEventListener('beforeunload', function() {
    if (gameUpdateListener) {
        gameUpdateListener();
    }
    
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});