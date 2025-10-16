# 🔥 Configurar Reglas de Firestore para Brain Games Storm

## ⚠️ IMPORTANTE: CONFIGURACIÓN OBLIGATORIA

Tu proyecto Firebase ahora usa **Firestore** en lugar de Realtime Database. Necesitas configurar las reglas de seguridad para que funcione correctamente.

## 📋 Pasos para Configurar

### 1. Acceder a la Consola Firebase
- Ve a: [Consola Firebase - Reglas Firestore](https://console.firebase.google.com/project/braingamesstorm/firestore/rules)
- Inicia sesión con tu cuenta de Google

### 2. Configurar las Reglas

Reemplaza las reglas actuales con estas **REGLAS DE DESARROLLO** (copia exactamente sin los backticks):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if true;
    }
    
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE:** 
- NO copies los backticks ``` del código
- Copia solo desde `rules_version` hasta la última `}`
- Asegúrate de que NO haya espacios extra al inicio

### 3. Publicar las Reglas
1. Copia y pega las reglas arriba
2. Haz clic en **"Publicar"**
3. Confirma la publicación

## ✅ Verificación

Después de configurar las reglas:
1. Recarga tu página web
2. Intenta crear un nuevo juego
3. Deberías ver: "✅ Juego creado en Firestore"

## 🔒 Reglas de Producción (Futuro)

Cuando el sistema esté listo para producción, usa estas reglas más seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo juegos activos pueden ser leídos/escritos
    match /games/{gameId} {
      allow read: if true;
      allow write: if resource == null || resource.data.isActive == true;
    }
  }
}
```

## 🆘 Solución de Problemas

### Error: "Parse error on line 1" 
- **Causa**: Formato incorrecto o caracteres extra
- **Solución**: 
  1. Borra TODAS las reglas existentes
  2. Copia este texto exacto (sin espacios al inicio):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Error: "permission-denied"
- **Causa**: Las reglas no están configuradas correctamente
- **Solución**: Verifica que las reglas estén publicadas

### Error: "Firestore SDK no disponible"
- **Causa**: El SDK de Firestore no se cargó
- **Solución**: Verifica tu conexión a internet y recarga la página

### Los estudiantes no pueden unirse
- **Causa**: Reglas muy restrictivas
- **Solución**: Usa las reglas de desarrollo mostradas arriba

## 📊 Ventajas de Firestore vs Realtime Database

✅ **Mejor escalabilidad**
✅ **Consultas más potentes**
✅ **Mejor integración con Firebase Auth**
✅ **Menor latencia**
✅ **Mejor soporte para aplicaciones web**

---

**💡 Consejo**: Guarda este archivo para futuras configuraciones de Firebase.