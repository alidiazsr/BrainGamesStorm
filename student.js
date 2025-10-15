// ====== VARIABLES GLOBALES ======

let currentGameCode = null;
let currentPlayerId = null;
let currentPlayerName = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let timer = null;
let timeRemaining = 0;
let totalTime = 0;
let playerScore = 0;
let playerAnswers = [];
let gameUpdateListener = null;

// ====== SISTEMA DE SONIDO ======

class SoundSystem {
    constructor() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        } catch (e) {
            console.warn('Web Audio API no disponible:', e);
            this.audioContext = null;
            this.soundEnabled = false;
        }
    }

    createOscillator(frequency, type = 'sine') {
        if (!this.audioContext || !this.soundEnabled) return null;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        return { oscillator, gainNode };
    }

    playTick() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Opción C: Chasquido Suave - Como chasquear dedos suavemente, orgánico
        const { oscillator, gainNode } = this.createOscillator(300, 'square');
        if (!oscillator) return;
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playCorrect() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Opción C: Melodía de Logro - Fanfarria corta pero elegante de triunfo
        const achievementMelody = [
            { freq: 523.25, time: 0, duration: 0.4 },    // C5
            { freq: 659.25, time: 0.15, duration: 0.4 }, // E5
            { freq: 783.99, time: 0.3, duration: 0.4 },  // G5
            { freq: 1046.5, time: 0.45, duration: 0.6 }  // C6
        ];

        achievementMelody.forEach(note => {
            const { oscillator, gainNode } = this.createOscillator(note.freq, 'triangle');
            if (!oscillator) return;
            
            gainNode.gain.setValueAtTime(0.18, this.audioContext.currentTime + note.time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.time + note.duration);
            
            oscillator.start(this.audioContext.currentTime + note.time);
            oscillator.stop(this.audioContext.currentTime + note.time + note.duration);
        });
    }

    playIncorrect() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Opción A: Suspiro Suave - Tono descendente muy suave, comprensivo
        const { oscillator, gainNode } = this.createOscillator(400, 'sine');
        if (!oscillator) return;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    playQuestionStart() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Secuencia ascendente
        const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        
        frequencies.forEach((freq, index) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'triangle');
            if (!oscillator) return;
            
            gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.3);
            
            oscillator.start(this.audioContext.currentTime + index * 0.15);
            oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
        });
    }

    playPodium() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Fanfarria de celebración
        const melody = [
            { freq: 523.25, time: 0 },     // C5
            { freq: 659.25, time: 0.2 },   // E5  
            { freq: 783.99, time: 0.4 },   // G5
            { freq: 1046.5, time: 0.6 },   // C6
            { freq: 783.99, time: 0.8 },   // G5
            { freq: 1046.5, time: 1.0 }    // C6
        ];

        melody.forEach(note => {
            const { oscillator, gainNode } = this.createOscillator(note.freq, 'triangle');
            if (!oscillator) return;
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + note.time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.time + 0.4);
            
            oscillator.start(this.audioContext.currentTime + note.time);
            oscillator.stop(this.audioContext.currentTime + note.time + 0.4);
        });
    }

    playSuspense() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Opción A: Tambores Suaves - Redoble de tambor suave con crescendo gradual
        for (let i = 0; i < 8; i++) {
            const { oscillator, gainNode } = this.createOscillator(80 + i * 5, 'sawtooth');
            if (!oscillator) continue;
            
            gainNode.gain.setValueAtTime(0.05 + i * 0.015, this.audioContext.currentTime + i * 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.2 + 0.3);
            
            oscillator.start(this.audioContext.currentTime + i * 0.2);
            oscillator.stop(this.audioContext.currentTime + i * 0.2 + 0.3);
        }
    }

    playVictory() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Opción B: Coro de Celebración - Voces celestiales que celebran el logro
        const harmonies = [523.25, 659.25, 783.99, 1046.5]; // C major chord progression
        
        // Simular voces con múltiples osciladores
        harmonies.forEach((freq, index) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
            if (!oscillator) return;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3.5);
            
            oscillator.start(this.audioContext.currentTime + index * 0.2);
            oscillator.stop(this.audioContext.currentTime + 3.5);
        });
        
        // Agregar melodía celestial
        const celestialMelody = [
            { freq: 1046.5, time: 0.5, duration: 0.6 },  // C6
            { freq: 1174.7, time: 1.0, duration: 0.6 },  // D6
            { freq: 1318.5, time: 1.5, duration: 0.8 },  // E6
            { freq: 1568.0, time: 2.2, duration: 1.0 }   // G6
        ];
        
        celestialMelody.forEach(note => {
            const { oscillator, gainNode } = this.createOscillator(note.freq, 'triangle');
            if (!oscillator) return;
            
            gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime + note.time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.time + note.duration);
            
            oscillator.start(this.audioContext.currentTime + note.time);
            oscillator.stop(this.audioContext.currentTime + note.time + note.duration);
        });
    }

    playWelcome() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Opción C: Arpa Mágica - Glissando de arpa con efecto mágico y envolvente
        for (let i = 0; i < 12; i++) {
            const freq = 261.63 * Math.pow(2, i/12 * 2); // Glissando mágico
            const { oscillator, gainNode } = this.createOscillator(freq, 'sine');
            if (!oscillator) continue;
            
            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime + i * 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.05 + 0.4);
            
            oscillator.start(this.audioContext.currentTime + i * 0.05);
            oscillator.stop(this.audioContext.currentTime + i * 0.05 + 0.4);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        
        // Actualizar UI del botón
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊 Sonido ON' : '🔇 Sonido OFF';
            soundToggle.className = `sound-toggle ${this.soundEnabled ? '' : 'sound-off'}`;
        }
        
        // Reproducir sonido de prueba si se activó
        if (this.soundEnabled) {
            this.playTick();
        }
    }
}

