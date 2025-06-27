# EchoTest - Ejemplos de Uso

Este documento contiene ejemplos prácticos de cómo usar EchoTest para diferentes escenarios de prueba.

## 🚀 Inicio Rápido

### 1. Instalación y Configuración

```bash
# Clonar el repositorio
git clone <repository-url>
cd echotest

# Instalación automática
chmod +x install.sh
./install.sh

# O instalación manual
npm install
npm run build
```

### 2. Ejecutar Servidor

```bash
# Opción 1: Script de shell
./run-server.sh

# Opción 2: NPM script
npm start

# Opción 3: Directo
node dist/tcp-server.js
```

### 3. Ejecutar Cliente

```bash
# Prueba básica
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 10 --th 2

# O con NPM
npm run client -- --ip 127.0.0.1 --pt 6020 --it 10 --th 2
```

## 📊 Escenarios de Prueba

### Escenario 1: Prueba de Conectividad Básica

**Propósito**: Verificar que el cliente y servidor se comunican correctamente.

```bash
# Servidor
./run-server.sh

# Cliente (en otra terminal)
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 1 --th 1
```

**Resultado Esperado**:

- ✅ 1 iteración exitosa
- ✅ Tiempo de respuesta < 100ms
- ✅ Reporte HTML generado en `tmp/`

### Escenario 2: Prueba de Carga Moderada

**Propósito**: Evaluar rendimiento bajo carga controlada.

```bash
# Servidor
./run-server.sh

# Cliente
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --dl 50
```

**Resultado Esperado**:

- ✅ 100 iteraciones exitosas
- ✅ 5 hilos trabajando en paralelo
- ✅ 50ms delay entre iteraciones
- ✅ TPS > 10 transacciones por segundo

### Escenario 3: Prueba de Rendimiento

**Propósito**: Medir capacidad máxima del sistema.

```bash
# Servidor
./run-server.sh

# Cliente
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 500 --th 10 --dl 0
```

**Resultado Esperado**:

- ✅ 500 iteraciones exitosas
- ✅ 10 hilos trabajando en paralelo
- ✅ Sin delay entre iteraciones
- ✅ TPS > 50 transacciones por segundo

### Escenario 4: Prueba de Estrés

**Propósito**: Identificar límites y puntos de falla.

```bash
# Servidor
./run-server.sh

# Cliente
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 2000 --th 20 --dl 0
```

**Resultado Esperado**:

- ⚠️ Posibles timeouts o errores
- 📊 Métricas de límites de capacidad
- 🔍 Identificación de cuellos de botella

### Escenario 5: Prueba con Servidor Remoto

**Propósito**: Probar conectividad con servidor externo.

```bash
# Cliente (sin servidor local)
./run-client.sh --ip 192.168.1.100 --pt 8080 --it 50 --th 3 --dl 100
```

**Consideraciones**:

- 🔒 Verificar firewall y conectividad de red
- ⏱️ Ajustar timeouts si es necesario
- 📡 Monitorear latencia de red

## 🔧 Configuraciones Avanzadas

### Configuración de Variables de Entorno

```bash
# Crear archivo de configuración
cp env.example .env

# Editar configuración
nano .env
```

**Contenido del archivo `.env`**:

```env
# Configuración del Servidor
PORT=6020
LOG_LEVEL=debug

# Configuración del Cliente
CLIENT_IP=127.0.0.1
CLIENT_PORT=6020
CLIENT_ITERATIONS=100
CLIENT_THREADS=5
CLIENT_DELAY=50
```

### Configuración de Logging

```bash
# Logs detallados
LOG_LEVEL=debug ./run-server.sh

# Solo errores
LOG_LEVEL=error ./run-server.sh

# Ver logs en tiempo real
tail -f log/server.log
tail -f log/echotest_$(date +%Y-%m-%d).log
```

### Configuración de Puertos

