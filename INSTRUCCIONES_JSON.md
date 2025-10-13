# 📋 INSTRUCCIONES PARA FORMATO JSON

## 🎯 Formato Requerido para Importar Cuestionarios

Para importar un cuestionario al sistema KahootFormat, el archivo JSON debe tener **exactamente** esta estructura:

```json
{
  "name": "Título del Cuestionario",
  "description": "Descripción opcional del cuestionario",
  "timeLimit": 30,
  "questions": [
    {
      "question": "Texto de la pregunta",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "answer": 0,
      "justification": "Explicación opcional de la respuesta correcta"
    }
  ]
}
```

## 📝 Propiedades Obligatorias

### **Nivel raíz:**
- `name` (string): Título del cuestionario
- `questions` (array): Array de preguntas

### **Nivel pregunta:**
- `question` (string): Texto de la pregunta
- `options` (array): Array de opciones (mínimo 2, máximo 4)
- `answer` (number): Índice de la respuesta correcta (0, 1, 2, o 3)

## 📝 Propiedades Opcionales

### **Nivel raíz:**
- `description` (string): Descripción del cuestionario
- `timeLimit` (number): Tiempo límite por pregunta en segundos (por defecto: 30)

### **Nivel pregunta:**
- `justification` (string): Explicación de por qué la respuesta es correcta

## ✅ Ejemplo Válido

```json
{
  "name": "Historia Universal",
  "description": "Conocimientos básicos de historia mundial",
  "timeLimit": 25,
  "questions": [
    {
      "question": "¿En qué año comenzó la Segunda Guerra Mundial?",
      "options": ["1938", "1939", "1940", "1941"],
      "answer": 1,
      "justification": "La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana a Polonia."
    },
    {
      "question": "¿Quién fue el primer presidente de Estados Unidos?",
      "options": ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
      "answer": 1,
      "justification": "George Washington fue el primer presidente de Estados Unidos (1789-1797)."
    }
  ]
}
```

## ❌ Errores Comunes

1. **Falta propiedad `questions`**: El archivo debe tener un array de preguntas
2. **Array `options` vacío**: Cada pregunta debe tener al menos 2 opciones
3. **`answer` inválido**: Debe ser un número entero entre 0 y el número de opciones - 1
4. **Formato JSON inválido**: Verificar que no falten comas, llaves o corchetes

## 🔧 Validación Automática

El sistema validará automáticamente:
- ✅ Estructura del JSON
- ✅ Presencia de propiedades obligatorias
- ✅ Tipos de datos correctos
- ✅ Rangos válidos para `answer`
- ✅ Cantidad mínima de opciones

## 📁 Archivos de Ejemplo Incluidos

Los siguientes archivos en la carpeta tienen el formato correcto:
- `ejemplo-javascript.json` - Cuestionario de JavaScript
- `ejemplo-matematicas.json` - Cuestionario de Matemáticas
- `test-basico.json` - Ejemplo mínimo para pruebas

¡Usa estos archivos como referencia para crear tus propios cuestionarios!