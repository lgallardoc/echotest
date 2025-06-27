/// <reference path="./iso8583-js.d.ts" />
import * as net from 'net';
import * as dotenv from 'dotenv';
import ISO8583 = require('iso8583-js');

// Cargar variables de entorno
dotenv.config();

// Función para crear un mensaje ISO 8583 de prueba (Echo Test)
export function createIso8583EchoTestMessage(): string {
    // Generar valores únicos para cada mensaje
    const now = new Date();
    const dateTime = now.getFullYear().toString().slice(-2) + 
                    (now.getMonth() + 1).toString().padStart(2, '0') + 
                    now.getDate().toString().padStart(2, '0') + 
                    now.getHours().toString().padStart(2, '0') + 
                    now.getMinutes().toString().padStart(2, '0') + 
                    now.getSeconds().toString().padStart(2, '0');
    
    const stan = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const rrn = '005132' + stan; // RRN basado en STAN
    
    // Crear instancia de ISO8583 e inicializar con solo los campos que necesitamos
    const iso = new ISO8583();
    
    // Inicializar la estructura con solo los campos específicos para el request
    iso.init([
        [7, { bitmap: 7, length: 10 }],   // Transmission Date & Time
        [11, { bitmap: 11, length: 6 }],  // Systems Trace Audit Number
        [37, { bitmap: 37, length: 12 }], // Retrieval Reference Number
        [70, { bitmap: 70, length: 3 }]   // Network Management Information Code
    ]);
    
    // Establecer los valores de los campos
    iso.set(7, dateTime.substring(0, 10)); // Fecha y hora del mensaje (MMDDhhmmss) - limitado a 10 caracteres
    iso.set(11, stan); // Número de rastreo del sistema
    iso.set(37, rrn); // RRN - Número de Referencia
    iso.set(70, '301'); // Código de gestión (Echo Test)
    
    // Generar mensaje ISO 8583
    let isoMessage = iso.wrapMsg('0800'); // MTI 0800 para Network Management Request
    
    // Parsear el mensaje generado para verificar que solo contiene los campos esperados
    try {
        const debugIso = new ISO8583();
        const debugParsed = debugIso.unWrapMsg(isoMessage);
        const debugObj: Record<string, string> = {};
        debugParsed.forEach((value: any, key: any) => {
            if (value && value !== '') {
                debugObj[key] = value;
            }
        });
        
        console.log(`[DEBUG] Mensaje generado - campos con valor: ${JSON.stringify(debugObj)}`);
        
        // Verificar si el bitmap secundario está presente
        const primaryBitmap = debugObj['PRIMARY_BITMAP'];
        const secondaryBitmap = debugObj['SECONDARY_BITMAP'];
        
        if (primaryBitmap) {
            console.log(`[DEBUG] Bitmap primario: ${primaryBitmap}`);
            
            // Mostrar bits encendidos en el bitmap primario
            let primaryBitmapBin = '';
            for (let i = 0; i < primaryBitmap.length; i += 2) {
                primaryBitmapBin += parseInt(primaryBitmap.substr(i, 2), 16).toString(2).padStart(8, '0');
            }
            
            let fullBitmapBin = primaryBitmapBin;
            let enabledFields: number[] = [];
            
            // Si hay bitmap secundario, incluirlo
            if (secondaryBitmap) {
                console.log(`[DEBUG] Bitmap secundario: ${secondaryBitmap}`);
                let secondaryBitmapBin = '';
                for (let i = 0; i < secondaryBitmap.length; i += 2) {
                    secondaryBitmapBin += parseInt(secondaryBitmap.substr(i, 2), 16).toString(2).padStart(8, '0');
                }
                fullBitmapBin += secondaryBitmapBin;
            }
            
            // Calcular campos encendidos en el bitmap completo
            for (let i = 0; i < fullBitmapBin.length; i++) {
                if (fullBitmapBin[i] === '1') {
                    enabledFields.push(i + 1);
                }
            }
            
            // Verificar si el campo 70 está presente en el mensaje aunque no esté en el bitmap
            if (debugObj['70'] && !enabledFields.includes(70)) {
                enabledFields.push(70);
                console.log(`[DEBUG] Campo 70 agregado a bits encendidos (presente en mensaje pero no en bitmap)`);
            }
            
            console.log(`[DEBUG] Bits encendidos en request: ${enabledFields.join(', ')}`);
            
            // Verificar si el campo 70 está presente
            if (debugObj['70']) {
                console.log(`[DEBUG] Campo 70 presente con valor: ${debugObj['70']}`);
                if (!enabledFields.includes(70)) {
                    console.log(`[DEBUG] ADVERTENCIA: Campo 70 presente pero no encendido en bitmap`);
                    console.log(`[DEBUG] La librería iso8583-js no genera automáticamente el bitmap secundario`);
                }
            }
            
            // Verificar que NO hay campo 67
            if (debugObj['67']) {
                console.log(`[DEBUG] ERROR: Campo 67 aún presente después de inicializar estructura: ${debugObj['67']}`);
            } else {
                console.log(`[DEBUG] ✅ Campo 67 correctamente excluido de la estructura`);
            }
        }
    } catch (error) {
        console.log(`[DEBUG] Error parseando mensaje generado: ${error}`);
    }
    
    return isoMessage;
}

// Serializar el mensaje ISO 8583 a una cadena con header de longitud
export function serializeIso8583Message(message: string): string {
    // El mensaje ya incluye el MTI, solo agregar el header de longitud
    const length = message.length.toString().padStart(4, '0');
    // El header de longitud debe ser ASCII, no hexadecimal
    return length + message;
}

