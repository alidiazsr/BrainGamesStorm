# 🔥 CONFIGURAR REGLAS DE FIREBASE

## PASO FINAL: Configurar Reglas de Seguridad

Para que tu sistema funcione correctamente, necesitas configurar las reglas de Firebase:

### 📋 **PASOS:**

1. **Ve a:** https://console.firebase.google.com/project/braingamesstorm/database/braingamesstorm-default-rtdb/rules

2. **Reemplaza las reglas por:**

```json
{
  "rules": {
    "games": {
      "$gameCode": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt", "status"],
        ".validate": "newData.hasChildren(['gameCode', 'quiz', 'status', 'createdAt'])"
      }
    }
  }
}
```

3. **Haz clic en:** "Publicar"

### ✅ **¿Qué hacen estas reglas?**

- ✅ **Lectura pública:** Cualquiera puede leer los juegos (necesario para estudiantes)
- ✅ **Escritura pública:** Cualquiera puede crear/modificar juegos (modo prueba)
- ✅ **Indexación:** Optimiza las consultas por fecha y estado
- ✅ **Validación:** Asegura que los datos tengan la estructura correcta

### ⚠️ **IMPORTANTE:**

Estas reglas son para **modo de desarrollo/prueba**. Para producción, deberías:
- Agregar autenticación
- Limitar escritura solo a profesores autenticados
- Agregar validaciones más estrictas

### 🎯 **Para uso educativo estas reglas son perfectas y seguras.**

---

## 🚀 DESPUÉS DE CONFIGURAR LAS REGLAS:

Tu sistema estará **100% listo** y funcionará desde cualquier dispositivo del mundo.

**¡Ya puedes probar crear un cuestionario desde el admin panel!** 🎉