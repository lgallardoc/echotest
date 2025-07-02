# 🚀 EchoTest - Cliente TCP/IP para Pruebas ISO 8583

**EchoTest** es una herramienta profesional para pruebas de carga y rendimiento en sistemas ISO 8583, diseñada para evaluar la capacidad y latencia de servidores de procesamiento de transacciones financieras con compatibilidad completa para sistemas AS/400.

## ✨ Características Principales

- **🔗 Conexiones Permanentes:** Pool de conexiones TCP persistentes para mejor rendimiento
- **📊 Reportes Detallados:** Reportes HTML con métricas completas, gráficos interactivos y vista lado a lado
- **🌐 Información de Red:** Detalles de IP origen, puerto origen, IP destino y puerto destino
- **⚡ Multi-threading:** Ejecución paralela con múltiples hilos
- **📈 Métricas Avanzadas:** Tiempo de respuesta, throughput, latencia y tasa de éxito
- **🔍 Agrupamiento por Conexiones:** Análisis detallado por conexión permanente
- **⚠️ Validaciones Inteligentes:** Advertencias y recomendaciones de configuración
- **📝 Logging Completo:** Logs detallados con diferentes niveles de verbosidad
- **🔧 Compatibilidad AS/400:** Formato de mensajes 100% compatible con sistemas mainframe
- **🎯 Bitmaps Inteligentes:** Bitmap primario y secundario con validación automática
- **📋 Vista Lado a Lado:** Request y response mostrados simultáneamente en reportes
- **🔍 Mensajes Completos:** Visualización de mensajes raw sin parsear para debugging avanzado
- **📚 Librería ISO8583 Personalizada:** Implementación completa y optimizada del estándar ISO 8583
- **🔬 Soporte LLVAR/LLLVAR:** Campos de longitud variable con headers ASCII
- **✅ Tests Optimizados:** Suite de tests funcionales y unitarios completos

## 🏗️ Arquitectura

### Componentes Principales

- **Cliente TCP Multi-hilo:** Ejecuta pruebas en paralelo
- **Pool de Conexiones:** Gestiona conexiones permanentes al servidor
- **Librería ISO8583 Personalizada:** Implementación completa del estándar ISO 8583
- **Generador de Mensajes ISO 8583:** Crea mensajes de prueba estándar compatibles con AS/400
- **Sistema de Reportes:** Genera reportes HTML con métricas, gráficos y vista lado a lado
- **Sistema de Logging:** Registra eventos y métricas en archivos
- **Validación de Bitmaps:** Verifica automáticamente la estructura de mensajes
- **Soporte LLVAR/LLLVAR:** Manejo de campos de longitud variable

### Flujo de Trabajo

1. **Inicialización:** Establece conexiones permanentes con el servidor
2. **Distribución:** Divide las iteraciones entre hilos
3. **Ejecución:** Envía mensajes ISO 8583 por las conexiones disponibles
4. **Métricas:** Recopila tiempos de respuesta y estadísticas
5. **Reporte:** Genera reporte HTML con análisis detallado y vista lado a lado

## 🚀 Instalación

### Prerrequisitos

- **Node.js 14+** (recomendado: Node.js 16+ para mejor rendimiento)
- npm o pnpm
- Servidor TCP/IP para pruebas

### Verificación de Compatibilidad

```bash
# Verificar versión de Node.js
node --version

# Verificar que sea >= 14.0.0
# El proyecto está configurado para ser compatible con Node.js 14+
```

### Características Verificadas

✅ **ES2018+ Features:**

- Promise.allSettled
- BigInt
- String.prototype.padStart
- Array.prototype.flat
- Object.entries

✅ **Node.js Built-in Modules:**

- fs.promises
- util.promisify
- Buffer.from
- process.env

✅ **JavaScript Moderno:**

- async/await
- Template literals
- Arrow functions
- Classes
- Destructuring
- Spread operator