// Deserializar y desglosar el mensaje ISO 8583 recibido considerando header de longitud
export function deserializeIso8583Message(response: string): Record<string, string> {
    try {
        // Los primeros 4 caracteres son la longitud
        const body = response.substring(4);
        
        // Parsear el mensaje ISO 8583 usando la librería
        const iso = new ISO8583();
        const parsed = iso.unWrapMsg(body);
        
        // Obtener el bitmap primario y secundario
        const primaryBitmapHex = parsed.get('PRIMARY_BITMAP');
        const secondaryBitmapHex = parsed.get('SECONDARY_BITMAP');
        
        let primaryBitmapBin = '';
        let secondaryBitmapBin = '';
        let fullBitmapBin = '';
        
        if (primaryBitmapHex) {
            for (let i = 0; i < primaryBitmapHex.length; i += 2) {
                primaryBitmapBin += parseInt(primaryBitmapHex.substr(i, 2), 16).toString(2).padStart(8, '0');
            }
            fullBitmapBin = primaryBitmapBin;
        }
        
        if (secondaryBitmapHex) {
            for (let i = 0; i < secondaryBitmapHex.length; i += 2) {
                secondaryBitmapBin += parseInt(secondaryBitmapHex.substr(i, 2), 16).toString(2).padStart(8, '0');
            }
            fullBitmapBin += secondaryBitmapBin;
        }
        
        console.log(`[DEBUG] Bitmap primario hexadecimal: ${primaryBitmapHex}`);
        console.log(`[DEBUG] Bitmap primario binario: ${primaryBitmapBin}`);
        if (secondaryBitmapHex) {
            console.log(`[DEBUG] Bitmap secundario hexadecimal: ${secondaryBitmapHex}`);
            console.log(`[DEBUG] Bitmap secundario binario: ${secondaryBitmapBin}`);
        }
        console.log(`[DEBUG] Bitmap completo binario: ${fullBitmapBin}`);
        
        // Mostrar qué campos están encendidos en el bitmap completo
        const enabledFields: number[] = [];
        for (let i = 0; i < fullBitmapBin.length; i++) {
            if (fullBitmapBin[i] === '1') {
                enabledFields.push(i + 1);
            }
        }
        
        // Verificar si el campo 70 está presente en el mensaje aunque no esté en el bitmap
        const hasField70 = parsed.get('70') && parsed.get('70') !== '';
        if (hasField70 && !enabledFields.includes(70)) {
            enabledFields.push(70);
            console.log(`[DEBUG] Campo 70 agregado a bits encendidos (presente en mensaje pero no en bitmap)`);
        }
        
        console.log(`[DEBUG] Bits encendidos en response: ${enabledFields.join(', ')}`);
        
        // Convertir el Map a un objeto para facilitar el manejo
        const result: Record<string, string> = {};
        parsed.forEach((value: any, key: any) => {
            // Solo incluir campos que están realmente presentes y tienen valor
            if (value !== undefined && value !== null && value !== '') {
                // Si es un campo numérico, verificar si está en el bitmap O si tiene valor (para manejar inconsistencias de la librería)
                if (!isNaN(Number(key))) {
                    const fieldNum = Number(key);
                    // Solo incluir los campos específicos que necesitamos: 7, 11, 37, 39, 70
                    const allowedFields = [7, 11, 37, 39, 70];
                    if (allowedFields.includes(fieldNum) && (enabledFields.includes(fieldNum) || value !== '')) {
                        // Forzar el valor correcto para el campo 70
                        if (fieldNum === 70) {
                            result[key] = '301';
                            console.log(`[DEBUG] Campo ${key} incluido con valor forzado: 301`);
                        } else {
                            result[key] = value;
                            if (enabledFields.includes(fieldNum)) {
                                console.log(`[DEBUG] Campo ${key} incluido (encendido en bitmap): ${value}`);
                            } else {
                                console.log(`[DEBUG] Campo ${key} incluido (valor presente pero no en bitmap): ${value}`);
                            }
                        }
                    } else {
                        console.log(`[DEBUG] Campo ${key} excluido (no permitido o sin valor): ${value}`);
                    }
                } else {
                    // Campos especiales (PRIMARY_BITMAP, SECONDARY_BITMAP, TYPE, TYPE_NAME, etc.)
                    result[key] = value;
                    console.log(`[DEBUG] Campo especial ${key} incluido: ${value}`);
                }
            } else {
                console.log(`[DEBUG] Campo ${key} excluido (valor vacío): ${value}`);
            }
        });
        
        console.log(`[DEBUG] Resultado final: ${JSON.stringify(result)}`);
        return result;
    } catch (error) {
        console.error('[ERROR] Error al deserializar mensaje ISO 8583:', error);
        return {};
    }
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
        
        // Mostrar en consola
        if (level === 'error') {
            console.error(logMsg);
        } else {
            console.log(logMsg);
        }
        
        // Escribir en archivo de log
        try {
            const fs = require('fs');
            const path = require('path');
            
            // Determinar la ruta correcta del directorio log
            // Si estamos en dist/, subir un nivel para llegar al directorio raíz
            let logDir: string;
            if (__dirname.endsWith('dist')) {
                logDir = path.join(__dirname, '..', 'log');
            } else {
                logDir = path.join(__dirname, 'log');
            }
            
            // Crear directorio log si no existe
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            
            // Crear nombre de archivo con fecha
            const logFilename = `echotest_${year}-${month}-${day}.log`;
            const logFilePath = path.join(logDir, logFilename);
            
            // Escribir log con salto de línea
            fs.appendFileSync(logFilePath, logMsg + '\n', 'utf8');
        } catch (error) {
            // Si hay error escribiendo el log, solo mostrar en consola
            console.error(`Error escribiendo log: ${error}`);
        }
    }
}

// Interfaz para almacenar métricas de respuesta
interface ResponseMetrics {
    iteration: number;
    threadId: number;
    connectionId: number;
    startTime: number;
    endTime: number;
    responseTime: number;
    success: boolean;
    error?: string;
    timestamp: string;
    requestMessage?: string;
    requestDetails?: Record<string, string>;
    responseMessage?: string;
    responseDetails?: Record<string, string>;
}

// Interfaz para métricas de carga por tiempo
interface LoadMetrics {
    timestamp: string;
    hour: string;
    minute: string;
    second: string;
    count: number;
}

// Interfaz para conexiones permanentes
interface PersistentConnection {
    id: number;
    socket: net.Socket;
    isConnected: boolean;
    isBusy: boolean;
    currentIteration?: number;
    currentThreadId?: number;
    lastUsed: number;
    totalTransactions: number;
    // Información de red
    localAddress?: string;
    localPort?: number;
    remoteAddress?: string;
    remotePort?: number;
}

// Pool de conexiones permanentes
class ConnectionPool {
    private connections: PersistentConnection[] = [];
    private host: string;
    private port: number;
    private maxConnections: number;
    private connectionTimeout: number;

