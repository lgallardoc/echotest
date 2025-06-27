/// <reference path="./iso8583-js.d.ts" />
/// <reference types="node" />
import * as net from 'net';
import * as dotenv from 'dotenv';
import ISO8583 = require('iso8583-js');
import * as winston from 'winston';
const cluster: any = require('cluster');
import * as os from 'os';

// Cargar variables de entorno
dotenv.config();

// Función para serializar mensaje ISO 8583 con header de longitud
function serializeIso8583Message(message: string): string {
    const length = message.length.toString().padStart(4, '0');
    // Todo debe ser ASCII, no hexadecimal
    return length + message;
}

// Configuración de logging
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            return `${info.timestamp} [${info.level}] ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
            filename: 'log/server.log',
            dirname: 'log'
        })
    ]
});

// Función para procesar una conexión individual
function handleConnection(socket: net.Socket) {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    logger.info(`Nueva conexión desde ${clientAddress}`);
    
    socket.on('data', (data) => {
        try {
            // El cliente envía el mensaje como bytes ASCII
            // Los primeros 4 bytes son la longitud en ASCII
            const lengthHeaderBytes = data.subarray(0, 4);
            const messageBodyBytes = data.subarray(4);
            
            // Convertir el header de longitud de bytes a string ASCII
            const lengthHeader = lengthHeaderBytes.toString('ascii');
            const messageBody = messageBodyBytes.toString('ascii');
            
            logger.debug(`Header de longitud (ASCII): ${lengthHeader}, Cuerpo del mensaje (ASCII): ${messageBody}`);
            
            // Parsear el mensaje ISO 8583 usando el string ASCII del cuerpo
            const iso8583 = new ISO8583();
            logger.debug(`Intentando parsear mensaje: ${messageBody}`);
            
            let parsed: Map<string, any>;
            let parsedObj: Record<string, string> = {};
            
            try {
                parsed = iso8583.unWrapMsg(messageBody);
                logger.debug(`Parsing exitoso, resultado: ${parsed}`);
                
                // Convertir el Map a un objeto para el logging
                parsed.forEach((value: any, key: any) => {
                    // Solo incluir campos que tienen valor
                    if (value && value !== '') {
                        parsedObj[key] = value;
                        logger.debug(`Campo ${key}: ${value}`);
                    }
                });
                
                logger.debug(`Desglose del mensaje recibido: ${JSON.stringify(parsedObj)}`);
            } catch (parseError) {
                logger.error(`Error en parsing: ${parseError}`);
                parsed = new Map();
            }
            
            // Verificar si el parsing fue exitoso y si es un mensaje de Echo Test (MTI 0800)
            const mti = parsed.get('TYPE');
            logger.debug(`MTI detectado: ${mti}`);
            
            if (mti === '0800') {
                logger.info('Mensaje de Echo Test detectado, generando respuesta...');
                
                // Crear respuesta de Echo Test (MTI 0810)
                // Mantener los mismos campos del request
                const field7 = parsedObj['7'] || '';
                const field11 = parsedObj['11'] || '';
                const field37 = parsedObj['37'] || '';
                const field70 = parsedObj['70'] || '301';
                
                // Crear nueva instancia para la respuesta
                const responseIso = new ISO8583();
                responseIso.set(7, field7); // Transmission Date & Time (mantener del request)
                responseIso.set(11, field11); // Systems Trace Audit Number (mantener del request)
                responseIso.set(37, field37); // Retrieval Reference Number (mantener del request)
                responseIso.set(39, '00'); // Response Code (00 = Approved)
                responseIso.set(70, field70); // Network Management Information Code (mantener del request)
                
                logger.debug(`Campos configurados en respuesta: 7=${field7}, 11=${field11}, 37=${field37}, 39=00, 70=${field70}`);
                
                const responseMessage = responseIso.wrapMsg('0810');
                logger.debug(`Respuesta generada: ${responseMessage}`);
                
                // Parsear la respuesta generada para verificar
                const responseParsed = responseIso.unWrapMsg(responseMessage);
                const responseParsedObj: Record<string, string> = {};
                responseParsed.forEach((value: any, key: any) => {
                    // Solo incluir campos que tienen valor
                    if (value && value !== '') {
                        responseParsedObj[key] = value;
                    }
                });
                logger.debug(`Respuesta parseada: ${JSON.stringify(responseParsedObj)}`);
                
                // Enviar respuesta con header de longitud ASCII
                const responseWithHeader = serializeIso8583Message(responseMessage);
                const responseBuffer = Buffer.from(responseWithHeader, 'ascii');
                socket.write(responseBuffer);
                logger.debug(`Enviando respuesta a ${clientAddress}: ${responseWithHeader}`);
                logger.info(`Respuesta enviada exitosamente a ${clientAddress}`);
            } else {
                logger.warn(`Mensaje con MTI no reconocido: ${mti}`);
                // Enviar respuesta de error
                const errorIso = new ISO8583();
                errorIso.set(39, '96'); // Response Code (96 = System malfunction)
                errorIso.set(70, '301'); // Network Management Information Code
                const errorMessage = errorIso.wrapMsg('0810');
                const errorWithHeader = serializeIso8583Message(errorMessage);
                const errorBuffer = Buffer.from(errorWithHeader, 'ascii');
                socket.write(errorBuffer);
            }
        } catch (error) {
            logger.error(`Error procesando mensaje de ${clientAddress}: ${error}`);
            // Enviar respuesta de error
            try {
                const iso8583 = new ISO8583();
                iso8583.set(39, '96'); // Response Code (96 = System malfunction)
                iso8583.set(70, '301'); // Network Management Information Code
                const errorMessage = iso8583.wrapMsg('0810');
                const errorWithHeader = serializeIso8583Message(errorMessage);
                const errorBuffer = Buffer.from(errorWithHeader, 'ascii');
                socket.write(errorBuffer);
            } catch (packError) {
                logger.error(`Error enviando respuesta de error: ${packError}`);
            }
        }
    });
    
    socket.on('close', () => {
        logger.info(`Conexión cerrada con ${clientAddress}`);
    });
    
    socket.on('error', (error) => {
        logger.error(`Error en conexión con ${clientAddress}: ${error}`);
    });
}

// Función para crear un worker del servidor
function createServerWorker(port: number) {
    // Limitar backlog y maxConnections
    const server = net.createServer();
    server.maxConnections = 200; // Limitar conexiones concurrentes

    server.on('connection', (socket) => {
        socket.setTimeout(30000); // 30 segundos
        socket.on('timeout', () => {
            logger.warn(`Timeout en conexión ${socket.remoteAddress}:${socket.remotePort}`);
            socket.destroy();
        });
        socket.on('error', (err) => {
            logger.error(`Error en socket: ${err}`);
            socket.destroy();
        });
        handleConnection(socket);
    });

    server.on('error', (error) => {
        logger.error(`Error en servidor: ${error}`);
    });

    // Limitar backlog a 128
    server.listen(port, undefined, 128, () => {
        logger.info(`Worker ${process.pid} iniciado en puerto ${port}`);
    });

    return server;
}

// Función principal
function main() {
    const port = parseInt(process.env.PORT || '6020');
    
    let workerCrashes: {[pid: string]: number} = {};

    if ((cluster as any).isPrimary) {
        logger.info(`Servidor maestro iniciado (PID: ${process.pid})`);
        logger.info(`Iniciando workers en puerto ${port}...`);
        const numCPUs = os.cpus().length;
        logger.info(`Creando ${numCPUs} workers...`);
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        cluster.on('exit', (worker: any, code: any, signal: any) => {
            logger.warn(`Worker ${worker.process.pid} murió. Reiniciando...`);
            const now = Date.now();
            workerCrashes[worker.process.pid] = (workerCrashes[worker.process.pid] || 0) + 1;
            if (workerCrashes[worker.process.pid] > 5) {
                logger.error(`Worker ${worker.process.pid} murió demasiadas veces. No se reiniciará automáticamente.`);
                return;
            }
            cluster.fork();
        });
        cluster.on('listening', (worker: any, address: any) => {
            logger.info(`Worker ${worker.process.pid} escuchando en ${address.address}:${address.port}`);
        });
        process.on('SIGINT', () => {
            logger.info('Recibida señal SIGINT, cerrando servidor...');
            for (const id in (cluster as any).workers) {
                (cluster as any).workers[id]?.kill();
            }
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            logger.info('Recibida señal SIGTERM, cerrando servidor...');
            for (const id in (cluster as any).workers) {
                (cluster as any).workers[id]?.kill();
            }
            process.exit(0);
        });
    } else {
        process.on('uncaughtException', (err) => {
            logger.error(`[WORKER ${process.pid}] uncaughtException: ${err.stack || err}`);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason) => {
            logger.error(`[WORKER ${process.pid}] unhandledRejection: ${reason}`);
            process.exit(1);
        });
        logger.info(`[WORKER ${process.pid}] Arrancando worker...`);
        createServerWorker(port);
        
        // Manejo de señales para workers
        process.on('SIGINT', () => {
            logger.info(`Worker ${process.pid} cerrando...`);
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            logger.info(`Worker ${process.pid} cerrando...`);
            process.exit(0);
        });
    }
}

// Ejecutar el servidor
if (require.main === module) {
    main();
}

export { createServerWorker }; 