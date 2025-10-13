# 🧠⚡ Brain Games Storm - Cuestionarios Online Gratuitos

Un sistema completo de cuestionarios interactivos estilo Kahoot que funciona completamente en el frontend, sin necesidad de servidor backend. Perfecto para educadores que quieren crear cuestionarios dinámicos y compartirlos gratuitamente en GitHub Pages.

## 🚀 Características

- ✨ **Interfaz moderna** estilo Kahoot con colores vibrantes
- 👨‍🏫 **Panel de administrador** para crear y gestionar cuestionarios
- 👩‍🎓 **Interface de estudiante** intuitiva y responsive
- ⏱️ **Temporizador** configurable por pregunta
- 🏆 **Sistema de puntuación** basado en velocidad y precisión
- 📊 **Resultados en tiempo real** para el administrador
- 💾 **Almacenamiento local** sin necesidad de base de datos
- 📱 **Completamente responsive** para móviles y tablets
- 🆓 **Totalmente gratuito** y fácil de desplegar

## 📁 Estructura del Proyecto

```
testkahootformat/
├── index.html              # Página principal
├── admin.html              # Panel de administrador
├── student.html            # Interface de estudiante
├── admin-control.html      # Control de cuestionario en tiempo real
├── styles.css              # Estilos CSS principales
├── script.js               # JavaScript común y funciones utilitarias
├── admin.js                # JavaScript del administrador
├── student.js              # JavaScript del estudiante
├── admin-control.js        # JavaScript del control de cuestionario
└── README.md               # Este archivo
```

## 🎮 Cómo Usar

### Para Administradores (Profesores)

1. **Crear un Cuestionario:**
   - Abre `index.html` en tu navegador
   - Haz clic en "Administrador"
   - Clic en "Nuevo Cuestionario"
   - Completa el título, descripción y tiempo por pregunta
   - Agrega preguntas con 4 opciones máximo
   - Marca la respuesta correcta para cada pregunta
   - Guarda el cuestionario

2. **Iniciar una Sesión:**
   - En el panel de administrador, clic en "Iniciar" junto al cuestionario
   - Se generará un código de 6 caracteres
   - Comparte este código con tus estudiantes
   - Clic en "Iniciar Sesión" para abrir el control en tiempo real

3. **Controlar la Sesión:**
   - Espera a que se conecten los estudiantes
   - Clic en "Comenzar Cuestionario" cuando estés listo
   - Controla el flujo: mostrar resultados y avanzar preguntas
   - Ve estadísticas en tiempo real de participación
   - Descarga los resultados al final

### Para Estudiantes

1. **Unirse a un Cuestionario:**
   - Abre `index.html` en tu navegador
   - Ingresa el código de 6 caracteres proporcionado por el profesor
   - Escribe tu nombre
   - Clic en "Unirse al Juego"

2. **Participar:**
   - Espera a que el profesor inicie el cuestionario
   - Lee cada pregunta cuidadosamente
   - Selecciona tu respuesta antes de que se acabe el tiempo
   - Ve tu puntuación en tiempo real
   - Revisa los resultados finales al terminar

## 🛠️ Instalación y Despliegue

### Opción 1: GitHub Pages (Recomendado)

1. **Fork o Descarga el proyecto**
2. **Sube los archivos a un repositorio de GitHub**
3. **Habilita GitHub Pages:**
   - Ve a Settings → Pages
   - Selecciona "Deploy from a branch"
   - Elige "main" branch / "root"
   - Tu sitio estará disponible en: `https://tu-usuario.github.io/nombre-repositorio`

### Opción 2: Servidor Local

1. **Descarga todos los archivos**
2. **Abre `index.html` directamente en tu navegador**
   - O usa un servidor local simple:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

### Opción 3: Otros Servicios Gratuitos

- **Netlify**: Arrastra la carpeta a netlify.com
- **Vercel**: Conecta tu repositorio de GitHub
- **Firebase Hosting**: Sigue la guía de Firebase

## ⚙️ Configuración

### Personalización de Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-purple: #663399;    /* Color principal */
    --primary-blue: #0099CC;      /* Color secundario */
    --success-green: #26D0CE;     /* Color de éxito */
    --warning-orange: #FF6B35;    /* Color de advertencia */
    --danger-red: #E21B3C;        /* Color de error */
    --kahoot-yellow: #FFD23F;     /* Color de acento */
}
```

### Límites y Configuraciones

- **Máximo de opciones por pregunta**: 4 (A, B, C, D)
- **Tiempo mínimo por pregunta**: 10 segundos
- **Tiempo máximo por pregunta**: 300 segundos (5 minutos)
- **Longitud del código de juego**: 6 caracteres
- **Límite de nombre de jugador**: 20 caracteres

## 🔧 Funcionalidades Técnicas

### Almacenamiento de Datos

- **LocalStorage**: Guarda cuestionarios y juegos activos
- **SessionStorage**: Datos temporales de sesión
- **No requiere base de datos** externa

### Comunicación en Tiempo Real

- **Storage Events**: Para comunicación entre ventanas
- **Custom Events**: Para actualizaciones internas
- **Polling**: Actualización cada 2 segundos en el control

### Sistema de Puntuación

```javascript
// Puntuación base + bonus por velocidad
const baseScore = 1000;
const timeBonus = (timeRemaining / totalTime) * 500;
const finalScore = baseScore + timeBonus;
```

## 🎨 Personalización

### Agregar Nuevos Tipos de Pregunta

1. Modifica la estructura de pregunta en `script.js`
2. Actualiza la interfaz de creación en `admin.html`
3. Ajusta la visualización en `student.html`

### Cambiar el Sistema de Puntuación

Edita la función `calculateScore()` en `script.js`:

```javascript
function calculateScore(timeRemaining, totalTime) {
    // Tu lógica personalizada aquí
    return puntuacion;
}
```

### Agregar Animaciones

Usa las clases CSS incluidas:

```css
.slideInUp { animation: slideInUp 0.6s ease; }
.fadeIn { animation: fadeIn 0.3s ease; }
.pulse { animation: pulse 1s infinite; }
```

## 🐛 Solución de Problemas

### Problema: Los estudiantes no pueden unirse
- Verifica que el código sea correcto (6 caracteres)
- Confirma que el juego esté activo
- Revisa que ambos estén en la misma URL

### Problema: No se guardan los cuestionarios
- Verifica que localStorage esté habilitado
- Limpia la caché del navegador
- Asegúrate de no estar en modo incógnito

### Problema: La comunicación en tiempo real no funciona
- Ambas ventanas deben estar en el mismo dominio
- LocalStorage debe estar disponible
- Verifica la consola del navegador para errores

## 📱 Compatibilidad

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ⭐ Características Avanzadas

### Exportar Resultados
Los administradores pueden descargar los resultados en formato CSV con:
- Nombre del estudiante
- Puntuación total
- Respuestas correctas/incorrectas
- Porcentaje de precisión

### Cuestionarios de Ejemplo
El sistema incluye automáticamente un cuestionario de ejemplo de "Conocimientos Generales" para empezar rápidamente.

### Responsive Design
Optimizado para todos los tamaños de pantalla:
- Desktop: Experiencia completa
- Tablet: Interface adaptada
- Mobile: Optimizado para toques

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Revisa la sección de solución de problemas
2. Abre un issue en GitHub
3. Verifica la consola del navegador para errores específicos

---

**¡Disfruta creando cuestionarios interactivos con KahootFormat!** 🎉