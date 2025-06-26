/// <reference path="./iso8583-js.d.ts" />
import * as net from 'net';
import * as dotenv from 'dotenv';
import ISO8583 = require('iso8583-js');

// Cargar variables de entorno
dotenv.config();

// Función para crear un mensaje ISO 8583 de prueba (Echo Test)
export function createIso8583EchoTestMessage(): string {
    // Generar fecha y hora actual en formato MMDDhhmmss
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const dateTime = `${month}${day}${hours}${minutes}${seconds}`;

    // Generar número de rastreo aleatorio de 6 dígitos
    const stan = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    // Generar RRN de 12 dígitos, usando los últimos 6 dígitos del DE-11
    const rrn = `5132${stan}`;

    // Crear instancia de ISO8583
    const iso = new ISO8583();
    
    // Establecer los campos del mensaje
    iso.set(7, dateTime); // Fecha y hora del mensaje (MMDDhhmmss)
    iso.set(11, stan); // Número de rastreo del sistema
    iso.set(37, rrn); // RRN - Número de Referencia
    iso.set(70, '301'); // Código de gestión (Echo Test)
    
    // Generar mensaje ISO 8583
    const isoMessage = iso.wrapMsg('0800'); // MTI 0800 para Network Management Request
    return isoMessage;
}

// Serializar el mensaje ISO 8583 a una cadena con header de longitud
export function serializeIso8583Message(message: string): string {
    const length = message.length.toString().padStart(4, '0');
    return `${length}${message}`;
}

// Deserializar y desglosar el mensaje ISO 8583 recibido considerando header de longitud
export function deserializeIso8583Message(response: string): Record<string, string> {
    // Los primeros 4 caracteres son la longitud
    const body = response.substring(4);
    return {
        MTI: body.substring(0, 4),
        Bitmap: body.substring(4, 20),
        '7': body.substring(20, 30),
        '11': body.substring(30, 36),
        '37': body.substring(36, 48),
        '39': body.substring(48, 50),
        '70': body.substring(50, 53),
    };
}

