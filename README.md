# EchoTest - TCP/IP Echo Test Client and Server for ISO 8583

Sistema completo de pruebas de carga para protocolo ISO 8583 con cliente y servidor TCP/IP multi-threaded.

## 🚀 Características

- **Servidor Multi-Worker**: 16 workers (uno por CPU core)
- **Cliente Multi-Hilo**: Ejecución paralela de iteraciones
- **Protocolo ISO 8583**: Implementación completa del estándar
- **Reportes HTML**: Métricas detalladas con gráficos
- **Logs Organizados**: Separación en directorios `log/` y `tmp/`
- **Configuración Flexible**: Parámetros configurables via línea de comandos
- **Manejo Robusto de Errores**: Timeouts, reconexiones y logging detallado

## 📋 Requisitos

- Node.js 16+
- npm o pnpm

## 🛠️ Instalación Rápida

### Opción 1: Instalación Automática

```bash
# Clonar el repositorio
git clone <repository-url>
cd echotest

# Ejecutar script de instalación automática
chmod +x install.sh
./install.sh
```

### Opción 2: Instalación Manual

```bash
# Clonar el repositorio
git clone <repository-url>
cd echotest

# Instalar dependencias
npm install

# Compilar TypeScript a JavaScript
npm run build
# o
npx tsc

# Crear directorios necesarios
mkdir -p tmp log
```

Los archivos compilados se generan en el directorio `dist/`.

## 🚀 Ejecución

### Opción 1: Con TypeScript (Desarrollo)

```bash
# Servidor
npm run dev:server
# o
ts-node tcp-server.ts

# Cliente
npm run dev:client -- --ip 127.0.0.1 --pt 6020 --it 100 --th 5
# o
ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 100 --th 5
```

### Opción 2: Con JavaScript (Producción)

```bash
# Servidor
npm start
# o
node dist/tcp-server.js

# Cliente
npm run client -- --ip 127.0.0.1 --pt 6020 --it 100 --th 5
# o
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 100 --th 5
```

### Opción 3: Scripts de Ejecución (Después de install.sh)

```bash
# Servidor
./run-server.sh

# Cliente
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5
```

## 📖 Uso del Cliente

### Parámetros Disponibles

```bash
ts-node tcp-client.ts [opciones]
# o
node dist/tcp-client.js [opciones]

Opciones:
  --ip <ip>           Dirección IP del servidor (default: 10.245.229.25)
  --pt <puerto>       Puerto del servidor (default: 6020)
  --it <iteraciones>  Número de iteraciones (default: 1)
  --dl <delay>        Delay entre iteraciones en ms (default: 0)
  --th <hilos>        Número de hilos para paralelización (default: 1)
  --cn <n>           Número de conexiones permanentes (default: 1)
  --help              Mostrar ayuda
```

### Ejemplos de Uso

```bash
# Prueba básica
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 10 --th 2

# Prueba de carga
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --dl 50

# Prueba de rendimiento
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 500 --th 10 --dl 0

# Prueba con servidor remoto
node dist/tcp-client.js --ip 192.168.1.100 --pt 8080 --it 1000 --th 8

# Prueba de estrés
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 2000 --th 20 --dl 0

# Prueba con conexiones permanentes
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 1000 --th 5 --cn 3
```

## 🔗 Conexiones Permanentes

EchoTest soporta conexiones TCP permanentes para mejorar el rendimiento y simular escenarios reales de producción.

### Características

- **Pool de Conexiones**: Establece un número fijo de conexiones al inicio
- **Distribución de Carga**: Las iteraciones se distribuyen automáticamente entre las conexiones disponibles
- **Reutilización**: Las conexiones se reutilizan para múltiples transacciones
- **Gestión Automática**: Las conexiones se cierran automáticamente al finalizar las pruebas

### Configuración

```bash
# Una sola conexión (comportamiento tradicional)
--cn 1

# Múltiples conexiones para mejor rendimiento
--cn 5

# Conexiones igual al número de hilos
--cn 10 --th 10
```

### Escenarios de Uso