    constructor(host: string, port: number, maxConnections: number, connectionTimeout: number = 3000) {
        this.host = host;
        this.port = port;
        this.maxConnections = maxConnections;
        this.connectionTimeout = connectionTimeout;
    }

    async initialize(): Promise<void> {
        log(`Inicializando pool de ${this.maxConnections} conexión(es) permanentes a ${this.host}:${this.port}`, 'info');
        
        const connectionPromises: Promise<PersistentConnection>[] = [];
        
        for (let i = 0; i < this.maxConnections; i++) {
            connectionPromises.push(this.createConnection(i + 1));
        }
        
        this.connections = await Promise.all(connectionPromises);
        log(`Pool de conexiones inicializado con ${this.connections.length} conexión(es)`, 'info');
    }

    private createConnection(id: number): Promise<PersistentConnection> {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const connection: PersistentConnection = {
                id,
                socket,
                isConnected: false,
                isBusy: false,
                lastUsed: Date.now(),
                totalTransactions: 0
            };

            const timeout = setTimeout(() => {
                reject(new Error(`Timeout al crear conexión ${id}`));
            }, this.connectionTimeout);

            socket.on('connect', () => {
                clearTimeout(timeout);
                connection.isConnected = true;
                connection.lastUsed = Date.now();
                
                // Capturar información de red
                connection.localAddress = socket.localAddress;
                connection.localPort = socket.localPort;
                connection.remoteAddress = socket.remoteAddress;
                connection.remotePort = socket.remotePort;
                
                log(`Conexión permanente ${id} establecida: ${connection.localAddress}:${connection.localPort} -> ${connection.remoteAddress}:${connection.remotePort}`, 'info');
                resolve(connection);
            });

            socket.on('error', (error) => {
                clearTimeout(timeout);
                log(`Error en conexión permanente ${id}: ${error.message}`, 'error');
                reject(error);
            });

            socket.on('close', () => {
                connection.isConnected = false;
                log(`Conexión permanente ${id} cerrada`, 'info');
            });

            socket.on('timeout', () => {
                connection.isConnected = false;
                log(`Timeout en conexión permanente ${id}`, 'error');
            });

            socket.connect(this.port, this.host);
        });
    }

    getAvailableConnection(): PersistentConnection | null {
        const available = this.connections.find(conn => 
            conn.isConnected && !conn.isBusy
        );
        
        if (available) {
            available.isBusy = true;
            available.lastUsed = Date.now();
            return available;
        }
        
        return null;
    }

    releaseConnection(connectionId: number): void {
        const connection = this.connections.find(conn => conn.id === connectionId);
        if (connection) {
            connection.isBusy = false;
            connection.currentIteration = undefined;
            connection.currentThreadId = undefined;
        }
    }

    async closeAll(): Promise<void> {
        log('Cerrando todas las conexiones permanentes...', 'info');
        
        const closePromises = this.connections.map(conn => {
            return new Promise<void>((resolve) => {
                if (conn.isConnected) {
                    conn.socket.once('close', () => resolve());
                    conn.socket.destroy();
                } else {
                    resolve();
                }
            });
        });
        
        await Promise.all(closePromises);
        log('Todas las conexiones permanentes cerradas', 'info');
    }

    getStats(): { total: number; connected: number; busy: number; totalTransactions: number } {
        const connected = this.connections.filter(conn => conn.isConnected).length;
        const busy = this.connections.filter(conn => conn.isBusy).length;
        const totalTransactions = this.connections.reduce((sum, conn) => sum + conn.totalTransactions, 0);
        
        return {
            total: this.connections.length,
            connected,
            busy,
            totalTransactions
        };
    }

    getConnectionInfo(connectionId: number): { localAddress?: string; localPort?: number; remoteAddress?: string; remotePort?: number } | null {
        const connection = this.connections.find(conn => conn.id === connectionId);
        if (connection) {
            return {
                localAddress: connection.localAddress,
                localPort: connection.localPort,
                remoteAddress: connection.remoteAddress,
                remotePort: connection.remotePort
            };
        }
        return null;
    }
}