// Función para generar el log con el formato deseado
function log(message: string, level: 'debug' | 'info' | 'error' = 'debug'): void {
    const logLevel = process.env.LOG_LEVEL || 'debug';
    if (logLevel === 'debug' || (logLevel === 'info' && level !== 'debug') || (logLevel === 'error' && level === 'error')) {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
        const logMsg = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} [${level}] ${message}`;
        if (level === 'error') {
            console.error(logMsg);
        } else {
            console.log(logMsg);
        }
    }
}

// Interfaz para almacenar métricas de respuesta
interface ResponseMetrics {
    iteration: number;
    startTime: number;
    endTime: number;
    responseTime: number;
    success: boolean;
    error?: string;
}

// Función para generar reporte HTML
function generateHtmlReport(metrics: ResponseMetrics[], host: string, port: number, iterations: number, delay: number): string {
    const successfulMetrics = metrics.filter(m => m.success);
    const failedMetrics = metrics.filter(m => !m.success);
    
    const totalTime = successfulMetrics.length > 0 ? 
        successfulMetrics[successfulMetrics.length - 1].endTime - metrics[0].startTime : 0;
    
    const responseTimes = successfulMetrics.map(m => m.responseTime);
    const minTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    const avgTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    
    const successRate = (successfulMetrics.length / metrics.length) * 100;
    
    const now = new Date();
    const timestamp = now.toLocaleString();
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Echo Test - ${host}:${port}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        .stat-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-card .unit {
            font-size: 0.8em;
            color: #666;
            margin-left: 5px;
        }
        .details {
            padding: 30px;
            border-top: 1px solid #e0e0e0;
        }
        .details h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .metrics-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .metrics-table th,
        .metrics-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        .metrics-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        .metrics-table tr:hover {
            background-color: #f8f9fa;
        }
        .success {
            color: #28a745;
        }
        .error {
            color: #dc3545;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .summary h3 {
            margin-top: 0;
            color: #333;
        }
        .summary ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .summary li {
            margin: 5px 0;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte Echo Test</h1>
            <p>Análisis de rendimiento de conexiones TCP ISO 8583</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Iteraciones</h3>
                <div class="value">${iterations}</div>
                <span class="unit">total</span>
            </div>
            <div class="stat-card">
                <h3>Exitosas</h3>
                <div class="value success">${successfulMetrics.length}</div>
                <span class="unit">(${successRate.toFixed(1)}%)</span>
            </div>
            <div class="stat-card">
                <h3>Fallidas</h3>
                <div class="value error">${failedMetrics.length}</div>
                <span class="unit">iteraciones</span>
            </div>
            <div class="stat-card">
                <h3>Tiempo Promedio</h3>
                <div class="value">${avgTime.toFixed(2)}</div>
                <span class="unit">ms</span>
            </div>
            <div class="stat-card">
                <h3>Tiempo Mínimo</h3>
                <div class="value">${minTime.toFixed(2)}</div>
                <span class="unit">ms</span>
            </div>
            <div class="stat-card">
                <h3>Tiempo Máximo</h3>
                <div class="value">${maxTime.toFixed(2)}</div>
                <span class="unit">ms</span>
            </div>
            <div class="stat-card">
                <h3>Tiempo Total</h3>
                <div class="value">${totalTime.toFixed(2)}</div>
                <span class="unit">ms</span>
            </div>
            <div class="stat-card">
                <h3>Pausa Entre Iteraciones</h3>
                <div class="value">${delay}</div>
                <span class="unit">ms</span>
            </div>
        </div>
        
        <div class="details">
            <h2>📋 Detalles de la Ejecución</h2>
            
            <div class="summary">
                <h3>Configuración</h3>
                <ul>
                    <li><strong>Servidor:</strong> ${host}:${port}</li>
                    <li><strong>Iteraciones:</strong> ${iterations}</li>
                    <li><strong>Pausa entre iteraciones:</strong> ${delay}ms</li>
                    <li><strong>Fecha de ejecución:</strong> ${timestamp}</li>
                </ul>
            </div>
            
            <h3>📈 Métricas por Iteración</h3>
            <table class="metrics-table">
                <thead>
                    <tr>
                        <th>Iteración</th>
                        <th>Estado</th>
                        <th>Tiempo de Respuesta</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.map(m => `
                        <tr>
                            <td>${m.iteration}</td>
                            <td class="${m.success ? 'success' : 'error'}">
                                ${m.success ? '✅ Exitoso' : '❌ Fallido'}
                            </td>
                            <td>${m.success ? m.responseTime.toFixed(2) + ' ms' : '-'}</td>
                            <td>${m.error || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
}

// Función para guardar el reporte HTML
function saveHtmlReport(htmlContent: string, host: string, port: number): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `echotest_report_${host.replace(/\./g, '_')}_${port}_${timestamp}.html`;
    
    const fs = require('fs');
    const path = require('path');
    
    try {
        fs.writeFileSync(filename, htmlContent, 'utf8');
        return filename;
    } catch (error) {
        log(`Error guardando reporte HTML: ${error}`, 'error');
        return '';
    }
}

