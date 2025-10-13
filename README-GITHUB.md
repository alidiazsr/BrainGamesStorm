# 🧠⚡ Brain Games Storm

[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://github.com/yourusername/brain-games-storm)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/yourusername/brain-games-storm.svg)](https://github.com/yourusername/brain-games-storm/stargazers)
[![Forks](https://img.shields.io/github/forks/yourusername/brain-games-storm.svg)](https://github.com/yourusername/brain-games-storm/network)

> **El sistema de cuestionarios interactivos más emocionante y educativo** 🎓  
> Una alternativa moderna, gratuita y de código abierto a Kahoot con características educativas avanzadas.

## 🌟 **¿Por qué Brain Games Storm?**

- 🆓 **100% Gratuito** - Sin límites, sin suscripciones
- 🎨 **Interfaz Moderna** - Diseño atractivo y gamificado  
- 🎵 **Sistema de Audio** - Sonidos inmersivos personalizables
- 📱 **Mobile-First** - Optimizado para smartphones
- 🔒 **Privacidad Total** - Sin tracking, sin datos en servidores
- ⚡ **Sin Instalación** - Funciona directamente en el navegador
- 📚 **Enfoque Educativo** - Rankings con explicaciones detalladas

---

## 🚀 **Demo en Vivo**

### [🎮 **JUGAR AHORA - DEMO EN VIVO**](https://yourusername.github.io/brain-games-storm)

**Códigos de prueba disponibles:**
- 📚 **Cuestionario de JavaScript**: Código `JS2024`
- 🧮 **Matemáticas Básicas**: Código `MATH01`
- ⚙️ **Introducción a Node.js**: Código `NODE20`

---

## ✨ **Características Destacadas**

### 🎵 **Sistema de Audio Inmersivo**
- Sonidos personalizables para cada acción del juego
- Previsualizador integrado para elegir tu estilo preferido
- Audio contextual que mejora la experiencia de aprendizaje

### 🎯 **Gamificación Avanzada**
- 20 avatares únicos para personalización
- Rankings en tiempo real con podios animados
- Efectos visuales y feedback inmediato
- Cronómetros dinámicos con tensión creciente

### 📚 **Enfoque Educativo Revolucionario**
- **Rankings educativos**: Cada ranking muestra pregunta + respuesta correcta + justificación
- **Pantalla de resultados compartible** para discusión grupal
- **Control total del profesor** sobre el flujo del juego
- **Análisis detallado** de participación

### 🔧 **Panel de Administración Profesional**
- **Autenticación segura** con contraseña personalizable
- **Carga de cuestionarios JSON** con validación automática
- **Generación de códigos únicos** de 6 dígitos
- **Control de flujo** pregunta por pregunta

---

## 🎮 **Cómo Usar**

### 👩‍🏫 **Para Profesores**

1. **📁 Acceso Admin**: Clic en "Admin" (esquina superior derecha)
2. **🔑 Login**: Contraseña por defecto `admin2024`
3. **📤 Cargar Quiz**: Subir archivo JSON con preguntas
4. **🎲 Generar Código**: Crear código único de 6 dígitos
5. **🎮 Controlar Juego**: Avanzar preguntas y mostrar resultados

### 🎓 **Para Estudiantes**

1. **🌐 Acceder**: Ir a la página principal
2. **🔢 Código**: Introducir código de 6 dígitos
3. **😊 Avatar**: Elegir entre 20 avatares divertidos
4. **🏆 Jugar**: Responder y competir en tiempo real

---

## 📋 **Formato de Cuestionarios**

Crea cuestionarios con este formato JSON:

```json
{
  "name": "Mi Cuestionario Increíble",
  "timePerQuestion": 20,
  "questions": [
    {
      "question": "¿Cuál es la capital de España?",
      "answers": [
        { "text": "Barcelona", "correct": false },
        { "text": "Madrid", "correct": true },
        { "text": "Valencia", "correct": false },
        { "text": "Sevilla", "correct": false }
      ],
      "justification": "Madrid es la capital de España desde 1561, cuando Felipe II estableció allí la corte de manera permanente."
    }
  ]
}
```

### 📝 **Ejemplos Incluidos**
- `ejemplo-javascript.json` - Conceptos básicos de JavaScript
- `ejemplo-matematicas.json` - Operaciones y geometría
- `nodejs-introduccion.json` - Fundamentos de Node.js

---

## 🛠️ **Instalación Local**

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/brain-games-storm.git

# Navegar al directorio
cd brain-games-storm

# Abrir en navegador
# Solo abre index.html en tu navegador favorito
```

**¡No necesita servidor! Funciona directamente desde archivos locales.**

---

## 🌐 **Despliegue en GitHub Pages**

1. **Fork** este repositorio
2. Ve a **Settings** > **Pages**
3. Selecciona **Deploy from a branch** > **main**
4. ¡Tu Brain Games Storm estará online en minutos!

**URL será**: `https://tu-usuario.github.io/brain-games-storm`

---

## 🎨 **Personalización**

### 🎵 **Configurar Sonidos**
1. Abrir `sound-preview.html`
2. Escuchar todas las opciones disponibles
3. Seleccionar favoritos por categoría
4. Aplicar cambios al sistema

### 🎯 **Modificar Estilos**
- **Colores**: Editar variables CSS en `styles.css`
- **Tipografía**: Cambiar fuentes en el `<head>` de HTML
- **Animaciones**: Ajustar duraciones en las clases CSS

### 🔒 **Cambiar Contraseña Admin**
Editar en `admin-auth.js`:
```javascript
const ADMIN_PASSWORD = 'tu-nueva-contraseña';
```

---

## 🤝 **Cómo Contribuir**

¡Contribuciones son bienvenidas! 

### 🐛 **Reportar Bugs**
- Usa [GitHub Issues](https://github.com/yourusername/brain-games-storm/issues)
- Incluye pasos para reproducir el problema
- Especifica navegador y dispositivo

### ✨ **Solicitar Características**
- Abre un [Feature Request](https://github.com/yourusername/brain-games-storm/issues)
- Describe el uso caso y beneficios
- Incluye mockups si es posible

### 📝 **Pull Requests**
1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📁 **Estructura del Proyecto**

```
brain-games-storm/
├── 📄 index.html              # Página principal
├── 👨‍💼 admin.html              # Panel de administración
├── 🎓 student.html            # Interfaz de estudiante
├── 📊 results-display.html    # Pantalla de resultados
├── 🎵 sound-preview.html      # Configurador de sonidos
├── 🎨 styles.css              # Estilos completos
├── ⚙️ admin.js               # Lógica de administración
├── 🎮 student.js             # Lógica de estudiante
├── 📋 *.json                 # Cuestionarios de ejemplo
└── 📚 README.md              # Esta documentación
```

---

## 🔧 **Tecnologías**

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Audio**: Web Audio API
- **Storage**: LocalStorage
- **Icons**: FontAwesome
- **Fonts**: Google Fonts (Montserrat)
- **Responsive**: CSS Flexbox/Grid

---

## 📜 **Licencia**

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 💫 **Créditos**

Desarrollado con ❤️ para revolucionar la educación interactiva.

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**

---

## 📞 **Soporte**

- 🐛 **Bugs**: [GitHub Issues](https://github.com/yourusername/brain-games-storm/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/yourusername/brain-games-storm/discussions)
- 📧 **Email**: brain-games-storm@example.com

---

## 🚀 **Roadmap**

- [ ] 📱 App móvil nativa
- [ ] 🌐 Modo multijugador global
- [ ] 📈 Analytics avanzados
- [ ] 🎨 Temas personalizables
- [ ] 🔊 Síntesis de voz para preguntas
- [ ] 📊 Exportar resultados a Excel
- [ ] 🌍 Internacionalización (i18n)

---

<div align="center">

**⚡ Brain Games Storm 2025**  
*"Aprender nunca fue tan divertido"*

[![GitHub](https://img.shields.io/badge/GitHub-⭐_Star-yellow)](https://github.com/yourusername/brain-games-storm)
[![Demo](https://img.shields.io/badge/Demo-🎮_Jugar-brightgreen)](https://yourusername.github.io/brain-games-storm)

</div>