### Configuración de TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "CommonJS",
    "lib": ["ES2018"]
  }
}
```

### Dependencias Optimizadas

- **@types/node:** ^14.18.0
- **typescript:** ^4.9.0
- **winston:** ^3.8.2 (logging avanzado)
- **dotenv:** ^16.0.3 (variables de entorno)
- **jest:** ^29.5.0 (testing framework)

## 🛠️ Instalación

### Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/lgallardoc/echotest.git
cd echotest

# Instalar dependencias
npm install
# o
pnpm install

# Compilar TypeScript
npm run build
```

## 📖 Uso

### Cliente

```bash
# Compilar y ejecutar
npm run build
node dist/tcp-client.js [opciones]

# O usar ts-node directamente
npx ts-node tcp-client.ts [opciones]

# O usar el script
./run-client.sh [opciones]
```

### Servidor

```bash
# Compilar y ejecutar
npm run build
node dist/tcp-server.js [opciones]

# O usar ts-node directamente
npx ts-node tcp-server.ts [opciones]

# O usar el script
./run-server.sh [opciones]
```

## ⚙️ Opciones de Configuración

### Cliente

- `--ip <ip>`: Dirección IP del servidor (default: 10.245.229.25)
- `--pt <puerto>`: Puerto del servidor (default: 6020)
- `--it <iteraciones>`: Número de iteraciones (default: 1)
- `--dl <delay>`: Delay entre iteraciones en ms (default: 0)
- `--th <hilos>`: Número de hilos para paralelización (default: 1)
- `--cn <n>`: Número de conexiones permanentes (default: 1)
- `--ct <ms>`: Timeout de conexión en ms (default: 3000)
- `--rt <ms>`: Timeout de respuesta en ms (default: 2000)
- `--help`: Mostrar ayuda

### Servidor

- `--pt <puerto>`: Puerto del servidor (default: 6020)
- `--th <hilos>`: Número de hilos del servidor (default: 4)
- `--help`: Mostrar ayuda

## 📚 Librería ISO8583 Personalizada

### Características de la Librería

- **Implementación Completa:** Soporte para todos los campos ISO 8583 (1-128)
- **Formato ASCII Pure:** Compatible con sistemas AS/400
- **Soporte LLVAR/LLLVAR:** Campos de longitud variable con headers ASCII
- **Bitmap Inteligente:** Generación y parsing automático de bitmaps primario y secundario
- **Exclusión de Campo 67:** Automática según requerimientos AS/400
- **Validación de Campos:** Verificación de longitudes y tipos
- **Logging Detallado:** Debug completo para troubleshooting

### Campos Soportados

| Tipo       | Descripción                               | Ejemplos                                       |
| ---------- | ----------------------------------------- | ---------------------------------------------- |
| **FIXED**  | Longitud fija                             | Campo 7 (10 chars), Campo 11 (6 chars)         |
| **LLVAR**  | Longitud variable con header de 2 dígitos | Campo 2 (PAN), Campo 35 (Track 2)              |
| **LLLVAR** | Longitud variable con header de 3 dígitos | Campo 36 (Track 3), Campo 48 (Additional Data) |

### Uso de la Librería

```typescript
import { buildIso8583Message, parseIso8583Message } from "./iso8583-lib";

// Construir mensaje
const fields = {
  "0": "0800", // MTI
  "7": "0512161608", // Transmission Date & Time
  "11": "059685", // STAN
  "37": "513200059685", // Retrieval Reference
  "70": "301", // Network Management
};

const message = buildIso8583Message(fields);

// Parsear mensaje
const parsed = parseIso8583Message(Buffer.from(message, "ascii"));
```

## 🧪 Testing

### Tests Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests funcionales
npm test -- --testPathPattern="iso8583-lib|test-llvar"

