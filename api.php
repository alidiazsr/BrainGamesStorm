<?php
// ====== SERVIDOR PHP PARA BRAIN GAMES STORM ======
// Este archivo debe subirse a un servidor web con PHP y MySQL

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos
$servername = "localhost";
$username = "tu_usuario_mysql";
$password = "tu_password_mysql"; 
$dbname = "braingamesstorm";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(['error' => 'Conexión fallida: ' . $conn->connect_error]));
}

// Configurar charset
$conn->set_charset("utf8mb4");

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    // Preflight request
    exit(0);
}

// Obtener datos de entrada
$input = json_decode(file_get_contents('php://input'), true);
$action = isset($_GET['action']) ? $_GET['action'] : (isset($input['action']) ? $input['action'] : '');

try {
    switch ($action) {
        case 'create_game':
            createGame($conn, $input);
            break;
            
        case 'join_game':
            joinGame($conn, $input);
            break;
            
        case 'get_game':
            getGame($conn, $_GET['gameCode']);
            break;
            
        case 'update_game':
            updateGame($conn, $input);
            break;
            
        case 'get_players':
            getPlayers($conn, $_GET['gameCode']);
            break;
            
        case 'submit_answer':
            submitAnswer($conn, $input);
            break;
            
        default:
            echo json_encode(['error' => 'Acción no válida']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();

// ====== FUNCIONES DEL JUEGO ======

function createGame($conn, $data) {
    $gameCode = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 6));
    $quizData = json_encode($data['quiz']);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    $stmt = $conn->prepare("INSERT INTO games (game_code, quiz_data, status, created_at, expires_at) VALUES (?, ?, 'waiting', NOW(), ?)");
    $stmt->bind_param("sss", $gameCode, $quizData, $expiresAt);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'gameCode' => $gameCode,
            'quiz' => $data['quiz']
        ]);
    } else {
        throw new Exception('Error al crear el juego');
    }
}

function joinGame($conn, $data) {
    $gameCode = $data['gameCode'];
    $playerName = $data['playerName'];
    $avatar = $data['avatar'];
    
    // Verificar que el juego existe y no ha expirado
    $stmt = $conn->prepare("SELECT * FROM games WHERE game_code = ? AND expires_at > NOW()");
    $stmt->bind_param("s", $gameCode);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Juego no encontrado o expirado');
    }
    
    $game = $result->fetch_assoc();
    
    // Crear jugador único
    $playerId = 'player_' . time() . '_' . rand(1000, 9999);
    
    $stmt = $conn->prepare("INSERT INTO players (game_code, player_id, player_name, avatar, joined_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssss", $gameCode, $playerId, $playerName, $avatar);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'playerId' => $playerId,
            'quiz' => json_decode($game['quiz_data'], true),
            'gameStatus' => $game['status']
        ]);
    } else {
        throw new Exception('Error al unirse al juego');
    }
}

function getGame($conn, $gameCode) {
    $stmt = $conn->prepare("SELECT * FROM games WHERE game_code = ? AND expires_at > NOW()");
    $stmt->bind_param("s", $gameCode);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Juego no encontrado');
    }
    
    $game = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'game' => [
            'gameCode' => $game['game_code'],
            'quiz' => json_decode($game['quiz_data'], true),
            'status' => $game['status'],
            'currentQuestion' => $game['current_question']
        ]
    ]);
}

function getPlayers($conn, $gameCode) {
    $stmt = $conn->prepare("SELECT * FROM players WHERE game_code = ? ORDER BY joined_at");
    $stmt->bind_param("s", $gameCode);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $players = [];
    while ($row = $result->fetch_assoc()) {
        $players[] = [
            'id' => $row['player_id'],
            'name' => $row['player_name'],
            'avatar' => $row['avatar'],
            'score' => $row['score'],
            'joinedAt' => $row['joined_at']
        ];
    }
    
    echo json_encode(['success' => true, 'players' => $players]);
}

function updateGame($conn, $data) {
    $gameCode = $data['gameCode'];
    $status = $data['status'];
    $currentQuestion = isset($data['currentQuestion']) ? $data['currentQuestion'] : null;
    
    if ($currentQuestion !== null) {
        $stmt = $conn->prepare("UPDATE games SET status = ?, current_question = ?, updated_at = NOW() WHERE game_code = ?");
        $stmt->bind_param("sis", $status, $currentQuestion, $gameCode);
    } else {
        $stmt = $conn->prepare("UPDATE games SET status = ?, updated_at = NOW() WHERE game_code = ?");
        $stmt->bind_param("ss", $status, $gameCode);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Error al actualizar el juego');
    }
}

function submitAnswer($conn, $data) {
    $gameCode = $data['gameCode'];
    $playerId = $data['playerId'];
    $questionIndex = $data['questionIndex'];
    $answer = $data['answer'];
    $timeRemaining = $data['timeRemaining'];
    $points = $data['points'];
    
    // Registrar respuesta
    $stmt = $conn->prepare("INSERT INTO answers (game_code, player_id, question_index, answer, time_remaining, points, submitted_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssiiii", $gameCode, $playerId, $questionIndex, $answer, $timeRemaining, $points);
    
    if ($stmt->execute()) {
        // Actualizar puntuación del jugador
        $stmt = $conn->prepare("UPDATE players SET score = score + ? WHERE game_code = ? AND player_id = ?");
        $stmt->bind_param("iss", $points, $gameCode, $playerId);
        $stmt->execute();
        
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Error al enviar respuesta');
    }
}

?>

-- ====== ESTRUCTURA DE BASE DE DATOS MYSQL ======
-- Ejecuta estos comandos en phpMyAdmin para crear las tablas

CREATE DATABASE IF NOT EXISTS braingamesstorm;
USE braingamesstorm;

CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_code VARCHAR(10) UNIQUE NOT NULL,
    quiz_data TEXT NOT NULL,
    status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
    current_question INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_game_code (game_code),
    INDEX idx_expires (expires_at)
);

CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_code VARCHAR(10) NOT NULL,
    player_id VARCHAR(50) NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(50),
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_code) REFERENCES games(game_code) ON DELETE CASCADE,
    UNIQUE KEY unique_player (game_code, player_id),
    INDEX idx_game_players (game_code)
);

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_code VARCHAR(10) NOT NULL,
    player_id VARCHAR(50) NOT NULL,
    question_index INT NOT NULL,
    answer INT NOT NULL,
    time_remaining INT DEFAULT 0,
    points INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_code) REFERENCES games(game_code) ON DELETE CASCADE,
    INDEX idx_game_answers (game_code),
    INDEX idx_player_answers (player_id)
);

-- Limpiar juegos expirados automáticamente
CREATE EVENT IF NOT EXISTS cleanup_expired_games
ON SCHEDULE EVERY 1 HOUR
DO DELETE FROM games WHERE expires_at < NOW();