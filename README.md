# EchoTest - Cliente TCP/IP para Pruebas ISO 8583

Este proyecto implementa un cliente TCP/IP avanzado para realizar pruebas de conexión (Echo Test) utilizando el protocolo ISO 8583, comúnmente usado en sistemas de procesamiento de transacciones financieras. Incluye capacidades de carga masiva, medición de rendimiento y generación de reportes detallados.

## 🚀 Características Principales

- **Cliente TCP/IP robusto** para pruebas ISO 8583
- **Ejecución de múltiples iteraciones** con control de carga
- **Medición de tiempos de respuesta** en tiempo real
- **Generación de reportes HTML** con métricas detalladas
- **Configuración flexible** de parámetros de conexión
- **Manejo robusto de errores** y timeouts
- **Servidor de prueba incluido** para desarrollo local

## 📋 Descripción

El proyecto consiste en:

### Cliente TCP/IP (`tcp-client.ts`)

- Establece conexiones TCP/IP con servidores ISO 8583
- Genera y envía mensajes ISO 8583 de prueba (Echo Test)
- Procesa y desglosa las respuestas recibidas
- Ejecuta múltiples iteraciones con control de delays
- Mide tiempos de respuesta y genera estadísticas
- Crea reportes HTML detallados con métricas de rendimiento

### Servidor de Prueba (`tcp-server.ts`)

- Servidor TCP/IP local para pruebas de desarrollo
- Simula respuestas ISO 8583 estándar
- Maneja múltiples conexiones simultáneas
- Logging detallado para debugging

## 🛠️ Tecnologías Utilizadas

- **TypeScript** - Lenguaje principal del proyecto
- **Node.js** - Runtime de JavaScript
- **Net** - Módulo nativo para TCP/IP
- **ISO8583-js** - Biblioteca para manejo de mensajes ISO 8583
- **Jest** - Framework de pruebas unitarias
- **ts-node** - Ejecución directa de TypeScript

## 📦 Estructura del Proyecto

```
echotest/
├── tcp-client.ts              # Cliente TCP/IP principal
├── tcp-server.ts              # Servidor de prueba local
├── tcp-client.test.ts         # Pruebas unitarias
├── iso8583-js.d.ts            # Definiciones de tipos para ISO8583
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
├── jest.config.js             # Configuración de Jest
├── README.md                  # Documentación del proyecto
└── echotest_report_*.html     # Reportes generados automáticamente
```

## ⚙️ Requisitos Previos

- **Node.js** (versión 14.x o superior)
- **npm** o **pnpm** (gestor de paquetes)
- **TypeScript** (instalado globalmente o como dependencia)

## 🔧 Instalación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/lgallardoc/echotest.git
cd echotest
```

2. **Instalar dependencias:**

```bash
npm install
# o
pnpm install
```

3. **Verificar instalación:**

```bash
npm test
```

## 🚀 Uso

### Parámetros del Cliente

El cliente acepta los siguientes parámetros:

| Parámetro | Descripción                  | Valor por defecto | Ejemplo          |
| --------- | ---------------------------- | ----------------- | ---------------- |
| `--ip`    | Dirección IP del servidor    | `10.245.229.25`   | `--ip 127.0.0.1` |
| `--pt`    | Puerto del servidor          | `6020`            | `--pt 8080`      |
| `--it`    | Número de iteraciones        | `1`               | `--it 100`       |
| `--dl`    | Delay entre iteraciones (ms) | `0`               | `--dl 50`        |

### Ejemplos de Ejecución

#### 1. Ejecución Básica (1 iteración)

```bash
ts-node tcp-client.ts
```

#### 2. Conexión a Servidor Local

```bash
ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020
```

#### 3. Prueba de Carga (100 iteraciones con delay)

```bash
ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 100 --dl 50
```

#### 4. Prueba de Rendimiento (500 iteraciones sin delay)

```bash
ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 500 --dl 0
```

#### 5. Prueba de Estabilidad (1000 iteraciones)

```bash
ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 1000 --dl 10
```

### Iniciar Servidor de Prueba

Para pruebas locales, inicia el servidor de prueba:

```bash
ts-node tcp-server.ts
```

El servidor se ejecutará en `127.0.0.1:6020` por defecto.

## 📊 Reportes Generados

El cliente genera automáticamente reportes HTML con:

- **Métricas de rendimiento** (min, max, promedio)
- **Estadísticas de éxito/fallo**
- **Detalles de cada iteración**
- **Gráficos de tiempos de respuesta**
- **Información de configuración**

Los reportes se guardan como: `echotest_report_[IP]_[PUERTO]_[FECHA].html`

## 🔍 Formato del Mensaje ISO 8583

### Mensaje de Request (Echo Test)

```
MTI: 0800 (Network Management Request)
Bitmap: 0220000008000000
Campo 7: Fecha y hora (MMDDhhmmss)
Campo 11: STAN - Número de rastreo del sistema
Campo 37: RRN - Retrieval Reference Number
Campo 70: Código de gestión (301 para Echo Test)
```

### Mensaje de Response

```
MTI: 0810 (Network Management Response)
Bitmap: 022000000a000000
Campo 7: Fecha y hora de respuesta
Campo 11: STAN (mismo que request)
Campo 37: RRN (mismo que request)
Campo 39: Response Code (00 = Approved)
Campo 70: Código de gestión (301)
```

## 🧪 Pruebas

### Ejecutar Pruebas Unitarias

```bash
npm test
```

### Ejecutar Pruebas con Coverage

```bash
npm run test:coverage
```

### Pruebas de Integración

```bash
# Terminal 1: Iniciar servidor
ts-node tcp-server.ts