// Inicializar sistema de sonido
const soundSystem = new SoundSystem();

// ====== SISTEMA DE AVATARES ======

let selectedAvatar = '😎'; // Avatar por defecto

function selectAvatar(emoji, buttonElement) {
    // Quitar selección anterior
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Seleccionar nuevo avatar
    buttonElement.classList.add('selected');
    selectedAvatar = emoji;
    
    // Actualizar display
    document.getElementById('selectedAvatarEmoji').textContent = emoji;
    
    // Guardar en localStorage
    localStorage.setItem('selectedAvatar', emoji);
    
    // Reproducir sonido de selección
    soundSystem.playTick();
}

function getPlayerAvatar() {
    // Recuperar avatar guardado o usar el por defecto
    const saved = localStorage.getItem('selectedAvatar');
    return saved || selectedAvatar;
}

function initializeAvatar() {
    // Cargar avatar guardado al inicializar
    const saved = getPlayerAvatar();
    if (saved && saved !== selectedAvatar) {
        selectedAvatar = saved;
        
        // Actualizar UI
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.avatar === saved) {
                btn.classList.add('selected');
            }
        });
        
        const display = document.getElementById('selectedAvatarEmoji');
        if (display) {
            display.textContent = saved;
        }
    }
}

// ====== INICIALIZACIÓN ======

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay datos del nuevo sistema autónomo
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('gameCode');
    const quizData = urlParams.get('quizData');
    
    if (gameCode && quizData) {
        // Nuevo sistema autónomo - pre-llenar código y ocultar campo
        document.getElementById('gameCodeInput').value = gameCode;
        document.getElementById('gameCodeInput').style.display = 'none';
        document.querySelector('label[for="gameCodeInput"]').style.display = 'none';
        
        // Mostrar mensaje informativo
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';
        infoDiv.innerHTML = '<strong><i class="fas fa-check-circle" style="color: #4caf50;"></i> Conectado al juego: ' + gameCode + '</strong><br><small>Solo ingresa tu nombre y avatar para continuar</small>';
        
        const form = document.getElementById('joinForm');
        form.insertBefore(infoDiv, form.firstChild);
        
        // Enfocar en el nombre
        document.getElementById('playerName').focus();
    } else {
        // Sistema antiguo - verificar código normal
        const oldGameCode = urlParams.get('code');
        if (oldGameCode) {
            document.getElementById('gameCodeInput').value = oldGameCode;
            document.getElementById('gameCodeInput').focus();
        }
    }
    
    // Inicializar sistema de avatares
    initializeAvatar();
    
    setupEventListeners();
    showScreen('joinScreen');
});

function setupEventListeners() {
    // Formulario de unirse al juego
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinGame);
    }
    
    // Input de código de juego - formato automático
    const gameCodeInput = document.getElementById('gameCodeInput');
    if (gameCodeInput) {
        gameCodeInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }
}

// ====== GESTIÓN DE PANTALLAS ======

function showScreen(screenId) {
    const screens = ['joinScreen', 'waitingScreen', 'questionScreen', 'resultScreen', 'partialRankingScreen', 'finalScreen', 'sharedFinalScreen'];
    
    screens.forEach(screen => {
        const element = document.getElementById(screen);
        if (element) {
            element.style.display = screen === screenId ? 'block' : 'none';
        }
    });
}

// ====== UNIRSE AL JUEGO ======

function handleJoinGame(e) {
    e.preventDefault();
    
    const gameCode = document.getElementById('gameCodeInput').value.trim().toUpperCase();
    const playerName = document.getElementById('playerName').value.trim();
    
    if (!gameCode || gameCode.length !== 6) {
        alert('Por favor, ingresa un código de juego válido (6 caracteres)');
        return;
    }
    
    if (!playerName || playerName.length < 2) {
        alert('Por favor, ingresa tu nombre (mínimo 2 caracteres)');
        return;
    }
    
    if (playerName.length > 20) {
        alert('El nombre no puede tener más de 20 caracteres');
        return;
    }
    
    joinGame(gameCode, playerName);
}