```bash
# Servidor en puerto personalizado
PORT=8080 ./run-server.sh

# Cliente conectando a puerto personalizado
./run-client.sh --ip 127.0.0.1 --pt 8080 --it 10 --th 2
```

## 📈 Interpretación de Resultados

### Métricas Clave

1. **TPS (Transactions Per Second)**:

   - Excelente: > 100 TPS
   - Bueno: 50-100 TPS
   - Aceptable: 10-50 TPS
   - Problema: < 10 TPS

2. **Tiempo de Respuesta**:

   - Excelente: < 50ms
   - Bueno: 50-100ms
   - Aceptable: 100-500ms
   - Problema: > 500ms

3. **Tasa de Éxito**:
   - Excelente: 100%
   - Bueno: 95-99%
   - Aceptable: 90-95%
   - Problema: < 90%

### Análisis del Reporte HTML

1. **Resumen General**:

   - Total de iteraciones
   - Tasa de éxito
   - Tiempo total de ejecución

2. **Métricas por Hilo**:

   - Distribución de carga
   - Rendimiento individual
   - Identificación de cuellos de botella

3. **Gráfico de Carga**:

   - Visualización temporal
   - Picos de actividad
   - Patrones de comportamiento

4. **Desglose de Mensajes**:
   - Request/Response detallados
   - Campos ISO 8583
   - Validación de protocolo

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Puerto en Uso

```bash
# Error: EADDRINUSE
# Solución: Cambiar puerto
PORT=8080 ./run-server.sh
./run-client.sh --ip 127.0.0.1 --pt 8080 --it 10 --th 2
```

#### 2. Timeout de Conexión

```bash
# Error: ETIMEDOUT
# Solución: Verificar conectividad
ping 127.0.0.1
telnet 127.0.0.1 6020
```

#### 3. Permisos de Archivo

```bash
# Error: EACCES
# Solución: Verificar permisos
chmod +x install.sh run-server.sh run-client.sh
mkdir -p tmp log
chmod 755 tmp log
```

#### 4. Dependencias Faltantes

```bash
# Error: Cannot find module
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Logs de Debug

```bash
# Activar logs detallados
LOG_LEVEL=debug ./run-server.sh

# Filtrar logs específicos
tail -f log/server.log | grep "Nueva conexión"
tail -f log/server.log | grep "Error"
tail -f log/echotest_$(date +%Y-%m-%d).log | grep "Iteración"
```

## 🔄 Automatización

### Script de Prueba Automática

```bash
#!/bin/bash
# test-suite.sh

echo "🚀 Ejecutando Suite de Pruebas EchoTest"
echo "======================================="

# Iniciar servidor en background
./run-server.sh &
SERVER_PID=$!

# Esperar que el servidor esté listo
sleep 3

# Ejecutar pruebas
echo "📊 Prueba 1: Conectividad Básica"
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 5 --th 1

echo "📊 Prueba 2: Carga Moderada"
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 50 --th 3 --dl 50

echo "📊 Prueba 3: Rendimiento"
./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --dl 0

# Detener servidor
kill $SERVER_PID

echo "✅ Suite de pruebas completada"
echo "📊 Reportes disponibles en: tmp/"
```

### Integración con CI/CD

```yaml
# .github/workflows/test.yml
name: EchoTest CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "16"

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Run tests
        run: |
          npm start &
          sleep 3
          npm run client -- --ip 127.0.0.1 --pt 6020 --it 10 --th 2
```

## 📚 Recursos Adicionales

- [README.md](./README.md) - Documentación principal
- [Protocolo ISO 8583](https://en.wikipedia.org/wiki/ISO_8583) - Estándar de mensajería
- [Node.js Cluster](https://nodejs.org/api/cluster.html) - Documentación oficial
- [Winston Logging](https://github.com/winstonjs/winston) - Framework de logging

---

**EchoTest** - Herramienta profesional para pruebas de carga y rendimiento en sistemas ISO 8583 🚀