#### 1. Conexión Única

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --cn 1
```

- **Ventaja**: Simula cliente con una sola conexión
- **Comportamiento**: Las iteraciones esperan a que la conexión esté disponible
- **Uso**: Pruebas de concurrencia y límites de conexión

#### 2. Conexiones Múltiples

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 1000 --th 10 --cn 5
```

- **Ventaja**: Mejor rendimiento, menor overhead de conexión
- **Comportamiento**: Distribución automática de carga
- **Uso**: Pruebas de rendimiento y carga

#### 3. Conexiones por Hilo

```bash
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 500 --th 8 --cn 8
```

- **Ventaja**: Cada hilo tiene su propia conexión
- **Comportamiento**: Paralelismo máximo
- **Uso**: Pruebas de estrés y capacidad máxima

### Ventajas de las Conexiones Permanentes

1. **Mejor Rendimiento**: Elimina el overhead de abrir/cerrar conexiones
2. **Simulación Realista**: Simula clientes de producción que mantienen conexiones
3. **Control de Concurrencia**: Permite controlar el número máximo de conexiones simultáneas
4. **Análisis de Cuellos de Botella**: Identifica límites de conexión del servidor
5. **Métricas Detalladas**: Estadísticas por conexión en los reportes

### Consideraciones

- **Memoria**: Más conexiones = más uso de memoria
- **Límites del Servidor**: El servidor puede tener límites de conexiones concurrentes
- **Red**: Considerar el impacto en la red para pruebas remotas
- **Timeout**: Las conexiones tienen timeout configurable (30s por defecto)

## 📊 Reportes y Logs

### Estructura de Archivos

```
echotest/
├── dist/                                    # Archivos JavaScript compilados
│   ├── tcp-server.js
│   ├── tcp-client.js
│   └── ...
├── tmp/                                     # Reportes HTML
│   ├── echotest_report_127_0_0_1_6020_2025-06-27_21-01-45.html
│   └── ...
├── log/                                     # Archivos de log
│   ├── echotest_2025-06-26.log             # Logs del cliente
│   └── server.log                          # Logs del servidor
├── tcp-server.ts                           # Servidor TypeScript
├── tcp-client.ts                           # Cliente TypeScript
├── install.sh                              # Script de instalación automática
├── run-server.sh                           # Script para ejecutar servidor
├── run-client.sh                           # Script para ejecutar cliente
└── ...
```

### Contenido de los Reportes

- **Métricas de Rendimiento**: Tiempo de respuesta, tasa de éxito
- **Gráficos de Carga**: Visualización por hilo y tiempo
- **Desglose de Mensajes**: Request/Response ISO 8583 detallados
- **Estadísticas**: Promedios, mínimos, máximos
- **Análisis por Hilo**: Distribución de carga y rendimiento

### Características del Reporte

- **Agrupamiento por Conexiones:** Los detalles se organizan por conexión permanente para facilitar el análisis
- **Información de Red:** Cada conexión muestra IP origen, puerto origen, IP destino y puerto destino
- **Estadísticas por Conexión:** Cada conexión muestra sus propias métricas (tiempo promedio, tasa de éxito, etc.)
- **Validación de Configuración:** Advertencias cuando el número de hilos no coincide con el número de conexiones
- **Métricas Importantes:**
  - **Tiempo total:** Duración completa de la prueba
  - **Throughput:** Mensajes por segundo
  - **Latencia promedio:** Tiempo promedio de respuesta
  - **Latencia mín/máx:** Valores extremos de latencia
  - **Tasa de éxito:** Porcentaje de mensajes exitosos

## 🔧 Configuración del Servidor

### Variables de Entorno

```bash
# Puerto del servidor (default: 6020)
PORT=6020

# Nivel de logging (debug, info, error)
LOG_LEVEL=debug
```

### Configuración por Defecto