function joinGame(gameCode, playerName) {
    try {
        // Verificar si es el nuevo sistema autónomo
        const urlParams = new URLSearchParams(window.location.search);
        const quizData = urlParams.get('quizData');
        
        if (quizData) {
            // Nuevo sistema autónomo
            const game = joinStandaloneGame();
            if (!game) {
                alert('Error al acceder al juego. Verifica el enlace proporcionado por el profesor.');
                return;
            }
            
            const playerId = addPlayerToStandaloneGame(gameCode, playerName, getPlayerAvatar());
            if (!playerId) {
                alert('Error al unirse al juego');
                return;
            }
            
            // Guardar datos del jugador
            currentGameCode = gameCode;
            currentPlayerId = playerId;
            currentPlayerName = playerName;
            currentQuiz = game.quiz;
            
            // Cambiar a pantalla de espera
            showScreen('waitingScreen');
            updateWaitingScreen();
            
            // Mostrar mensaje de éxito
            soundSystem.playWelcome();
            
        } else {
            // Sistema antiguo
            const game = getActiveGame(gameCode);
            if (!game) {
                alert('Código de juego inválido o el juego no está activo');
                return;
            }
            
            // Agregar jugador al juego (incluyendo avatar)
            const playerId = addPlayerToGame(gameCode, playerName, getPlayerAvatar());
            
            // Guardar datos del jugador
            currentGameCode = gameCode;
            currentPlayerId = playerId;
        currentPlayerName = playerName;
        currentQuiz = game.quiz;
        playerScore = 0;
        playerAnswers = [];
        
        // Actualizar UI
        document.getElementById('currentGameCode').textContent = gameCode;
        document.getElementById('currentPlayerName').textContent = playerName;
        document.getElementById('gameInfo').style.display = 'flex';
        
        // Mostrar información del quiz
        updateQuizInfo();
        
        // Configurar listener para actualizaciones del juego
        setupGameUpdateListener();
        
            // Configurar información del juego
            document.getElementById('currentGameCode').textContent = gameCode;
            document.getElementById('currentPlayerName').textContent = playerName;
            document.getElementById('gameInfo').style.display = 'flex';
            
            // Mostrar información del quiz
            updateQuizInfo();
            
            // Mostrar pantalla de espera
            showScreen('waitingScreen');
            
            // Reproducir sonido de bienvenida
            setTimeout(() => {
                soundSystem.playWelcome();
            }, 500);
        }
        
    } catch (error) {
        console.error('Error al unirse al juego:', error);
        alert('Error al unirse al juego: ' + error.message);
    }
}

