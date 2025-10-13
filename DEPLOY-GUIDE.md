# 🚀 Guía Rápida de Despliegue en GitHub

## 📋 Pasos para subir Brain Games Storm a GitHub:

### 1. 📁 **Crear Repositorio en GitHub**
1. Ve a [GitHub](https://github.com)
2. Clic en "New repository" (botón verde)
3. Nombre: `brain-games-storm`
4. Descripción: `🧠⚡ Interactive quiz system - Modern Kahoot alternative`
5. ✅ Marcar "Public"
6. ❌ NO marcar "Add README" (ya tenemos uno)
7. Clic "Create repository"

### 2. 🔗 **Conectar con el repositorio local**
```bash
# Agregar origin remoto (usa TU username de GitHub)
git remote add origin https://github.com/TU-USERNAME/brain-games-storm.git

# Cambiar rama a main
git branch -M main

# Subir código
git push -u origin main
```

### 3. 🌐 **Activar GitHub Pages**
1. En tu repositorio de GitHub, ve a **Settings**
2. Scroll hacia abajo hasta **Pages**
3. En "Source" selecciona **Deploy from a branch**
4. Selecciona **main** branch
5. Clic **Save**
6. ¡Espera 2-5 minutos!

### 4. ✅ **¡Listo! Tu sitio estará en:**
```
https://TU-USERNAME.github.io/brain-games-storm
```

## 🔧 **Comandos Git Útiles**

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción del cambio"

# Subir cambios
git push

# Ver historial
git log --oneline
```

## 📝 **Para actualizar el sitio:**
1. Hacer cambios en archivos localmente
2. `git add .`
3. `git commit -m "Descripción"`
4. `git push`
5. ¡GitHub Pages se actualiza automáticamente!

## 🎯 **Personalizar URLs en README**
Después de crear el repositorio, reemplaza en `README-GITHUB.md`:
- `yourusername` → tu username real de GitHub
- `brain-games-storm` → nombre exacto de tu repositorio

## 🔒 **Cambiar contraseña admin (recomendado)**
En `admin-auth.js`, línea 2:
```javascript
const ADMIN_PASSWORD = 'tu-nueva-contraseña-segura';
```

## 🎉 **¡Felicidades!**
Tu Brain Games Storm estará disponible globalmente y podrás compartir el enlace con estudiantes de todo el mundo.