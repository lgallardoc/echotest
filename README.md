# 🚀 EchoTest - Cliente TCP/IP para Pruebas ISO 8583

**EchoTest** es una herramienta profesional para pruebas de carga y rendimiento en sistemas ISO 8583, diseñada para evaluar la capacidad y latencia de servidores de procesamiento de transacciones financieras.

## ✨ Características Principales

- **🔗 Conexiones Permanentes:** Pool de conexiones TCP persistentes para mejor rendimiento
- **📊 Reportes Detallados:** Reportes HTML con métricas completas y gráficos interactivos
- **🌐 Información de Red:** Detalles de IP origen, puerto origen, IP destino y puerto destino
- **⚡ Multi-threading:** Ejecución paralela con múltiples hilos
- **📈 Métricas Avanzadas:** Tiempo de respuesta, throughput, latencia y tasa de éxito
- **🔍 Agrupamiento por Conexiones:** Análisis detallado por conexión permanente
- **⚠️ Validaciones Inteligentes:** Advertencias y recomendaciones de configuración
- **📝 Logging Completo:** Logs detallados con diferentes niveles de verbosidad

## 🏗️ Arquitectura

### Componentes Principales

- **Cliente TCP Multi-hilo:** Ejecuta pruebas en paralelo
- **Pool de Conexiones:** Gestiona conexiones permanentes al servidor
- **Generador de Mensajes ISO 8583:** Crea mensajes de prueba estándar
- **Sistema de Reportes:** Genera reportes HTML con métricas y gráficos
- **Sistema de Logging:** Registra eventos y métricas en archivos

### Flujo de Trabajo

1. **Inicialización:** Establece conexiones permanentes con el servidor
2. **Distribución:** Divide las iteraciones entre hilos
3. **Ejecución:** Envía mensajes ISO 8583 por las conexiones disponibles
4. **Métricas:** Recopila tiempos de respuesta y estadísticas
5. **Reporte:** Genera reporte HTML con análisis detallado

## 🚀 Instalación

### Prerrequisitos

- Node.js 16+
- npm o pnpm
- Servidor TCP/IP para pruebas

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

### Scripts de Instalación

```bash
# Instalación automática
./install.sh
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
- `--help`: Mostrar ayuda

### Servidor

- `--pt <puerto>`: Puerto del servidor (default: 6020)
- `--th <hilos>`: Número de hilos del servidor (default: 4)
- `--help`: Mostrar ayuda

## 📊 Características del Reporte

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
- **Encoding:** ASCII

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

- **Reporte HTML:** `tmp/echotest-report-YYYY-MM-DD-HH-MM-SS.html`
- **Logs:** `log/echotest-YYYY-MM-DD-HH-MM-SS.log`

## 🛠️ Desarrollo

### Estructura del Proyecto

```
echotest/
├── src/
│   ├── tcp-client.ts      # Cliente principal
│   ├── tcp-server.ts      # Servidor de pruebas
│   └── iso8583-js.d.ts    # Definiciones TypeScript
├── dist/                  # Código compilado
├── tmp/                   # Reportes HTML
├── log/                   # Archivos de log
├── scripts/
│   ├── run-client.sh      # Script del cliente
│   └── run-server.sh      # Script del servidor
└── docs/
    ├── README.md          # Documentación principal
    └── EXAMPLES.md        # Ejemplos detallados
```

### Comandos de Desarrollo

```bash
# Compilar TypeScript
npm run build

# Ejecutar tests
npm test

# Limpiar archivos generados
npm run clean

# Ejecutar con ts-node (desarrollo)
npx ts-node tcp-client.ts
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

## 📝 Changelog

### v1.1.0 - Conexiones Permanentes

- ✅ Agregar parámetro `--cn` para conexiones permanentes
- ✅ Implementar pool de conexiones persistentes
- ✅ Agregar información de red en reportes
- ✅ Agrupar detalles por conexión
- ✅ Validaciones de configuración
- ✅ Mejorar documentación

### v1.0.0 - Versión Inicial

- ✅ Cliente TCP multi-hilo
- ✅ Servidor TCP multi-hilo
- ✅ Generación de mensajes ISO 8583
- ✅ Reportes HTML con gráficos
- ✅ Sistema de logging

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Luis Gallardo** - [lgallardoc](https://github.com/lgallardoc)

## 🙏 Agradecimientos

- **iso8583-js:** Librería para manejo de mensajes ISO 8583
- **Node.js:** Plataforma de ejecución
- **TypeScript:** Lenguaje de programación

---

⭐ **Si este proyecto te es útil, por favor dale una estrella en GitHub!**