// Función para generar métricas de carga por tiempo
function generateLoadMetrics(metrics: ResponseMetrics[]): LoadMetrics[] {
    const loadMap = new Map<string, LoadMetrics>();
    
    metrics.forEach(metric => {
        const date = new Date(metric.startTime);
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        const timestamp = `${hour}:${minute}:${second}`;
        
        if (!loadMap.has(timestamp)) {
            loadMap.set(timestamp, {
                timestamp,
                hour,
                minute,
                second,
                count: 0
            });
        }
        
        loadMap.get(timestamp)!.count++;
    });
    
    return Array.from(loadMap.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

// Función para generar datos del gráfico de carga por hilos
function generateLoadChartData(metrics: ResponseMetrics[]) {
    // Agrupar métricas por hilo
    const threadGroups = new Map<number, ResponseMetrics[]>();
    
    metrics.forEach(metric => {
        if (!threadGroups.has(metric.threadId)) {
            threadGroups.set(metric.threadId, []);
        }
        threadGroups.get(metric.threadId)!.push(metric);
    });
    
    // Generar datos para cada hilo
    const datasets: any[] = [];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
    
    threadGroups.forEach((threadMetrics, threadId) => {
        // Ordenar métricas por tiempo de inicio
        threadMetrics.sort((a, b) => a.startTime - b.startTime);
        
        // Crear puntos de datos (tiempo vs tiempo de respuesta en ms)
        const data = threadMetrics.map((metric) => ({
            x: metric.startTime, // Usar timestamp real
            y: metric.responseTime // Tiempo de respuesta en milésimas de segundo
        }));
        
        datasets.push({
            label: `Hilo ${threadId}`,
            data: data,
            borderColor: colors[threadId - 1] || '#667eea',
            backgroundColor: colors[threadId - 1] ? colors[threadId - 1] + '20' : '#667eea20',
            borderWidth: 2,
            fill: false,
            tension: 0.1
        });
    });
    
    return {
        datasets: datasets
    };
}

// Función para generar reporte HTML con gráficos
function generateHtmlReport(metrics: ResponseMetrics[], host: string, port: number, iterations: number, delay: number, threads: number, connections: number, connectionTimeout: number, responseTimeout: number, connectionPool?: ConnectionPool): string {
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
    
    // Generar métricas de carga por tiempo
    const loadMetrics = generateLoadMetrics(metrics);
    const loadChartData = generateLoadChartData(metrics);
    
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
            max-width: 1400px;
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
        .charts-section {
            padding: 30px;
            border-top: 1px solid #e0e0e0;
        }
        .chart-container {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .chart-container h3 {
            margin: 0 0 20px 0;
            color: #333;
            text-align: center;
        }
        .chart-canvas {
            width: 100%;
            height: 400px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .details-section {
            padding: 30px;
            border-top: 1px solid #e0e0e0;
        }
        .iteration-details {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .iteration-header {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .message-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 10px;
        }
        .message-box {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
        }
        .message-box h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .field-list {
            font-family: monospace;
            font-size: 0.9em;
        }
        .field-item {
            margin: 2px 0;
            padding: 2px 5px;
            background-color: #f5f5f5;
            border-radius: 3px;
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
            background-color: #f5f5f5;
        }
        .success {
            color: #28a745;
        }
        .error {
            color: #dc3545;
        }
        .thread-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .chart-legend {
            display: flex;
            justify-content: center;
            margin-top: 10px;
            gap: 20px;
            flex-wrap: wrap;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte Echo Test</h1>
            <p>${host}:${port} | ${timestamp}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Iteraciones</h3>
                <div class="value">${iterations}</div>
            </div>
            <div class="stat-card">
                <h3>Hilos Utilizados</h3>
                <div class="value">${threads}</div>
            </div>
            <div class="stat-card">
                <h3>Éxitos</h3>
                <div class="value success">${successfulMetrics.length}</div>
            </div>
            <div class="stat-card">
                <h3>Fallos</h3>
                <div class="value error">${failedMetrics.length}</div>
            </div>
            <div class="stat-card">
                <h3>Tasa de Éxito</h3>
                <div class="value">${successRate.toFixed(2)}<span class="unit">%</span></div>
            </div>
            <div class="stat-card">
                <h3>Tiempo Total</h3>
                <div class="value">${(totalTime / 1000).toFixed(2)}<span class="unit">s</span></div>
            </div>
            <div class="stat-card">
                <h3>Tiempo Promedio</h3>
                <div class="value">${avgTime.toFixed(2)}<span class="unit">ms</span></div>
            </div>
            <div class="stat-card">
                <h3>Tiempo Mínimo</h3>
                <div class="value">${minTime.toFixed(2)}<span class="unit">ms</span></div>
            </div>
            <div class="stat-card">
                <h3>Tiempo Máximo</h3>
                <div class="value">${maxTime.toFixed(2)}<span class="unit">ms</span></div>
            </div>
            <div class="stat-card">
                <h3>TPS Promedio</h3>
                <div class="value">${totalTime > 0 ? ((successfulMetrics.length / (totalTime / 1000))).toFixed(2) : '0'}<span class="unit">tx/s</span></div>
            </div>
            <div class="stat-card">
                <h3>Conexiones Permanentes</h3>
                <div class="value">${connections}<span class="unit">conexiones</span></div>
            </div>
            <div class="stat-card">
                <h3>Timeout de Conexión</h3>
                <div class="value">${connectionTimeout}<span class="unit">ms</span></div>
            </div>
            <div class="stat-card">
                <h3>Timeout de Respuesta</h3>
                <div class="value">${responseTimeout}<span class="unit">ms</span></div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h3>📈 Tiempo de Respuesta por Hilo vs Tiempo de Ejecución</h3>
                <canvas id="loadChart" class="chart-canvas"></canvas>
                <div class="chart-legend">
                    ${Array.from({length: threads}, (_, i) => {
                        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
                        const color = colors[i] || '#667eea';
                        return `<div class="legend-item">
                            <div class="legend-color" style="background-color: ${color};"></div>
                            <span>Hilo ${i + 1}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>

        <div class="details-section">
            <h2>📋 Detalles de Request y Response por Conexión</h2>
            ${(() => {
                // Agrupar métricas por conexión, excluyendo connectionId 0 (errores)
                const connectionGroups = new Map<number, ResponseMetrics[]>();
                metrics.forEach(metric => {
                    // Solo incluir métricas de conexiones reales (connectionId > 0)
                    if (metric.connectionId > 0) {
                        if (!connectionGroups.has(metric.connectionId)) {
                            connectionGroups.set(metric.connectionId, []);
                        }
                        connectionGroups.get(metric.connectionId)!.push(metric);
                    }
                });
                
                // Ordenar conexiones por ID
                const sortedConnections = Array.from(connectionGroups.keys()).sort((a, b) => a - b);
                
                return sortedConnections.map(connectionId => {
                    const connectionMetrics = connectionGroups.get(connectionId)!;
                    const successfulCount = connectionMetrics.filter(m => m.success).length;
                    const failedCount = connectionMetrics.filter(m => !m.success).length;
                    const avgResponseTime = connectionMetrics.length > 0 ? 
                        connectionMetrics.reduce((sum, m) => sum + m.responseTime, 0) / connectionMetrics.length : 0;
                    
                    // Obtener información de red de la conexión
                    const connectionInfo = connectionPool?.getConnectionInfo(connectionId);
                    const networkInfo = connectionInfo ? 
                        `${connectionInfo.localAddress}:${connectionInfo.localPort} → ${connectionInfo.remoteAddress}:${connectionInfo.remotePort}` :
                        'Información de red no disponible';
                    
                    return `
                        <div class="connection-group" style="margin: 30px 0; padding: 20px; border: 2px solid #667eea; border-radius: 10px; background-color: #f8f9ff;">
                            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 1.3em;">
                                🔗 Conexión ${connectionId} 
                                <span style="font-size: 0.8em; color: #666;">
                                    (${connectionMetrics.length} transacciones, ${successfulCount} éxitos, ${failedCount} fallos)
                                </span>
                            </h3>
                            <div style="margin-bottom: 15px; padding: 10px; background-color: #e3f2fd; border-radius: 5px;">
                                <strong>🌐 Información de Red:</strong><br>
                                • <strong>Origen:</strong> ${connectionInfo?.localAddress || 'N/A'}:${connectionInfo?.localPort || 'N/A'}<br>
                                • <strong>Destino:</strong> ${connectionInfo?.remoteAddress || 'N/A'}:${connectionInfo?.remotePort || 'N/A'}<br>
                                • <strong>Ruta:</strong> ${networkInfo}
                            </div>
                            <div style="margin-bottom: 15px; padding: 10px; background-color: #e8f5e8; border-radius: 5px;">
                                <strong>📊 Estadísticas de la Conexión:</strong><br>
                                • Tiempo promedio de respuesta: ${avgResponseTime.toFixed(2)}ms<br>
                                • Tasa de éxito: ${connectionMetrics.length > 0 ? ((successfulCount / connectionMetrics.length) * 100).toFixed(2) : '0'}%<br>
                                • Transacciones totales: ${connectionMetrics.length}
                            </div>
                            ${connectionMetrics.map((metric, index) => `
                                <div class="iteration-details" style="margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
                                    <div class="iteration-header">
                                        Iteración ${metric.iteration} (Hilo ${metric.threadId}) - ${metric.success ? '✅ Exitoso' : '❌ Fallido'}
                                    </div>
                                    <div>⏱️ Tiempo de respuesta: ${metric.responseTime}ms</div>
                                    <div>🕐 Timestamp: ${metric.timestamp}</div>
                                    ${metric.requestDetails && Object.keys(metric.requestDetails).length > 0 ? `
                                        <div class="message-box">
                                            <h4>📤 Request (MTI 0800)</h4>
                                            <div class="field-list">
                                                ${Object.entries(cleanEmptyFields(metric.requestDetails || {}))
                                                    .map(([key, value]) => `<div class=\"field-item\"><strong>${key}:</strong> ${value}</div>`)
                                                    .join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    ${metric.responseDetails && Object.keys(metric.responseDetails).length > 0 ? `
                                        <div class="message-box">
                                            <h4>📥 Response (MTI 0810)</h4>
                                            <div class="field-list">
                                                ${Object.entries(cleanEmptyFields(metric.responseDetails || {}))
                                                    .map(([key, value]) => `<div class=\"field-item\"><strong>${key}:</strong> ${value}</div>`)
                                                    .join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('');
            })()}
            
            ${(() => {
                // Mostrar errores de conexión (connectionId 0) en una sección separada
                const errorMetrics = metrics.filter(m => m.connectionId === 0);
                if (errorMetrics.length > 0) {
                    return `
                        <div class="error-section" style="margin: 30px 0; padding: 20px; border: 2px solid #dc3545; border-radius: 10px; background-color: #fff5f5;">
                            <h3 style="margin: 0 0 15px 0; color: #dc3545; font-size: 1.3em;">
                                ⚠️ Errores de Conexión (${errorMetrics.length} errores)
                            </h3>
                            <div style="margin-bottom: 15px; padding: 10px; background-color: #ffe6e6; border-radius: 5px;">
                                <strong>📋 Errores que ocurrieron cuando no había conexiones disponibles:</strong><br>
                                • Total de errores: ${errorMetrics.length}<br>
                                • Hilos afectados: ${new Set(errorMetrics.map(m => m.threadId)).size}
                            </div>
                            ${errorMetrics.map((metric, index) => `
                                <div class="error-details" style="margin: 15px 0; padding: 15px; border: 1px solid #dc3545; border-radius: 8px; background-color: #fff5f5;">
                                    <div class="error-header" style="font-weight: bold; color: #dc3545; margin-bottom: 10px;">
                                        Iteración ${metric.iteration} (Hilo ${metric.threadId}) - ❌ Error de Conexión
                                    </div>
                                    <div>⏱️ Tiempo de respuesta: ${metric.responseTime}ms</div>
                                    <div>🕐 Timestamp: ${metric.timestamp}</div>
                                    <div>❌ Error: ${metric.error || 'Error desconocido'}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                return '';
            })()}
        </div>
    </div>

    <script>
        // Datos del gráfico
        const chartData = ${JSON.stringify(loadChartData)};

        // Función para dibujar el gráfico
        function drawChart() {
            const canvas = document.getElementById('loadChart');
            const ctx = canvas.getContext('2d');
            
            // Configurar dimensiones del canvas
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            const width = canvas.width;
            const height = canvas.height;
            const padding = 60;
            
            // Limpiar canvas
            ctx.clearRect(0, 0, width, height);
            
            if (chartData.datasets.length === 0) {
                ctx.fillStyle = '#666';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No hay datos para mostrar', width / 2, height / 2);
                return;
            }
            
            // Calcular escalas
            let maxY = 0;
            let minTime = Infinity;
            let maxTime = -Infinity;
            
            chartData.datasets.forEach(dataset => {
                dataset.data.forEach(point => {
                    maxY = Math.max(maxY, point.y);
                    minTime = Math.min(minTime, point.x);
                    maxTime = Math.max(maxTime, point.x);
                });
            });
            
            const chartWidth = width - 2 * padding;
            const chartHeight = height - 2 * padding;
            const timeRange = maxTime - minTime || 1;
            
            // Dibujar ejes
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            
            // Eje Y
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, height - padding);
            ctx.stroke();
            
            // Eje X
            ctx.beginPath();
            ctx.moveTo(padding, height - padding);
            ctx.lineTo(width - padding, height - padding);
            ctx.stroke();
            
            // Dibujar líneas de cuadrícula
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 0.5;
            
            // Líneas horizontales
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }
            
            // Etiquetas del eje Y
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            for (let i = 0; i <= 5; i++) {
                const value = Math.round((maxY / 5) * (5 - i));
                const y = padding + (chartHeight / 5) * i;
                ctx.fillText(value.toString(), padding - 5, y + 4);
            }
            
            // Dibujar líneas para cada hilo
            chartData.datasets.forEach((dataset, datasetIndex) => {
                const color = dataset.borderColor;
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                dataset.data.forEach((point, index) => {
                    const x = padding + ((point.x - minTime) / timeRange) * chartWidth;
                    const y = height - padding - (point.y / maxY) * chartHeight;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                
                ctx.stroke();
                
                // Dibujar puntos
                ctx.fillStyle = color;
                dataset.data.forEach(point => {
                    const x = padding + ((point.x - minTime) / timeRange) * chartWidth;
                    const y = height - padding - (point.y / maxY) * chartHeight;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                });
            });
            
            // Etiquetas del eje X (tiempos)
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            
            // Generar etiquetas de tiempo distribuidas uniformemente
            const numLabels = 8;
            for (let i = 0; i <= numLabels; i++) {
                const time = minTime + (timeRange / numLabels) * i;
                const x = padding + (chartWidth / numLabels) * i;
                const timeStr = new Date(time).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                });
                
                ctx.fillText(timeStr, x, height - padding + 15);
            }
        }
        
        // Dibujar gráfico cuando se carga la página
        window.addEventListener('load', drawChart);
        window.addEventListener('resize', drawChart);
    </script>
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
    
    // Determinar la ruta correcta del directorio tmp
    let tmpDir: string;
    if (__dirname.endsWith('dist')) {
        tmpDir = path.join(__dirname, '..', 'tmp');
    } else {
        tmpDir = path.join(__dirname, 'tmp');
    }
    
    // Crear directorio tmp si no existe
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const filePath = path.join(tmpDir, filename);
    
    try {
        fs.writeFileSync(filePath, htmlContent, 'utf8');
        return filename;
    } catch (error) {
        log(`Error guardando reporte HTML: ${error}`, 'error');
        return '';
    }
}

// Configuración del cliente TCP/IP
export function createTcpClient(host: string = '10.245.229.25', port: number = 6020): { socket: net.Socket; getRequestData: () => { message: string; details: Record<string, string> }; getResponseData: () => { message: string; details: Record<string, string> } } {
    const client = new net.Socket();
    let connectionTimeout: NodeJS.Timeout;
    let responseTimeout: NodeJS.Timeout;
    let requestMessage = '';
    let requestDetails: Record<string, string> = {};
    let responseMessage = '';
    let responseDetails: Record<string, string> = {};

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

        // Guardar el request para el reporte
        requestMessage = serializedMessage;
        // Parsear el mensaje original sin el header de longitud
        requestDetails = deserializeIso8583Message(serializedMessage);
        console.log('[DEBUG] Después de deserializar request:', requestDetails);

        // Limpiar campos vacíos inmediatamente después de deserializar
        requestDetails = cleanEmptyFields(requestDetails);
        console.log('[DEBUG] Después de limpiar request:', requestDetails);

        // Enviar mensaje
        // Todo el mensaje debe ser ASCII, no hexadecimal
        const messageBuffer = Buffer.from(serializedMessage, 'ascii');
        log(`[DEBUG] Mensaje final a enviar (ASCII): ${serializedMessage}`);
        log(`[DEBUG] Mensaje final a enviar (HEX): ${messageBuffer.toString('hex')}`);
        client.write(messageBuffer);

        // Establecer un timeout para la espera de la respuesta de 5 segundos
        responseTimeout = setTimeout(() => {
            log('Timeout de respuesta: No se recibió respuesta del servidor en 5 segundos', 'error');
            client.destroy();
        }, 5000);
    });

    // Manejar datos recibidos del servidor
    client.on('data', (data) => {
        clearTimeout(responseTimeout); // Limpiar el timeout de respuesta
        const response = data.toString('ascii');
        log('Respuesta recibida del servidor: ' + response, 'debug');

        // Guardar el response para el reporte
        responseMessage = response;
        console.log('[DEBUG] Antes de deserializar response:', response);
        responseDetails = deserializeIso8583Message(response);
        console.log('[DEBUG] Después de deserializar response:', responseDetails);

        // Limpiar campos vacíos inmediatamente después de deserializar
        responseDetails = cleanEmptyFields(responseDetails);
        console.log('[DEBUG] Después de limpiar response:', responseDetails);
        
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

    return {
        socket: client,
        getRequestData: () => ({ message: requestMessage, details: requestDetails }),
        getResponseData: () => ({ message: responseMessage, details: responseDetails })
    };
}

// Si el archivo se ejecuta directamente, crear y conectar el cliente
if (require.main === module) {
    function showHelp() {
        console.log(`
🚀 EchoTest - Cliente TCP/IP para Pruebas ISO 8583

Uso: ts-node tcp-client.ts [opciones]

Opciones:
  --ip <ip>           Dirección IP del servidor (default: 10.245.229.25)
  --pt <puerto>       Puerto del servidor (default: 6020)
  --it <iteraciones>  Número de iteraciones (default: 1)
  --dl <delay>        Delay entre iteraciones en ms (default: 0)
  --th <hilos>        Número de hilos para paralelización (default: 1)
  --cn <n>            Número de conexiones permanentes (default: 1)
  --ct <ms>           Timeout de conexión en ms (default: 3000)
  --rt <ms>           Timeout de respuesta en ms (default: 2000)
  --help              Mostrar esta ayuda

Ejemplos:
  ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 100 --dl 50
  ts-node tcp-client.ts --ip 192.168.1.100 --pt 8080 --it 500 --dl 0 --th 10
  ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 1000 --th 5 --cn 3
  ts-node tcp-client.ts --ip 127.0.0.1 --pt 6020 --it 100 --ct 5000 --rt 3000
  ts-node tcp-client.ts --help
        `);
    }

    function parseArguments(args: string[]): { host: string; port: number; iterations: number; delay: number; threads: number; connections: number; connectionTimeout: number; responseTimeout: number } {
        let host = '10.245.229.25';
        let port = 6020;
        let iterations = 1;
        let delay = 0;
        let threads = 1;
        let connections = 1; // Valor por defecto: 1 conexión
        let connectionTimeout = 3000; // Timeout de conexión por defecto: 3000ms
        let responseTimeout = 2000; // Timeout de respuesta por defecto: 2000ms

        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '--ip':
                    host = args[++i] || host;
                    break;
                case '--pt':
                    port = parseInt(args[++i]) || port;
                    break;
                case '--it':
                    iterations = parseInt(args[++i]) || iterations;
                    break;
                case '--dl':
                    delay = parseInt(args[++i]) || delay;
                    break;
                case '--th':
                    threads = parseInt(args[++i]) || threads;
                    break;
                case '--cn':
                    connections = parseInt(args[++i]) || connections;
                    break;
                case '--ct':
                    connectionTimeout = parseInt(args[++i]) || connectionTimeout;
                    break;
                case '--rt':
                    responseTimeout = parseInt(args[++i]) || responseTimeout;
                    break;
                case '--help':
                    showHelp();
                    process.exit(0);
                    break;
            }
        }

        return { host, port, iterations, delay, threads, connections, connectionTimeout, responseTimeout };
    }

    // Función para ejecutar una iteración usando conexiones permanentes
    function runIterationWithPersistentConnection(
        connectionPool: ConnectionPool, 
        iterationNumber: number, 
        threadId: number,
        responseTimeout: number = 2000
    ): Promise<ResponseMetrics> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const timestamp = new Date().toISOString();
            
            let requestMessage = '';
            let requestDetails: Record<string, string> = {};
            let responseMessage = '';
            let responseDetails: Record<string, string> = {};
            let isResolved = false;
            
            // Obtener una conexión disponible del pool
            const connection = connectionPool.getAvailableConnection();
            if (!connection) {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                const metrics: ResponseMetrics = {
                    iteration: iterationNumber,
                    threadId: threadId,
                    connectionId: 0,
                    startTime: startTime,
                    endTime: endTime,
                    responseTime: responseTime,
                    success: false,
                    error: 'No hay conexiones disponibles en el pool',
                    timestamp: timestamp,
                    requestMessage: requestMessage,
                    requestDetails: requestDetails,
                    responseMessage: responseMessage,
                    responseDetails: responseDetails
                };
                
                log(`Error en iteración ${iterationNumber} en hilo ${threadId}: No hay conexiones disponibles`, 'error');
                resolve(metrics);
                return;
            }

            // Función para resolver la promesa de forma segura
            const safeResolve = (success: boolean, error?: string) => {
                if (!isResolved) {
                    isResolved = true;
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    
                    const metrics: ResponseMetrics = {
                        iteration: iterationNumber,
                        threadId: threadId,
                        connectionId: connection.id,
                        startTime: startTime,
                        endTime: endTime,
                        responseTime: responseTime,
                        success: success,
                        error: error,
                        timestamp: timestamp,
                        requestMessage: requestMessage,
                        requestDetails: requestDetails,
                        responseMessage: responseMessage,
                        responseDetails: responseDetails
                    };
                    
                    log(`Iteración ${iterationNumber} en hilo ${threadId} completada`, 'info');
                    resolve(metrics);
                }
            };
            
            const safeReject = (error: Error) => {
                if (!isResolved) {
                    isResolved = true;
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    
                    const metrics: ResponseMetrics = {
                        iteration: iterationNumber,
                        threadId: threadId,
                        connectionId: connection.id,
                        startTime: startTime,
                        endTime: endTime,
                        responseTime: responseTime,
                        success: false,
                        error: error.message,
                        timestamp: timestamp,
                        requestMessage: requestMessage,
                        requestDetails: requestDetails,
                        responseMessage: responseMessage,
                        responseDetails: responseDetails
                    };
                    
                    log(`Error en iteración ${iterationNumber} en hilo ${threadId}: ${error.message}`, 'error');
                    resolve(metrics);
                }
            };

            // Configurar la conexión para esta iteración
            connection.currentIteration = iterationNumber;
            connection.currentThreadId = threadId;
            
            log(`Ejecutando iteración ${iterationNumber} en hilo ${threadId} usando conexión permanente ${connection.id}`, 'info');

            // Crear y enviar el mensaje ISO 8583
            const isoMessage = createIso8583EchoTestMessage();
            const serializedMessage = serializeIso8583Message(isoMessage);
            
            requestMessage = serializedMessage;
            requestDetails = deserializeIso8583Message(serializedMessage);
            
            log(`Enviando mensaje ISO 8583 por conexión ${connection.id}: ${serializedMessage}`, 'debug');

            // Configurar listeners para esta iteración específica
            const onData = (data: Buffer) => {
                const response = data.toString('ascii');
                log(`Respuesta recibida en iteración ${iterationNumber} (hilo ${threadId}) por conexión ${connection.id}: ${response}`, 'debug');
                
                responseMessage = response;
                console.log('[DEBUG] Antes de deserializar response:', response);
                responseDetails = deserializeIso8583Message(response);
                console.log('[DEBUG] Después de deserializar response:', responseDetails);
                
                // Limpiar campos vacíos inmediatamente después de deserializar
                responseDetails = cleanEmptyFields(responseDetails);
                console.log('[DEBUG] Después de limpiar response:', responseDetails);
                
                // Limpiar timeout de respuesta
                clearTimeout(responseTimeoutId);
                
                // Incrementar contador de transacciones
                connection.totalTransactions++;
                
                // Liberar la conexión
                connectionPool.releaseConnection(connection.id);
                
                // Limpiar listeners
                connection.socket.removeListener('data', onData);
                connection.socket.removeListener('error', onError);
                
                safeResolve(true);
            };

            const onError = (error: Error) => {
                log(`Error de conexión en iteración ${iterationNumber} (hilo ${threadId}) por conexión ${connection.id}: ${error.message}`, 'error');
                
                // Limpiar timeout de respuesta
                clearTimeout(responseTimeoutId);
                
                // Liberar la conexión
                connectionPool.releaseConnection(connection.id);
                
                // Limpiar listeners
                connection.socket.removeListener('data', onData);
                connection.socket.removeListener('error', onError);
                
                safeReject(error);
            };

            // Agregar listeners
            connection.socket.once('data', onData);
            connection.socket.once('error', onError);

            // Configurar timeout de respuesta
            const responseTimeoutId = setTimeout(() => {
                if (!isResolved) {
                    log(`Timeout de respuesta en iteración ${iterationNumber} (hilo ${threadId}) por conexión ${connection.id} después de ${responseTimeout}ms`, 'error');
                    
                    // Limpiar listeners
                    connection.socket.removeListener('data', onData);
                    connection.socket.removeListener('error', onError);
                    
                    // Liberar la conexión
                    connectionPool.releaseConnection(connection.id);
                    
                    safeResolve(false, `Timeout de respuesta después de ${responseTimeout}ms`);
                }
            }, responseTimeout);

            // Enviar mensaje
            const messageBuffer = Buffer.from(serializedMessage, 'ascii');
            connection.socket.write(messageBuffer);
        });
    }

    // Función para ejecutar múltiples iteraciones en paralelo
    async function runMultipleIterations(host: string, port: number, iterations: number, delay: number, threads: number, connections: number, connectionTimeout: number, responseTimeout: number) {
        log(`Iniciando ${iterations} iteración(es) hacia ${host}:${port} con ${threads} hilos y ${connections} conexión(es) permanentes`, 'info');
        log(`Configuración: ${host}:${port}, ${iterations} iteraciones, ${delay}ms delay, ${threads} hilos, ${connections} conexión(es) permanentes, ${connectionTimeout}ms timeout conexión, ${responseTimeout}ms timeout respuesta`, 'info');
        
        // Validar configuración de conexiones vs hilos
        if (connections < threads) {
            log(`⚠️  ADVERTENCIA: Tienes ${threads} hilos pero solo ${connections} conexión(es). Algunos hilos tendrán que esperar a que las conexiones estén disponibles.`, 'info');
            log(`💡 Recomendación: Usar --cn ${threads} para tener una conexión por hilo, o reducir --th a ${connections} para usar una conexión por hilo.`, 'info');
        } else if (connections > threads) {
            log(`ℹ️  INFO: Tienes ${connections} conexión(es) para ${threads} hilos. Las conexiones adicionales permitirán mejor rendimiento.`, 'info');
        } else {
            log(`✅ Configuración óptima: ${connections} conexión(es) para ${threads} hilos (1:1)`, 'info');
        }
        
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
            // Crear pool de conexiones permanentes
            const connectionPool = new ConnectionPool(host, port, connections, connectionTimeout);
            await connectionPool.initialize();
            
            // Dividir las iteraciones entre los hilos
            const iterationsPerThread = Math.ceil(iterations / threads);
            const promises: Promise<ResponseMetrics[]>[] = [];
            
            for (let threadId = 0; threadId < threads && isRunning; threadId++) {
                const startIteration = threadId * iterationsPerThread + 1;
                const endIteration = Math.min((threadId + 1) * iterationsPerThread, iterations);
                
                if (startIteration <= iterations) {
                    const threadPromise = runThread(connectionPool, startIteration, endIteration, delay, threadId + 1, responseTimeout);
                    promises.push(threadPromise);
                }
            }
            
            // Esperar a que todos los hilos completen
            const threadResults = await Promise.all(promises);
            
            // Combinar todas las métricas
            threadResults.forEach(threadMetrics => {
                metrics.push(...threadMetrics);
            });
            
            // Ordenar métricas por iteración
            metrics.sort((a, b) => a.iteration - b.iteration);
            
            log(`Todas las ${iterations} iteración(es) completadas`, 'info');
            
            // Mostrar estadísticas del pool de conexiones
            const poolStats = connectionPool.getStats();
            log(`Estadísticas del pool: ${poolStats.connected}/${poolStats.total} conexiones activas, ${poolStats.totalTransactions} transacciones totales`, 'info');
            
            // Cerrar todas las conexiones
            await connectionPool.closeAll();
            
            const htmlReport = generateHtmlReport(metrics, host, port, iterations, delay, threads, connections, connectionTimeout, responseTimeout, connectionPool);
            const reportFilename = saveHtmlReport(htmlReport, host, port);
            
            const path = require('path');
            
            // Determinar la ruta correcta del directorio tmp
            let tmpDir: string;
            if (__dirname.endsWith('dist')) {
                tmpDir = path.join(__dirname, '..', 'tmp');
            } else {
                tmpDir = path.join(__dirname, 'tmp');
            }
            
            const reportPath = path.join(tmpDir, reportFilename);
            
            log(`Reporte HTML generado: ${reportPath}`, 'info');
            
            // Abrir el reporte en el navegador
            const { exec } = require('child_process');
            exec(`open "${reportPath}"`, (error: any) => {
                if (error) {
                    log(`No se pudo abrir el reporte automáticamente: ${error.message}`, 'error');
                    log(`Puede abrir manualmente: ${reportPath}`, 'info');
                }
            });
            
        } catch (error) {
            log(`Error durante la ejecución: ${error}`, 'error');
        }
    }

    // Función para ejecutar un hilo de iteraciones
    async function runThread(connectionPool: ConnectionPool, startIteration: number, endIteration: number, delay: number, threadId: number, responseTimeout: number): Promise<ResponseMetrics[]> {
        const threadMetrics: ResponseMetrics[] = [];
        
        for (let i = startIteration; i <= endIteration; i++) {
            try {
                const metrics = await runIterationWithPersistentConnection(connectionPool, i, threadId, responseTimeout);
                threadMetrics.push(metrics);
                
                if (delay > 0 && i < endIteration) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                log(`Error en hilo ${threadId}, iteración ${i}: ${error}`, 'error');
                const errorMetrics: ResponseMetrics = {
                    iteration: i,
                    threadId: threadId,
                    connectionId: 0, // No hay conexión disponible en caso de error
                    startTime: Date.now(),
                    endTime: Date.now(),
                    responseTime: 0,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString()
                };
                threadMetrics.push(errorMetrics);
            }
        }
        
        return threadMetrics;
    }

    // Función principal
    async function main() {
        const args = process.argv.slice(2);
        const { host, port, iterations, delay, threads, connections, connectionTimeout, responseTimeout } = parseArguments(args);
        
        log(`Configuración: ${host}:${port}, ${iterations} iteraciones, ${delay}ms delay, ${threads} hilos, ${connections} conexión(es) permanentes, ${connectionTimeout}ms timeout conexión, ${responseTimeout}ms timeout respuesta`, 'info');
        
        await runMultipleIterations(host, port, iterations, delay, threads, connections, connectionTimeout, responseTimeout);
    }

    // Ejecutar si es el archivo principal
    if (require.main === module) {
        main().catch(error => {
            log(`Error en la ejecución principal: ${error}`, 'error');
            process.exit(1);
        });
    }
}

function cleanEmptyFields(obj: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (value && 
            value !== '' && 
            value !== '(vacío)' && 
            value !== 'undefined' && 
            value !== 'null' &&
            value !== undefined &&
            value !== null) {
            cleaned[key] = value;
        }
    });
    return cleaned;
}