# Ejecutar tests específicos
npm test -- iso8583-lib.test.ts
npm test -- test-llvar-lllvar.ts
```

### Cobertura de Tests

- **iso8583-lib.test.ts:** 18 tests unitarios de la librería ISO8583
- **test-llvar-lllvar.ts:** Tests de campos LLVAR/LLLVAR
- **tcp-client.test.ts:** Tests del cliente (desactivados temporalmente)

### Validación de Funcionalidad

```bash
# Validación completa del proyecto
npm run build
npm test
./run-server.sh &
sleep 3
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 1
pkill -f "node dist/tcp-server.js"
```

## 📊 Características del Reporte

### Vista Lado a Lado con Mensajes Completos

El reporte HTML ahora incluye una vista lado a lado que muestra:

- **Request (Izquierda):**
  - **🔍 Mensaje Completo:** Mensaje raw completo sin parsear (formato ASCII pure)
  - **📋 Campos Parseados:** Mensaje enviado con todos los campos y bitmaps
- **Response (Derecha):**
  - **🔍 Mensaje Completo:** Mensaje raw completo sin parsear (formato ASCII pure)
  - **📋 Campos Parseados:** Mensaje recibido con todos los campos y bitmaps
- **Comparación Visual:** Fácil identificación de diferencias entre request y response
- **Debugging Avanzado:** Análisis completo del protocolo ISO 8583

### Agrupamiento por Conexiones

- **Agrupamiento por Conexiones:** Los detalles se organizan por conexión permanente para facilitar el análisis
- **Información de Red:** Cada conexión muestra IP origen, puerto origen, IP destino y puerto destino
- **Estadísticas por Conexión:** Cada conexión muestra sus propias métricas (tiempo promedio, tasa de éxito, etc.)
- **Validación de Configuración:** Advertencias cuando el número de hilos no coincide con el número de conexiones

### Métricas Importantes

- **Tiempo total:** Duración completa de la prueba
- **Throughput:** Mensajes por segundo
- **Latencia promedio:** Tiempo promedio de respuesta
- **Latencia mín/máx:** Valores extremos de latencia
- **Tasa de éxito:** Porcentaje de mensajes exitosos
- **Timeouts configurados:** Valores de timeout de conexión y respuesta

### Estructura del Reporte

1. **Resumen Ejecutivo:** Métricas generales y configuración
2. **Gráficos de Rendimiento:** Visualización de latencia y throughput
3. **Detalles por Conexión:** Análisis individual de cada conexión
4. **Vista Lado a Lado:** Request y response para cada iteración
   - **🔍 Mensaje Completo:** Mensaje raw sin parsear (formato ASCII pure)
   - **📋 Campos Parseados:** Campos individuales extraídos del mensaje
5. **Información de Red:** Detalles de conectividad

## 🔧 Configuración del Servidor

### Servidor Local

```bash
# Iniciar servidor en puerto 6020
./run-server.sh --pt 6020

# Con múltiples hilos
./run-server.sh --pt 6020 --th 8
```

### Configuración de Red

- **Puerto:** 6020 (configurable)
- **Protocolo:** TCP/IP
- **Mensajes:** ISO 8583 Echo Test (MTI 0800/0810)
- **Encoding:** ASCII Pure

## 📈 Ejemplos de Uso

### Configuraciones Básicas

#### 1. Prueba Simple

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 10
```

**Resultado:** 10 mensajes enviados secuencialmente

#### 2. Prueba con Múltiples Hilos

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5
```

**Resultado:** 100 mensajes distribuidos entre 5 hilos

#### 3. Prueba con Conexiones Permanentes

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 500 --th 8 --cn 8
```

**Resultado:** 500 mensajes con 8 conexiones permanentes (configuración óptima 1:1)

### Configuraciones Avanzadas

#### 4. Prueba de Carga Alta

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 1000 --th 20 --cn 5
```

**Resultado:** 1000 mensajes con alta concurrencia

#### 5. Prueba con Delay

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 50 --dl 100
```

**Resultado:** 50 mensajes con 100ms de delay entre cada uno

