// ====== SISTEMA DE AUTENTICACIÓN ADMIN ======

// Configuración de contraseña (puedes cambiar esta contraseña)
const ADMIN_PASSWORD = "admin2024";

// Verificar si ya está autenticado al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupLoginForm();
});

function checkAuthStatus() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    const loginScreen = document.getElementById('adminLoginScreen');
    const panelContainer = document.getElementById('adminPanelContainer');
    
    if (isAuthenticated === 'true') {
        // Usuario ya autenticado
        showAdminPanel();
    } else {
        // Mostrar pantalla de login
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('adminLoginScreen').style.display = 'flex';
    document.getElementById('adminPanelContainer').style.display = 'none';
    
    // Enfocar en el campo de contraseña
    setTimeout(() => {
        document.getElementById('adminPassword').focus();
    }, 100);
}

function showAdminPanel() {
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('adminPanelContainer').style.display = 'block';
}

function setupLoginForm() {
    const loginForm = document.getElementById('adminLoginForm');
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('loginError');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enteredPassword = passwordInput.value.trim();
        
        if (enteredPassword === ADMIN_PASSWORD) {
            // Contraseña correcta
            sessionStorage.setItem('adminAuthenticated', 'true');
            hideLoginError();
            showAdminPanel();
            
            // Limpiar campo de contraseña
            passwordInput.value = '';
            
            // Mostrar mensaje de bienvenida
            showSuccessMessage('¡Bienvenido al panel de administración!');
            
        } else {
            // Contraseña incorrecta
            showLoginError();
            passwordInput.value = '';
            passwordInput.focus();
            
            // Efecto de shake en el formulario
            const loginContainer = document.querySelector('.login-container');
            loginContainer.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                loginContainer.style.animation = '';
            }, 500);
        }
    });
    
    // Ocultar error cuando el usuario empiece a escribir
    passwordInput.addEventListener('input', function() {
        hideLoginError();
    });
}

function showLoginError() {
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'flex';
    errorDiv.style.animation = 'fadeIn 0.3s ease-in-out';
}

function hideLoginError() {
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
}

function logout() {
    // Confirmar logout
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        sessionStorage.removeItem('adminAuthenticated');
        showLoginScreen();
        showSuccessMessage('Sesión cerrada correctamente');
    }
}

function showSuccessMessage(message) {
    // Crear mensaje temporal de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(successDiv);
    
    // Mostrar con animación
    setTimeout(() => {
        successDiv.style.opacity = '1';
        successDiv.style.transform = 'translateY(0)';
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Verificar autenticación en cada acción crítica
function requireAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated !== 'true') {
        showLoginScreen();
        return false;
    }
    return true;
}

// Proteger funciones críticas del admin
const originalCreateNewQuiz = window.createNewQuiz;
const originalClearAllQuizzes = window.clearAllQuizzes;
const originalImportQuizFromJson = window.importQuizFromJson;

if (originalCreateNewQuiz) {
    window.createNewQuiz = function() {
        if (requireAuth()) {
            return originalCreateNewQuiz.apply(this, arguments);
        }
    };
}

if (originalClearAllQuizzes) {
    window.clearAllQuizzes = function() {
        if (requireAuth()) {
            return originalClearAllQuizzes.apply(this, arguments);
        }
    };
}

if (originalImportQuizFromJson) {
    window.importQuizFromJson = function() {
        if (requireAuth()) {
            return originalImportQuizFromJson.apply(this, arguments);
        }
    };
}

// Sesión expira después de 2 horas de inactividad
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (sessionStorage.getItem('adminAuthenticated') === 'true') {
            logout();
            alert('Sesión expirada por inactividad. Por favor, inicia sesión nuevamente.');
        }
    }, 2 * 60 * 60 * 1000); // 2 horas
}

// Escuchar actividad del usuario
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('mousemove', resetInactivityTimer);

// Iniciar timer de inactividad
resetInactivityTimer();