function updateQuizInfo() {
    const quizInfo = document.getElementById('quizInfo');
    if (currentQuiz && quizInfo) {
        // Obtener estado actual del juego
        const game = getActiveGame(currentGameCode);
        const gameStatus = game ? game.status : 'waiting';
        
        let statusBadge = '';
        let statusMessage = '';
        
        switch (gameStatus) {
            case 'waiting':
                statusBadge = '<span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem;">✓ Esperando inicio</span>';
                statusMessage = '<p style="color: #059669; margin-top: 15px;"><i class="fas fa-clock"></i> El profesor iniciará el cuestionario pronto...</p>';
                break;
            case 'active':
                statusBadge = '<span style="background: #4f8cff; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem;">🎮 En progreso</span>';
                statusMessage = '<p style="color: #4f8cff; margin-top: 15px;"><i class="fas fa-play"></i> ¡El cuestionario está activo!</p>';
                break;
            case 'finished':
                statusBadge = '<span style="background: #9ca3af; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem;">🏁 Terminado</span>';
                statusMessage = '<p style="color: #6b7280; margin-top: 15px;"><i class="fas fa-flag-checkered"></i> El cuestionario ha finalizado</p>';
                break;
        }
        
        quizInfo.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                ${statusBadge}
            </div>
            <h3>${escapeHtml(currentQuiz.title)}</h3>
            ${currentQuiz.description ? `<p>${escapeHtml(currentQuiz.description)}</p>` : ''}
            <div style="margin-top: 16px; display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <strong>${currentQuiz.questions.length}</strong><br>
                    <small>Preguntas</small>
                </div>
                <div>
                    <strong>${currentQuiz.timeLimit || 30}s</strong><br>
                    <small>Por pregunta</small>
                </div>
            </div>
            ${statusMessage}
        `;
    }
}

function setupGameUpdateListener() {
    if (gameUpdateListener) {
        gameUpdateListener(); // Limpiar listener anterior
    }
    
    gameUpdateListener = listenForGameUpdates(currentGameCode, handleGameUpdate);
    
    // Agregar polling como respaldo cada 2 segundos
    if (window.gamePollingInterval) {
        clearInterval(window.gamePollingInterval);
    }
    
    window.gamePollingInterval = setInterval(() => {
        if (currentGameCode) {
            const game = getActiveGame(currentGameCode);
            if (game) {
                // Verificar si hay cambios de fase
                if (game.phase === 'question' && window.location.hash !== '#question') {
                    console.log('Polling detectó inicio de pregunta');
                    handleGameUpdate({ type: 'game_started' });
                } else if (game.currentQuestion !== undefined && game.currentQuestion !== currentQuestionIndex) {
                    console.log('Polling detectó nueva pregunta:', game.currentQuestion);
                    handleGameUpdate({ 
                        type: 'next_question', 
                        data: { questionIndex: game.currentQuestion } 
                    });
                }
            }
        }
    }, 2000);
}

function handleGameUpdate(update) {
    console.log('Actualización del juego recibida:', update);
    
    switch (update.type) {
        case 'game_started':
            startQuiz();
            break;
        case 'next_question':
            if (update.data.questionIndex !== undefined) {
                loadQuestion(update.data.questionIndex);
            }
            break;
        case 'show_results':
            showQuestionResult(update.data);
            break;
        case 'quiz_finished':
            if (update.data && update.data.rankings) {
                showSharedFinalRanking(update.data);
            } else {
                showFinalResults();
            }
            break;
        case 'game_ended':
            alert('El administrador ha terminado el juego');
            goHome();
            break;
    }
}

// ====== GESTIÓN DEL CUESTIONARIO ======

function startQuiz() {
    // Evitar iniciar múltiples veces
    if (currentQuestionIndex !== null && currentQuestionIndex >= 0) {
        console.log('Quiz ya iniciado, evitando duplicación');
        return;
    }
    
    currentQuestionIndex = 0;
    loadQuestion(0);
}

function loadQuestion(questionIndex) {
    if (!currentQuiz || !currentQuiz.questions[questionIndex]) {
        console.error('Pregunta no encontrada:', questionIndex);
        return;
    }
    
    // Evitar cargar la misma pregunta múltiples veces
    if (currentQuestionIndex === questionIndex && document.getElementById('questionScreen').style.display !== 'none') {
        console.log('Pregunta ya cargada, evitando duplicación de sonido');
        return;
    }
    
    currentQuestionIndex = questionIndex;
    const question = currentQuiz.questions[questionIndex];
    
    // Actualizar UI
    document.getElementById('currentQuestionNumber').textContent = questionIndex + 1;
    document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;
    document.getElementById('questionText').textContent = question.text;
    document.getElementById('currentScore').textContent = playerScore;
    
    // Configurar timer
    totalTime = currentQuiz.timeLimit || 30;
    timeRemaining = totalTime;
    document.getElementById('timer').textContent = timeRemaining;
    updateTimerProgress();
    
    // Crear opciones de respuesta
    createAnswerButtons(question.options);
    
    // Mostrar pantalla de pregunta
    showScreen('questionScreen');
    
    // Iniciar timer
    startTimer();
    
    // Reproducir sonido de inicio de pregunta
    soundSystem.playQuestionStart();
}

function createAnswerButtons(options) {
    const answersGrid = document.getElementById('answersGrid');
    const optionClasses = ['option-a', 'option-b', 'option-c', 'option-d'];
    const optionLabels = ['A', 'B', 'C', 'D'];
    
    answersGrid.innerHTML = options.map((option, index) => {
        if (!option || option.trim() === '') return '';
        
        return `
            <button class="answer-button ${optionClasses[index]}" 
                    onclick="selectAnswer(${index})"
                    data-option="${index}">
                <div style="font-weight: bold; margin-bottom: 8px;">${optionLabels[index]}</div>
                <div>${escapeHtml(option)}</div>
            </button>
        `;
    }).filter(html => html !== '').join('');
}

function selectAnswer(optionIndex) {
    // Detener timer
    clearInterval(timer);
    
    // Deshabilitar todos los botones
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
        button.disabled = true;
        if (parseInt(button.dataset.option) === optionIndex) {
            button.classList.add('selected');
        }
    });
    
    // Registrar respuesta
    const question = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = optionIndex === question.correctAnswer;
    const score = isCorrect ? calculateScore(timeRemaining, totalTime) : 0;
    
    const answer = {
        questionIndex: currentQuestionIndex,
        selectedOption: optionIndex,
        correctOption: question.correctAnswer,
        isCorrect: isCorrect,
        timeUsed: totalTime - timeRemaining,
        score: score,
        timestamp: new Date().toISOString()
    };
    
    playerAnswers.push(answer);
    if (isCorrect) {
        playerScore += score;
    }
    
    // Actualizar datos del jugador en el juego
    updatePlayerInGame(answer);
    
    // Broadcast respuesta
    broadcastGameUpdate(currentGameCode, 'answer_submitted', {
        playerId: currentPlayerId,
        questionIndex: currentQuestionIndex,
        answer: answer
    });
    
    // Mostrar resultado después de un breve delay
    setTimeout(() => {
        showAnswerResult(answer);
    }, 1000);
}

function updatePlayerInGame(answer) {
    try {
        const game = getActiveGame(currentGameCode);
        if (game && game.players && game.players[currentPlayerId]) {
            game.players[currentPlayerId].score = playerScore;
            game.players[currentPlayerId].answers = playerAnswers;
            updateActiveGame(currentGameCode, game);
        }
    } catch (error) {
        console.error('Error actualizando jugador:', error);
    }
}

function showAnswerResult(answer) {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const correctAnswerDisplay = document.getElementById('correctAnswerDisplay');
    const correctAnswerText = document.getElementById('correctAnswerText');
    
    if (answer.isCorrect) {
        resultIcon.innerHTML = '<i class="fas fa-check"></i>';
        resultIcon.className = 'result-icon correct';
        resultTitle.textContent = '¡Correcto!';
        resultMessage.textContent = `Has ganado ${answer.score} puntos`;
        correctAnswerDisplay.style.display = 'none';
        
        // Reproducir sonido de respuesta correcta
        soundSystem.playCorrect();
    } else {
        resultIcon.innerHTML = '<i class="fas fa-times"></i>';
        resultIcon.className = 'result-icon incorrect';
        resultTitle.textContent = '¡Incorrecto!';
        resultMessage.textContent = 'Más suerte la próxima vez';
        
        // Reproducir sonido de respuesta incorrecta
        soundSystem.playIncorrect();
        
        // Mostrar respuesta correcta SIEMPRE
        const question = currentQuiz.questions[currentQuestionIndex];
        const correctOption = question.options[question.correctAnswer];
        correctAnswerText.textContent = correctOption;
        correctAnswerDisplay.style.display = 'block';
    }
    
    showScreen('resultScreen');
    
    // Iniciar timer para transición automática a ranking parcial
    startResultTimer();
}

function startResultTimer() {
    const timerDuration = 4; // 4 segundos para ver respuesta correcta
    let timeLeft = timerDuration;
    
    const timerSecondsElement = document.getElementById('timerSeconds');
    const timerProgressFill = document.getElementById('timerProgressFill');
    
    // Inicializar timer
    timerSecondsElement.textContent = timeLeft;
    timerProgressFill.style.width = '100%';
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerSecondsElement.textContent = timeLeft;
        
        // Actualizar barra de progreso
        const progressPercent = (timeLeft / timerDuration) * 100;
        timerProgressFill.style.width = progressPercent + '%';
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showPartialRanking();
        }
    }, 1000);
}

function showPartialRanking() {
    // Reproducir sonido de suspenso antes de mostrar el ranking
    soundSystem.playSuspense();
    
    // Actualizar información de pregunta actual
    document.getElementById('currentQuestionRank').textContent = currentQuestionIndex + 1;
    
    // Mostrar información educativa de la pregunta recién respondida
    displayQuestionReview();
    
    // Obtener datos actualizados del juego
    const game = getActiveGame(currentGameCode);
    if (!game || !game.players) {
        // Si no hay datos, esperar sin hacer nada automático
        return;
    }
    
    // Calcular rankings
    const players = Object.values(game.players);
    players.sort((a, b) => b.score - a.score);
    
    // Mostrar podium (top 3)
    displayPodium(players.slice(0, 3));
    
    // Mostrar lista completa
    displayPartialRankingList(players);
    
    // Mostrar posición del jugador actual
    displayPlayerPosition(players);
    
    showScreen('partialRankingScreen');
    
    // NO iniciar timer automático - esperar control de la profesora
    // La siguiente pregunta será controlada por el evento 'next_question' del admin
}

function displayQuestionReview() {
    // Obtener la pregunta actual
    if (!currentQuiz || !currentQuiz.questions || currentQuestionIndex < 0) {
        document.getElementById('questionReviewSection').style.display = 'none';
        return;
    }
    
    const question = currentQuiz.questions[currentQuestionIndex];
    if (!question) {
        document.getElementById('questionReviewSection').style.display = 'none';
        return;
    }
    
    // Mostrar la sección
    document.getElementById('questionReviewSection').style.display = 'block';
    
    // Mostrar el texto de la pregunta
    document.getElementById('questionTextReview').innerHTML = `
        <strong>Pregunta ${currentQuestionIndex + 1}:</strong> ${escapeHtml(question.question)}
    `;
    
    // Encontrar la respuesta correcta
    const correctAnswer = question.answers.find(answer => answer.correct);
    if (correctAnswer) {
        document.getElementById('correctAnswerText').textContent = correctAnswer.text;
    } else {
        document.getElementById('correctAnswerText').textContent = 'No disponible';
    }
    
    // Mostrar la justificación/explicación
    if (question.justification) {
        document.getElementById('explanationText').textContent = question.justification;
        document.querySelector('.explanation-section').style.display = 'block';
    } else {
        document.querySelector('.explanation-section').style.display = 'none';
    }
}

function displayPodium(topPlayers) {
    const podium = document.getElementById('rankingPodium');
    
    if (topPlayers.length === 0) {
        podium.innerHTML = '<p>No hay datos de ranking disponibles</p>';
        return;
    }
    
    const podiumHTML = topPlayers.map((player, index) => {
        const positions = ['🥇', '🥈', '🥉'];
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        
        return `
            <div class="podium-player" style="background: linear-gradient(135deg, ${colors[index]}, ${colors[index]}88); --index: ${index};">
                <div class="podium-position">${positions[index]}</div>
                <div class="podium-avatar">${player.avatar || '👤'}</div>
                <div class="podium-name">${escapeHtml(player.name)}</div>
                <div class="podium-score">${player.score} pts</div>
            </div>
        `;
    }).join('');
    
    podium.innerHTML = `<div class="podium-grid">${podiumHTML}</div>`;
}

function displayPartialRankingList(players) {
    const rankingList = document.getElementById('partialRankingList');
    
    const listHTML = players.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const highlightClass = isCurrentPlayer ? 'current-player-highlight' : '';
        
        return `
            <div class="ranking-item ${highlightClass}" style="--index: ${index};">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-avatar">${player.avatar || '👤'}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${escapeHtml(player.name)}</div>
                    <div class="ranking-answers">${player.answers ? player.answers.length : 0} respuestas</div>
                </div>
                <div class="ranking-score">${player.score} pts</div>
            </div>
        `;
    }).join('');
    
    rankingList.innerHTML = `
        <div class="ranking-list-header">
            <h4>Clasificación Completa</h4>
        </div>
        ${listHTML}
    `;
}

function displayPlayerPosition(players) {
    const playerPositionElement = document.getElementById('playerPosition');
    
    const playerIndex = players.findIndex(p => p.id === currentPlayerId);
    if (playerIndex === -1) {
        playerPositionElement.style.display = 'none';
        return;
    }
    
    const position = playerIndex + 1;
    const player = players[playerIndex];
    
    playerPositionElement.innerHTML = `
        <div class="player-position-card">
            <h4>Tu Posición</h4>
            <div class="position-info">
                <div class="position-number">${position}</div>
                <div class="position-details">
                    <div>de ${players.length} jugadores</div>
                    <div>${player.score} puntos totales</div>
                </div>
            </div>
        </div>
    `;
    
    playerPositionElement.style.display = 'block';
}

function showNextQuestionOrFinal() {
    if (currentQuestionIndex + 1 < currentQuiz.questions.length) {
        // Hay más preguntas, cargar la siguiente
        loadQuestion(currentQuestionIndex + 1);
    } else {
        // No hay más preguntas, mostrar resultados finales
        showFinalResults();
    }
}

function showQuestionResult(data) {
    // Esta función era para control manual del administrador
    // En nuestro flujo automático no se usa, ya que seguimos el patrón:
    // respuesta → ranking parcial → esperar 'next_question' del admin
    console.log('showQuestionResult llamada, pero se usa flujo automático');
}

function showFinalResults() {
    const totalQuestions = currentQuiz.questions.length;
    const correctAnswers = playerAnswers.filter(answer => answer.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    document.getElementById('finalScore').textContent = playerScore;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    document.getElementById('accuracyPercentage').textContent = accuracy + '%';
    
    showScreen('finalScreen');
    
    // Reproducir sonido de podium/celebración
    setTimeout(() => {
        soundSystem.playPodium();
    }, 500);
    
    // Limpiar listener
    if (gameUpdateListener) {
        gameUpdateListener();
        gameUpdateListener = null;
    }
}

function showSharedFinalRanking(rankingData) {
    // Reproducir sonido de victoria épico al mostrar ranking final
    soundSystem.playVictory();
    
    // Actualizar datos globales del ranking compartido
    document.getElementById('sharedTotalQuestions').textContent = rankingData.totalQuestions;
    document.getElementById('sharedTotalPlayers').textContent = rankingData.totalPlayers;
    
    // Mostrar podium compartido (top 3)
    displaySharedPodium(rankingData.rankings.slice(0, 3));
    
    // Mostrar ranking completo
    displaySharedFullRanking(rankingData.rankings);
    
    // Destacar posición del jugador actual
    displaySharedPlayerPosition(rankingData.rankings);
    
    showScreen('sharedFinalScreen');
    
    // Limpiar listener
    if (gameUpdateListener) {
        gameUpdateListener();
        gameUpdateListener = null;
    }
}

function displaySharedPodium(topPlayers) {
    const podium = document.getElementById('sharedPodium');
    
    if (topPlayers.length === 0) {
        podium.innerHTML = '<p>No hay datos de ranking disponibles</p>';
        return;
    }
    
    const podiumHTML = topPlayers.map((player, index) => {
        const positions = ['🥇', '🥈', '🥉'];
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        const isCurrentPlayer = player.id === currentPlayerId;
        const highlightClass = isCurrentPlayer ? 'current-player-podium' : '';
        
        return `
            <div class="shared-podium-player ${highlightClass}" style="background: linear-gradient(135deg, ${colors[index]}, ${colors[index]}88); --index: ${index};">
                <div class="shared-podium-position">${positions[index]}</div>
                <div class="shared-podium-avatar">${player.avatar}</div>
                <div class="shared-podium-name">${escapeHtml(player.name)}</div>
                <div class="shared-podium-score">${player.score} pts</div>
                <div class="shared-podium-accuracy">${player.accuracy}% precisión</div>
            </div>
        `;
    }).join('');
    
    podium.innerHTML = `<div class="shared-podium-grid">${podiumHTML}</div>`;
}

function displaySharedFullRanking(players) {
    const fullRanking = document.getElementById('sharedFullRanking');
    
    const listHTML = players.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const highlightClass = isCurrentPlayer ? 'current-player-highlight' : '';
        
        return `
            <div class="shared-ranking-item ${highlightClass}" style="--index: ${index};">
                <div class="shared-ranking-position">${player.position}</div>
                <div class="shared-ranking-avatar">${player.avatar}</div>
                <div class="shared-ranking-info">
                    <div class="shared-ranking-name">${escapeHtml(player.name)}</div>
                    <div class="shared-ranking-stats">${player.correctAnswers}/${player.totalAnswers} respuestas (${player.accuracy}%)</div>
                </div>
                <div class="shared-ranking-score">${player.score} pts</div>
            </div>
        `;
    }).join('');
    
    fullRanking.innerHTML = `
        <div class="shared-ranking-header">
            <h4>🏆 Clasificación Final Completa</h4>
        </div>
        ${listHTML}
    `;
}

function displaySharedPlayerPosition(players) {
    const playerPositionElement = document.getElementById('sharedPlayerPosition');
    
    const currentPlayer = players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) {
        playerPositionElement.style.display = 'none';
        return;
    }
    
    playerPositionElement.innerHTML = `
        <div class="shared-player-card">
            <h4>🎯 Tu Resultado Final</h4>
            <div class="shared-player-stats">
                <div class="shared-stat-item">
                    <div class="shared-stat-number">${currentPlayer.position}</div>
                    <div class="shared-stat-label">Posición</div>
                </div>
                <div class="shared-stat-item">
                    <div class="shared-stat-number">${currentPlayer.score}</div>
                    <div class="shared-stat-label">Puntos</div>
                </div>
                <div class="shared-stat-item">
                    <div class="shared-stat-number">${currentPlayer.accuracy}%</div>
                    <div class="shared-stat-label">Precisión</div>
                </div>
            </div>
        </div>
    `;
    
    playerPositionElement.style.display = 'block';
}

// ====== GESTIÓN DEL TIMER ======

function startTimer() {
    clearInterval(timer);
    
    timer = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer').textContent = timeRemaining;
        updateTimerProgress();
        
        // Cambiar color cuando queda poco tiempo
        const timerElement = document.getElementById('timer');
        if (timeRemaining <= 5) {
            timerElement.classList.add('warning');
            // Reproducir tick cuando quedan pocos segundos
            soundSystem.playTick();
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            // Tiempo agotado, seleccionar respuesta automáticamente (ninguna)
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerProgress() {
    const progress = (timeRemaining / totalTime) * 100;
    document.getElementById('timerProgress').style.width = progress + '%';
}

function handleTimeOut() {
    // Deshabilitar todos los botones
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
        button.disabled = true;
    });
    
    // Registrar respuesta como incorrecta (tiempo agotado)
    const question = currentQuiz.questions[currentQuestionIndex];
    const answer = {
        questionIndex: currentQuestionIndex,
        selectedOption: -1, // Indica tiempo agotado
        correctOption: question.correctAnswer,
        isCorrect: false,
        timeUsed: totalTime,
        score: 0,
        timestamp: new Date().toISOString()
    };
    
    playerAnswers.push(answer);
    
    // Actualizar datos del jugador
    updatePlayerInGame(answer);
    
    // Broadcast respuesta
    broadcastGameUpdate(currentGameCode, 'answer_submitted', {
        playerId: currentPlayerId,
        questionIndex: currentQuestionIndex,
        answer: answer
    });
    
    // Mostrar resultado
    setTimeout(() => {
        showTimeOutResult();
    }, 1000);
}

function showTimeOutResult() {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const correctAnswerDisplay = document.getElementById('correctAnswerDisplay');
    const correctAnswerText = document.getElementById('correctAnswerText');
    
    resultIcon.innerHTML = '<i class="fas fa-clock"></i>';
    resultIcon.className = 'result-icon incorrect';
    resultTitle.textContent = '¡Tiempo agotado!';
    resultMessage.textContent = 'No respondiste a tiempo';
    
    // Mostrar respuesta correcta SIEMPRE
    const question = currentQuiz.questions[currentQuestionIndex];
    const correctOption = question.options[question.correctAnswer];
    correctAnswerText.textContent = correctOption;
    correctAnswerDisplay.style.display = 'block';
    
    showScreen('resultScreen');
    
    // Iniciar timer para transición automática a ranking parcial
    startResultTimer();
}

// ====== FUNCIONES DE UTILIDAD ======

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function goHome() {
    // Limpiar datos
    if (gameUpdateListener) {
        gameUpdateListener();
    }
    
    clearInterval(timer);
    
    // Remover jugador del juego si está activo
    if (currentGameCode && currentPlayerId) {
        try {
            const game = getActiveGame(currentGameCode);
            if (game && game.players && game.players[currentPlayerId]) {
                delete game.players[currentPlayerId];
                updateActiveGame(currentGameCode, game);
                
                broadcastGameUpdate(currentGameCode, 'player_left', {
                    playerId: currentPlayerId,
                    playerName: currentPlayerName
                });
            }
        } catch (error) {
            console.error('Error al salir del juego:', error);
        }
    }
    
    window.location.href = 'index.html';
}

// ====== CLEANUP AL CERRAR LA VENTANA ======

window.addEventListener('beforeunload', function() {
    if (currentGameCode && currentPlayerId) {
        try {
            const game = getActiveGame(currentGameCode);
            if (game && game.players && game.players[currentPlayerId]) {
                delete game.players[currentPlayerId];
                updateActiveGame(currentGameCode, game);
            }
        } catch (error) {
            console.error('Error en cleanup:', error);
        }
    }
});

// ====== MANEJO DE ERRORES ======

function showJoinError(message) {
    // Crear el modal de error si no existe
    let errorModal = document.getElementById('joinErrorModal');
    if (!errorModal) {
        errorModal = document.createElement('div');
        errorModal.id = 'joinErrorModal';
        errorModal.className = 'error-modal';
        document.body.appendChild(errorModal);
    }
    
    let errorIcon = '❌';
    let errorTitle = 'Error al Unirse';
    let suggestions = '';
    
    // Personalizar mensaje según el tipo de error
    if (message.includes('ya ha comenzado')) {
        errorIcon = '⏰';
        errorTitle = 'Juego en Progreso';
        suggestions = `
            <div class="error-suggestions">
                <p><strong>Sugerencias:</strong></p>
                <ul>
                    <li>Espera a que termine este juego</li>
                    <li>Pregunta al profesor por un nuevo código</li>
                    <li>Verifica que el código sea correcto</li>
                </ul>
            </div>
        `;
    } else if (message.includes('ya ha terminado')) {
        errorIcon = '🏁';
        errorTitle = 'Juego Terminado';
        suggestions = `
            <div class="error-suggestions">
                <p><strong>Sugerencias:</strong></p>
                <ul>
                    <li>Pregunta al profesor por un nuevo juego</li>
                    <li>Verifica que el código sea correcto</li>
                    <li>Espera a que se inicie un nuevo cuestionario</li>
                </ul>
            </div>
        `;
    } else if (message.includes('Ya existe un jugador')) {
        errorIcon = '👥';
        errorTitle = 'Nombre en Uso';
        suggestions = `
            <div class="error-suggestions">
                <p><strong>Sugerencias:</strong></p>
                <ul>
                    <li>Prueba con un nombre diferente</li>
                    <li>Agrega un número al final de tu nombre</li>
                    <li>Usa un apodo único</li>
                </ul>
            </div>
        `;
    } else if (message.includes('no encontrado') || message.includes('inválido')) {
        errorIcon = '🔍';
        errorTitle = 'Código Inválido';
        suggestions = `
            <div class="error-suggestions">
                <p><strong>Sugerencias:</strong></p>
                <ul>
                    <li>Verifica que el código sea correcto</li>
                    <li>Pregunta al profesor por el código</li>
                    <li>Asegúrate de escribir 6 caracteres</li>
                </ul>
            </div>
        `;
    }
    
    errorModal.innerHTML = `
        <div class="error-modal-content">
            <div class="error-header">
                <div class="error-icon">${errorIcon}</div>
                <h3>${errorTitle}</h3>
                <button class="error-close" onclick="closeJoinError()">&times;</button>
            </div>
            <div class="error-body">
                <p class="error-message">${message}</p>
                ${suggestions}
            </div>
            <div class="error-footer">
                <button class="btn btn-primary" onclick="closeJoinError()">
                    <i class="fas fa-arrow-left"></i>
                    Intentar de Nuevo
                </button>
            </div>
        </div>
    `;
    
    errorModal.style.display = 'flex';
    
    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
        closeJoinError();
    }, 10000);
}

function closeJoinError() {
    const errorModal = document.getElementById('joinErrorModal');
    if (errorModal) {
        errorModal.style.display = 'none';
    }
}