#### 6. Prueba de Estabilidad

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 1000 --dl 50 --th 5
```

**Resultado:** Prueba de estabilidad con carga moderada

#### 7. Prueba con Timeouts Personalizados

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --ct 5000 --rt 3000
```

**Resultado:** 100 mensajes con timeout de conexión de 5 segundos y timeout de respuesta de 3 segundos

#### 8. Prueba Multi-hilo con Delay

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 50 --th 2 --dl 250
```

**Resultado:** 50 iteraciones por cada uno de los 2 hilos con 250ms de delay entre iteraciones

## 🔍 Validaciones y Advertencias

### Configuración Óptima (1:1)

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --cn 5
```

**Mensaje:** `✅ Configuración óptima: 5 conexión(es) para 5 hilos (1:1)`

### Más Conexiones que Hilos

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 3 --cn 5
```

**Mensaje:** `ℹ️ INFO: Tienes 5 conexión(es) para 3 hilos. Las conexiones adicionales permitirán mejor rendimiento.`

### Más Hilos que Conexiones (Advertencia)

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --cn 3
```

**Mensaje:**

```
⚠️ ADVERTENCIA: Tienes 5 hilos pero solo 3 conexión(es). Algunos hilos tendrán que esperar a que las conexiones estén disponibles.
💡 Recomendación: Usar --cn 5 para tener una conexión por hilo, o reducir --th a 3 para usar una conexión por hilo.
```

## 📊 Interpretación de Resultados

### Métricas Clave

- **Latencia < 10ms:** Excelente rendimiento
- **Latencia 10-50ms:** Buen rendimiento
- **Latencia 50-100ms:** Rendimiento aceptable
- **Latencia > 100ms:** Posible problema de red o servidor

### Análisis por Conexión

- **Rendimiento Individual:** Cada conexión muestra sus propias métricas
- **Distribución de Carga:** Cómo se distribuyen las transacciones
- **Problemas Específicos:** Identificar conexiones problemáticas

### Reportes Generados

- **Reporte HTML:** `tmp/echotest_report_IP_PORT_TIMESTAMP.html`
- **Logs:** `log/echotest_TIMESTAMP.log`

### 🔍 Debugging y Análisis de Protocolo

El reporte HTML ahora incluye mensajes completos sin parsear que facilitan:

- **Análisis de Headers:** Visualización de headers de longitud ASCII
- **Verificación de Formato:** Confirmación del formato ASCII pure
- **Comparación de Mensajes:** Análisis lado a lado de request vs response
- **Troubleshooting:** Identificación rápida de problemas de protocolo
- **Validación AS/400:** Verificación de compatibilidad con sistemas mainframe

#### Ejemplo de Mensaje Completo en Reporte:

```
🔍 Mensaje Completo:
00670800822000000800000004000000000000002507021955696034005132696034301

📋 Campos Parseados:
0: 0800
7: 2507021955
11: 696034
37: 005132696034
70: 301
```

## 🛠️ Desarrollo

### Estructura del Proyecto Optimizada

```
echotest/
├── 📁 dist/                    # Código compilado (6 archivos .js)
├── 📁 log/                     # Archivos de log (limpio)
├── 📁 tmp/                     # Reportes HTML (limpio)
├── 📄 iso8583-lib.ts          # Librería ISO8583 personalizada
├── 📄 iso8583-lib.test.ts     # Tests unitarios de la librería
├── 📄 test-llvar-lllvar.ts    # Tests de campos LLVAR/LLLVAR
├── 📄 tcp-server.ts           # Servidor principal
├── 📄 tcp-client.ts           # Cliente principal
├── 📄 tcp-client.test.ts      # Tests del cliente (desactivados)
├── 📄 run-client.sh           # Script del cliente (validado)
├── 📄 run-server.sh           # Script del servidor (validado)
├── 📄 package.json            # Configuración del proyecto
├── 📄 tsconfig.json           # Configuración TypeScript
├── 📄 jest.config.js          # Configuración de tests
├── 📄 .gitignore              # Archivos ignorados por Git
├── 📄 env.example             # Ejemplo de variables de entorno
└── 📄 README.md               # Documentación principal
```