- **Puerto**: 6020
- **Workers**: 16 (uno por CPU core)
- **Max Conexiones**: 200 por worker
- **Backlog**: 128
- **Timeout**: 30 segundos

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests específicos
npm test -- tcp-client.test.ts
```

## 📝 Protocolo ISO 8583

### Mensajes Soportados

- **MTI 0800**: Network Management Request (Echo Test)
- **MTI 0810**: Network Management Response

### Campos Configurados

- **Campo 7**: Transmission Date & Time (MMDDhhmmss)
- **Campo 11**: Systems Trace Audit Number (STAN)
- **Campo 37**: Retrieval Reference Number (RRN)
- **Campo 39**: Response Code (00=Approved, 96=System malfunction)
- **Campo 70**: Network Management Information Code (301=Echo Test)

### Formato de Mensaje

```
Header de longitud (4 bytes ASCII) + Mensaje ISO 8583 (ASCII)
Ejemplo: "0051" + "080002200000080000000626210145435913005132435913301"
```

## 🚀 Despliegue en Producción

### 1. Compilar el Proyecto

```bash
npm run build
```

### 2. Copiar Archivos Necesarios

```bash
# En el servidor de producción
mkdir echotest-prod
cp -r dist/ echotest-prod/
cp package.json echotest-prod/
cp .env echotest-prod/  # si existe
cp install.sh echotest-prod/
```

### 3. Instalar Dependencias de Producción

```bash
cd echotest-prod
npm install --production
```

### 4. Ejecutar

```bash
# Servidor
npm start

# Cliente
npm run client -- --ip <server-ip> --pt <port> --it <iterations> --th <threads>
```

## 📈 Escenarios de Prueba Recomendados

### 1. Prueba de Conectividad Básica

```bash
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 1 --th 1
```

- **Propósito**: Verificar conectividad y respuesta básica
- **Métricas**: Tiempo de respuesta, tasa de éxito

### 2. Prueba de Carga Moderada

```bash
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --dl 50
```

- **Propósito**: Evaluar rendimiento bajo carga controlada
- **Métricas**: TPS, latencia promedio, distribución de carga

### 3. Prueba de Rendimiento

```bash
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 500 --th 10 --dl 0
```

- **Propósito**: Medir capacidad máxima del sistema
- **Métricas**: Throughput máximo, límites de concurrencia

### 4. Prueba de Estrés

```bash
node dist/tcp-client.js --ip 127.0.0.1 --pt 6020 --it 2000 --th 20 --dl 0
```

- **Propósito**: Identificar límites y puntos de falla
- **Métricas**: Comportamiento bajo estrés, errores

## 🔍 Troubleshooting

### Problemas Comunes

1. **Puerto en uso**: Cambiar el puerto en `.env` o usar `--pt`
2. **Permisos**: Verificar permisos de escritura en directorios `log/` y `tmp/`
3. **Dependencias**: Ejecutar `npm install` si faltan módulos
4. **Compilación**: Verificar que `tsconfig.json` esté configurado correctamente
5. **EADDRINUSE**: El puerto ya está en uso, cambiar puerto o detener proceso existente

### Logs de Debug

```bash
# Activar logs detallados
LOG_LEVEL=debug npm start

# Ver logs en tiempo real
tail -f log/server.log
tail -f log/echotest_$(date +%Y-%m-%d).log

# Ver logs del servidor
tail -f log/server.log | grep "Nueva conexión"
tail -f log/server.log | grep "Error"
```

### Interpretación de Resultados

- **TPS > 100**: Excelente rendimiento
- **TPS 50-100**: Buen rendimiento
- **TPS 10-50**: Rendimiento aceptable
- **TPS < 10**: Posibles problemas de red/servidor

## 🛠️ Scripts Disponibles

### NPM Scripts

```bash
npm run build          # Compilar TypeScript
npm start              # Ejecutar servidor (JavaScript)
npm run client         # Ejecutar cliente (JavaScript)
npm run dev:server     # Ejecutar servidor (TypeScript)
npm run dev:client     # Ejecutar cliente (TypeScript)
npm test               # Ejecutar tests
```

### Scripts de Shell (después de install.sh)

```bash
./install.sh           # Instalación automática
./run-server.sh        # Ejecutar servidor
./run-client.sh        # Ejecutar cliente con parámetros
```

## 📄 Licencia

ISC License

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:

- Crear un issue en GitHub
- Revisar la documentación del proyecto
- Verificar los logs de ejecución

---

**EchoTest** - Herramienta profesional para pruebas de carga y rendimiento en sistemas ISO 8583 🚀