// Configuración del cliente TCP/IP
export function createTcpClient(host: string = '10.245.229.25', port: number = 6020): net.Socket {
    const client = new net.Socket();
    let connectionTimeout: NodeJS.Timeout;
    let responseTimeout: NodeJS.Timeout;

    // Establecer un timeout para la conexión de 5 segundos
    connectionTimeout = setTimeout(() => {
        log('Timeout de conexión: No se pudo conectar al servidor en 5 segundos', 'error');
        client.destroy();
    }, 5000);

    // Conectar al servidor
    client.connect(port, host, () => {
        clearTimeout(connectionTimeout); // Limpiar el timeout de conexión
        log(`Conectado al servidor TCP en ${host}:${port}`, 'info');

        // Crear y serializar el mensaje ISO 8583
        const isoMessage = createIso8583EchoTestMessage();
        log('Elementos del mensaje de request: ' + isoMessage, 'debug');

        const serializedMessage = serializeIso8583Message(isoMessage);
        log('Enviando mensaje ISO 8583: ' + serializedMessage, 'debug');

        // Enviar mensaje
        client.write(serializedMessage);

        // Establecer un timeout para la espera de la respuesta de 5 segundos
        responseTimeout = setTimeout(() => {
            log('Timeout de respuesta: No se recibió respuesta del servidor en 5 segundos', 'error');
            client.destroy();
        }, 5000);
    });

    // Manejar datos recibidos del servidor
    client.on('data', (data) => {
        clearTimeout(responseTimeout); // Limpiar el timeout de respuesta
        const response = data.toString();
        log('Respuesta recibida del servidor: ' + response, 'debug');

        const deserializedResponse = deserializeIso8583Message(response);
        log('Desglose de los elementos del response: ' + JSON.stringify(deserializedResponse), 'debug');

        client.destroy(); // Cerrar conexión después de recibir la respuesta
    });

    // Manejar cierre de conexión
    client.on('close', () => {
        clearTimeout(connectionTimeout);
        clearTimeout(responseTimeout);
        log('Conexión cerrada', 'info');
    });

    // Manejar errores
    client.on('error', (err) => {
        clearTimeout(connectionTimeout);
        clearTimeout(responseTimeout);
        log('Error en la conexión: ' + err.message, 'error');
    });

    // Manejar timeout de respuesta (evento nativo de Node.js)
    client.on('timeout', () => {
        clearTimeout(responseTimeout);
        log('Timeout de respuesta: No se recibió respuesta del servidor en 5 segundos', 'error');
        client.destroy();
    });

    return client;
}