### Comandos de Desarrollo

```bash
# Compilar TypeScript
npm run build

# Ejecutar tests funcionales
npm test -- --testPathPattern="iso8583-lib|test-llvar"

# Ejecutar con ts-node (desarrollo)
npx ts-node tcp-client.ts
npx ts-node tcp-server.ts

# Validación completa del proyecto
npm run build && npm test && ./run-server.sh & sleep 3 && ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 1
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# Nivel de logging
LOG_LEVEL=debug|info|error

# Timeout de conexión
CONNECTION_TIMEOUT=30000
```

### Configuración de Red

- **TCP Keep-Alive:** Habilitado por defecto
- **Timeout de Conexión:** 30 segundos
- **Reintentos:** No implementados (se puede agregar)

## 🐛 Troubleshooting

### Problemas Comunes

#### Error: "ECONNREFUSED"

```bash
# Verificar que el servidor esté ejecutándose
./run-server.sh --pt 6020
```

#### Error: "Timeout"

```bash
# Reducir la carga o aumentar el timeout
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 10 --th 1
```

#### Error: "Connection pool exhausted"

```bash
# Aumentar el número de conexiones
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 10 --cn 10
```

#### Reporte no se genera

```bash
# Verificar permisos de escritura
chmod +w tmp/ log/
```

#### Tests fallan

```bash
# Ejecutar solo tests funcionales
npm test -- --testPathPattern="iso8583-lib|test-llvar"

# Recompilar proyecto
npm run build
```

## 🔧 Compatibilidad con AS/400

### ✅ Formato de Mensajes Compatible

EchoTest genera mensajes ISO 8583 completamente compatibles con sistemas AS/400 usando la librería personalizada. Los mensajes siguen el formato estándar utilizado en entornos mainframe:

#### **Estructura del Mensaje AS/400:**

```
00670800822000000800000004000000000000002506271755007447005132007447301
```

#### **Análisis del Formato:**

- **Longitud:** `0067` (103 bytes)
- **MTI:** `0800` (Network Management Request)
- **Bitmap Primario:** `8220000008000000` (bits 1, 7, 11, 37 encendidos)
- **Bitmap Secundario:** `0400000000000000` (bit 33 encendido para campo 70)
- **Campos:** 1, 7, 11, 37, 70

### 📊 Campos ISO 8583 Soportados

| Campo  | Descripción                         | Longitud | Tipo  | Valor                    |
| ------ | ----------------------------------- | -------- | ----- | ------------------------ |
| **1**  | Secondary Bitmap                    | 16 chars | FIXED | `0400000000000000`       |
| **7**  | Transmission Date & Time            | 10 chars | FIXED | `MMDDhhmmss`             |
| **11** | Systems Trace Audit Number          | 6 chars  | FIXED | `STAN`                   |
| **37** | Retrieval Reference Number          | 12 chars | FIXED | `005132STAN`             |
| **39** | Response Code                       | 2 chars  | FIXED | `00` (solo en respuesta) |
| **70** | Network Management Information Code | 3 chars  | FIXED | `301`                    |

### 🔍 Comparación de Formatos

#### **Mensaje Cliente EchoTest:**

```
00670800822000000800000004000000000000002506271755007447005132007447301
```

#### **Mensaje AS/400 Real:**

```
00670800822000000800000004000000000000000627175206337846517800337846301
```

**✅ Coincidencias:**

- Longitud del mensaje: `0067` (103 bytes)
- Bitmap primario: `8220000008000000`
- Bitmap secundario: `0400000000000000`
- Estructura de campos: 1, 7, 11, 37, 70
- Formato de fecha/hora: `MMDDhhmmss`
- Campo 70: `301` (Echo Test)

### 🛠️ Configuración Técnica