# Terminal 2: Ejecutar cliente
ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 10
```

## 📈 Métricas de Rendimiento

### Ejemplo de Resultados (500 iteraciones, 0ms delay)

- **Tiempo total**: ~3 segundos
- **Tiempo promedio por iteración**: ~6ms
- **Tasa de éxito**: 100%
- **Conexiones simultáneas**: Maneja bien 500+ conexiones

### Factores de Rendimiento

- **Delay entre iteraciones**: Controla la carga del servidor
- **Número de iteraciones**: Determina la duración total del test
- **Configuración de timeouts**: Afecta la robustez de las conexiones

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión rechazada**

   - Verificar que el servidor esté ejecutándose
   - Confirmar IP y puerto correctos

2. **Timeouts frecuentes**

   - Aumentar el delay entre iteraciones
   - Verificar la capacidad del servidor

3. **Errores de ISO 8583**
   - Verificar la configuración del servidor
   - Revisar logs del servidor

### Logs y Debugging

El cliente incluye logging detallado:

- `[info]` - Información general
- `[debug]` - Detalles técnicos
- `[error]` - Errores y problemas

## 🔧 Configuración Avanzada

### Modificar Timeouts

```typescript
// En tcp-client.ts
const CONNECTION_TIMEOUT = 5000; // 5 segundos
const RESPONSE_TIMEOUT = 5000; // 5 segundos
```

### Personalizar Mensajes ISO 8583

```typescript
// En tcp-client.ts, función createIso8583EchoTestMessage()
const isoMessage = new ISO8583();
isoMessage.setField(0, "0800"); // MTI
isoMessage.setField(7, dateTime); // Campo 7
// ... más campos
```

## 📝 Scripts Disponibles

```json
{
  "scripts": {
    "start": "ts-node tcp-client.ts",
    "server": "ts-node tcp-server.ts",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "build": "tsc",
    "dev": "ts-node-dev tcp-client.ts"
  }
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Mantén el código limpio y bien documentado
- Agrega pruebas para nuevas funcionalidades
- Sigue las convenciones de TypeScript
- Actualiza la documentación según sea necesario

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Repositorio**: https://github.com/lgallardoc/echotest
- **Issues**: https://github.com/lgallardoc/echotest/issues
- **Pull Requests**: https://github.com/lgallardoc/echotest/pulls

## 🙏 Agradecimientos

- Biblioteca `iso8583-js` para el manejo de mensajes ISO 8583
- Comunidad de Node.js y TypeScript
- Contribuidores y usuarios del proyecto

---

**Nota**: Este proyecto está diseñado para pruebas y desarrollo. Para uso en producción, asegúrate de implementar las medidas de seguridad apropiadas.