// Si el archivo se ejecuta directamente, crear y conectar el cliente
if (require.main === module) {
    // Función para mostrar ayuda
    function showHelp() {
        console.log('Uso: ts-node tcp-client.ts [opciones]');
        console.log('');
        console.log('Opciones:');
        console.log('  --ip <dirección>     Dirección IP del servidor (default: 10.245.229.25)');
        console.log('  --pt <puerto>        Puerto del servidor (default: 6020)');
        console.log('  --it <iteraciones>   Número de iteraciones (default: 1)');
        console.log('  --dl <milisegundos>  Pausa entre iteraciones en milisegundos (default: 1000)');
        console.log('  --hl                 Mostrar esta ayuda');
        console.log('');
        console.log('Ejemplos:');
        console.log('  ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 5');
        console.log('  ts-node tcp-client.ts --ip 10.245.229.25 --pt 6020 --it 10 --dl 2000');
        console.log('  ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 3 --dl 500');
    }

    // Función para procesar argumentos
    function parseArguments(args: string[]): { host: string; port: number; iterations: number; delay: number } {
        let host = '10.245.229.25';
        let port = 6020;
        let iterations = 1;
        let delay = 1000; // Default: 1000 milisegundos = 1 segundo

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '--ip':
                    if (i + 1 < args.length) {
                        host = args[i + 1];
                        i++; // Saltar el siguiente argumento
                    } else {
                        console.error('Error: --ip requiere una dirección IP');
                        process.exit(1);
                    }
                    break;
                    
                case '--pt':
                    if (i + 1 < args.length) {
                        const portArg = parseInt(args[i + 1], 10);
                        if (isNaN(portArg) || portArg < 1 || portArg > 65535) {
                            console.error('Error: --pt requiere un puerto válido (1-65535)');
                            process.exit(1);
                        }
                        port = portArg;
                        i++; // Saltar el siguiente argumento
                    } else {
                        console.error('Error: --pt requiere un puerto');
                        process.exit(1);
                    }
                    break;
                    
                case '--it':
                    if (i + 1 < args.length) {
                        const iterArg = parseInt(args[i + 1], 10);
                        if (isNaN(iterArg) || iterArg < 1) {
                            console.error('Error: --it requiere un número de iteraciones válido (>= 1)');
                            process.exit(1);
                        }
                        iterations = iterArg;
                        i++; // Saltar el siguiente argumento
                    } else {
                        console.error('Error: --it requiere un número de iteraciones');
                        process.exit(1);
                    }
                    break;
                    
                case '--dl':
                    if (i + 1 < args.length) {
                        const delayArg = parseInt(args[i + 1], 10);
                        if (isNaN(delayArg) || delayArg < 0) {
                            console.error('Error: --dl requiere un tiempo de pausa válido en milisegundos (>= 0)');
                            process.exit(1);
                        }
                        delay = delayArg;
                        i++; // Saltar el siguiente argumento
                    } else {
                        console.error('Error: --dl requiere un tiempo de pausa en milisegundos');
                        process.exit(1);
                    }
                    break;
                    
                case '--hl':
                    showHelp();
                    process.exit(0);
                    break;
                    
                default:
                    if (arg.startsWith('--')) {
                        console.error(`Error: Opción desconocida: ${arg}`);
                        console.error('Usa --hl para ver las opciones disponibles');
                        process.exit(1);
                    }
                    break;
            }
        }

        return { host, port, iterations, delay };
    }

    // Función para ejecutar una iteración
    function runIteration(host: string, port: number, iterationNumber: number, delay: number): Promise<void> {
        return new Promise((resolve, reject) => {
            log(`Ejecutando iteración ${iterationNumber}`, 'info');
            
            const client = createTcpClient(host, port);
            let isResolved = false;
            
            // Función para resolver la promesa de forma segura
            const safeResolve = () => {
                if (!isResolved) {
                    isResolved = true;
                    log(`Iteración ${iterationNumber} completada`, 'info');
                    resolve();
                }
            };
            
            const safeReject = (error: Error) => {
                if (!isResolved) {
                    isResolved = true;
                    log(`Error en iteración ${iterationNumber}: ${error.message}`, 'error');
                    reject(error);
                }
            };
            
            // Manejar el cierre de conexión para resolver la promesa
            client.on('close', () => {
                safeResolve();
            });
            
            client.on('error', (err) => {
                safeReject(err);
            });
            
            // El timeout de 10 segundos ya está manejado en createTcpClient
            // No necesitamos un timeout adicional aquí
        });
    }

    // Función principal para ejecutar múltiples iteraciones
    async function runMultipleIterations(host: string, port: number, iterations: number, delay: number) {
        log(`Iniciando ${iterations} iteración(es) hacia ${host}:${port}`, 'info');
        
        const metrics: ResponseMetrics[] = [];
        let isRunning = true;
        
        // Función para limpiar recursos
        const cleanup = () => {
            isRunning = false;
        };
        
        // Manejar señales de terminación
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        
        try {
            for (let i = 1; i <= iterations && isRunning; i++) {
                const startTime = Date.now();
                try {
                    await runIteration(host, port, i, delay);
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    metrics.push({
                        iteration: i,
                        startTime,
                        endTime,
                        responseTime,
                        success: true,
                    });
                    
                    // Pausa entre iteraciones (excepto la última)
                    if (i < iterations && isRunning) {
                        log(`Esperando ${delay} milisegundos antes de la siguiente iteración...`, 'debug');
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                } catch (error) {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    metrics.push({
                        iteration: i,
                        startTime,
                        endTime,
                        responseTime,
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    log(`Error en iteración ${i}: ${error}`, 'error');
                    // Continuar con la siguiente iteración
                }
            }
            
            log(`Todas las ${iterations} iteración(es) completadas`, 'info');
            
            const htmlReport = generateHtmlReport(metrics, host, port, iterations, delay);
            const reportFilename = saveHtmlReport(htmlReport, host, port);
            
            if (reportFilename) {
                log(`Reporte HTML guardado en: ${reportFilename}`, 'info');
                // Abrir el reporte en el navegador
                setTimeout(() => {
                    try {
                        require('child_process').exec(`open "${reportFilename}"`);
                    } catch (error) {
                        log('No se pudo abrir el reporte automáticamente', 'debug');
                    }
                }, 1000);
            } else {
                log('No se pudo guardar el reporte HTML', 'error');
            }
        } finally {
            // Limpiar listeners
            process.removeAllListeners('SIGINT');
            process.removeAllListeners('SIGTERM');
        }
    }

    // Procesar argumentos
    const { host, port, iterations, delay } = parseArguments(process.argv.slice(2));
    
    // Ejecutar iteraciones
    runMultipleIterations(host, port, iterations, delay).catch(error => {
        log(`Error general: ${error}`, 'error');
        process.exit(1);
    });
}