#### **Librería ISO8583 Personalizada:**

```typescript
// Construcción de mensaje
const fields = {
  "0": "0800", // MTI
  "7": "0512161608", // Transmission Date & Time
  "11": "059685", // STAN
  "37": "513200059685", // Retrieval Reference
  "70": "301", // Network Management
};

const message = buildIso8583Message(fields);
```

#### **Configuración de Bitmaps:**

- **Bitmap Primario:** `8220000008000000`

  - Bit 1: Secondary Bitmap presente
  - Bit 7: Transmission Date & Time
  - Bit 11: Systems Trace Audit Number
  - Bit 37: Retrieval Reference Number

- **Bitmap Secundario:** `0400000000000000`
  - Bit 33: Network Management Information Code (campo 70)

### 🔧 Filtrado Automático

El sistema incluye filtrado automático para eliminar campos no deseados:

- **Campo 67:** Eliminado automáticamente (no presente en AS/400)
- **Campos vacíos:** Filtrados del resultado final
- **Validación:** Solo campos con valores válidos se incluyen

### 📈 Logs de Compatibilidad

Los logs muestran la compatibilidad completa:

```
[DEBUG] Bitmap primario: 8220000008000000
[DEBUG] Bitmap secundario: 0400000000000000
[DEBUG] Campo 1 (Secondary Bitmap) presente: 0400000000000000
[DEBUG] Campo 70 presente con valor: 301
[DEBUG] ✅ Campo 67 correctamente excluido de la estructura
```

### 🎯 Casos de Uso AS/400

#### **1. Pruebas de Conectividad:**

```bash
./run-client.sh --ip 192.168.1.100 --pt 6020 --it 10
```

#### **2. Pruebas de Carga:**

```bash
./run-client.sh --ip 192.168.1.100 --pt 6020 --it 1000 --th 10 --cn 5
```

#### **3. Pruebas de Estabilidad:**

```bash
./run-client.sh --ip 192.168.1.100 --pt 6020 --it 10000 --dl 100 --th 5
```

### 🔍 Verificación de Compatibilidad

Para verificar que los mensajes son compatibles con AS/400:

1. **Comparar longitudes:** Mensajes deben tener 103 bytes (0067)
2. **Verificar bitmaps:** Primario y secundario deben coincidir
3. **Validar campos:** Solo campos 1, 7, 11, 37, 70 deben estar presentes
4. **Revisar formato:** Fecha/hora en formato `MMDDhhmmss`

### 📋 Troubleshooting AS/400

#### **Problema: Mensaje rechazado por AS/400**

```bash
# Verificar formato del mensaje
./run-client.sh --ip 192.168.1.100 --pt 6020 --it 1
# Revisar logs para confirmar formato correcto
```

#### **Problema: Campos faltantes**

```bash
# Verificar que todos los campos estén presentes
tail -50 log/echotest_*.log
# Buscar: "Campo 1", "Campo 7", "Campo 11", "Campo 37", "Campo 70"
```

#### **Problema: Bitmap incorrecto**

```bash
# Verificar bitmaps en logs
grep "Bitmap primario" log/echotest_*.log
grep "Bitmap secundario" log/echotest_*.log
```

## 🔧 Compatibilidad

### Versiones de Node.js Soportadas

EchoTest es compatible con **Node.js 14+** y versiones superiores. Se han realizado las siguientes configuraciones para garantizar la compatibilidad:

- **TypeScript Target:** ES2018 (compatible con Node.js 14+)
- **Dependencias:** Versiones compatibles con Node.js 14+
- **Características:** Uso de ES2018+ features soportadas

### Verificación de Compatibilidad

```bash
# Verificar versión de Node.js
node --version

# Verificar que sea >= 14.0.0
```

## 📋 Changelog

### v1.6.0 - Mensajes Completos en Reportes HTML

- ✅ **Mensajes Completos:** Visualización de mensajes raw sin parsear en reportes HTML
- ✅ **Debugging Avanzado:** Análisis completo del protocolo ISO 8583 con mensajes completos
- ✅ **Formato ASCII Pure:** Visualización del formato exacto enviado/recibido
- ✅ **Comparación Visual:** Fácil comparación entre mensajes enviados y recibidos
- ✅ **Análisis de Protocolo:** Facilita el análisis de headers de longitud y estructura
- ✅ **Documentación Actualizada:** README actualizado con nueva funcionalidad

### v1.5.0 - Optimización y Limpieza del Proyecto

- ✅ **Librería ISO8583 Personalizada:** Implementación completa y optimizada del estándar ISO 8583
- ✅ **Soporte LLVAR/LLLVAR:** Campos de longitud variable con headers ASCII
- ✅ **Tests Optimizados:** Suite de tests funcionales y unitarios completos
- ✅ **Limpieza del Proyecto:** Eliminación de archivos innecesarios y optimización de estructura
- ✅ **Scripts Validados:** Verificación de sintaxis y permisos de scripts .sh
- ✅ **Dependencias Optimizadas:** Solo módulos necesarios y actualizados
- ✅ **Documentación Actualizada:** README completo con nueva estructura y funcionalidades
- ✅ **Validación Completa:** Tests, servidor y cliente funcionando correctamente

### v1.4.0 - Vista Lado a Lado y Mejoras en Reportes

- ✅ **Vista lado a lado:** Request y response mostrados simultáneamente en reportes HTML
- ✅ **Mejoras en bitmaps:** Visualización mejorada de bitmap primario y secundario
- ✅ **Ordenamiento de campos:** Campos organizados por importancia (bitmaps, tipo, campos)
- ✅ **Eliminación de sección de análisis:** Simplificación del reporte
- ✅ **Mejoras en CSS:** Layout mejorado con CSS Grid para vista lado a lado
- ✅ **Documentación actualizada:** README completo con todas las nuevas funcionalidades

### v1.3.0 - Compatibilidad AS/400

- ✅ **Compatibilidad completa con AS/400:** Mensajes ISO 8583 compatibles con sistemas mainframe
- ✅ **Bitmap secundario:** Implementación correcta del campo 1 (Secondary Bitmap)
- ✅ **Estructura de campos:** Solo campos 1, 7, 11, 37, 70 (eliminación automática de campo 67)
- ✅ **Formato de mensaje:** Longitud 103 bytes (0067) con estructura AS/400 estándar
- ✅ **Logs mejorados:** Información detallada de bitmaps y campos
- ✅ **Documentación AS/400:** Guía completa de compatibilidad y troubleshooting
- ✅ **Validación de formato:** Verificación automática de estructura de mensajes

### v1.2.0 - Timeouts Configurables

- ✅ Agregar parámetro `--ct` para timeout de conexión (default: 3000ms)
- ✅ Agregar parámetro `--rt` para timeout de respuesta (default: 2000ms)
- ✅ Implementar timeout de respuesta en cada iteración
- ✅ Mejorar parsing de mensajes ISO 8583 para incluir todos los campos
- ✅ Corregir visualización del campo 70 en reportes HTML
- ✅ Actualizar documentación con nuevos parámetros

### v1.1.0 - Conexiones Permanentes

- ✅ Agregar parámetro `--cn` para conexiones permanentes
- ✅ Implementar pool de conexiones persistentes
- ✅ Agregar información de red en reportes
- ✅ Agrupar detalles por conexión
- ✅ Validaciones de configuración
- ✅ Mejorar documentación

### v1.0.0 - Versión Inicial

- ✅ Cliente TCP/IP básico
- ✅ Soporte para mensajes ISO 8583
- ✅ Reportes HTML básicos
- ✅ Multi-threading básico

## 📄 Licencia

ISC License

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias y mejoras.

## 📞 Soporte

Para soporte técnico o preguntas, por favor abre un issue en el repositorio de GitHub.
