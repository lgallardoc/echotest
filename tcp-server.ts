/// <reference path="./iso8583-js.d.ts" />
import * as net from 'net';
import * as dotenv from 'dotenv';
import ISO8583 = require('iso8583-js');

// Cargar variables de entorno
dotenv.config();

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

// Función para deserializar el mensaje ISO 8583 recibido
function deserializeIso8583Message(response: string): Record<string, string> {
    // Los primeros 4 caracteres son la longitud
    const body = response.substring(4);
    
    // Verificar que el mensaje tenga al menos el MTI y bitmap
    if (body.length < 20) {
        throw new Error('Mensaje demasiado corto');
    }
    
    const mti = body.substring(0, 4);
    const bitmap = body.substring(4, 20);
    
    // Para mensajes simples, solo extraer los campos básicos
    const result: Record<string, string> = {
        MTI: mti,
        Bitmap: bitmap
    };
    
    // Extraer campos adicionales si están presentes
    let position = 20;
    
    // Campo 7 (10 caracteres) - Transaction Date/Time
    if (position + 10 <= body.length) {
        result['7'] = body.substring(position, position + 10);
        position += 10;
    }
    
    // Campo 11 (6 caracteres) - STAN
    if (position + 6 <= body.length) {
        result['11'] = body.substring(position, position + 6);
        position += 6;
    }
    
    // Campo 37 (12 caracteres) - RRN
    if (position + 12 <= body.length) {
        result['37'] = body.substring(position, position + 12);
        position += 12;
    }
    
    // Campo 70 (3 caracteres) - Network Management Information Code
    if (position + 3 <= body.length) {
        result['70'] = body.substring(position, position + 3);
    }
    
    return result;
}

// Función para crear una respuesta ISO 8583 de echo test
function createIso8583EchoResponse(requestMessage: Record<string, string>): string {
    // Crear instancia de ISO8583
    const iso = new ISO8583();
    
    // Usar los mismos valores del request para la respuesta
    iso.set(7, requestMessage['7']); // Fecha y hora del mensaje
    iso.set(11, requestMessage['11']); // Número de rastreo del sistema
    iso.set(37, requestMessage['37']); // RRN - Número de Referencia
    iso.set(39, '00'); // Código de respuesta (00 = Aprobado)
    iso.set(70, '301'); // Código de gestión (Echo Test)
    
    // Generar mensaje ISO 8583 de respuesta
    const isoMessage = iso.wrapMsg('0810'); // MTI 0810 para Network Management Response
    return isoMessage;
}

// Función para serializar el mensaje ISO 8583 a una cadena con header de longitud
function serializeIso8583Message(message: string): string {
    const length = message.length.toString().padStart(4, '0');
    return `${length}${message}`;
}

// Crear servidor TCP
const server = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    log(`Nueva conexión desde ${clientAddress}`, 'info');

    // Manejar datos recibidos del cliente
    socket.on('data', (data) => {
        const request = data.toString();
        log(`Mensaje recibido de ${clientAddress}: ${request}`, 'debug');

        try {
            // Deserializar el mensaje recibido
            const deserializedRequest = deserializeIso8583Message(request);
            log(`Desglose del mensaje recibido: ${JSON.stringify(deserializedRequest)}`, 'debug');

            // Verificar si es un mensaje de echo test (MTI 0800 y campo 70 = 301)
            if (deserializedRequest.MTI === '0800' && deserializedRequest['70'] === '301') {
                log('Mensaje de Echo Test detectado, generando respuesta...', 'info');

                // Crear respuesta de echo test
                const responseMessage = createIso8583EchoResponse(deserializedRequest);
                log(`Respuesta generada: ${responseMessage}`, 'debug');

                // Serializar y enviar respuesta
                const serializedResponse = serializeIso8583Message(responseMessage);
                log(`Enviando respuesta a ${clientAddress}: ${serializedResponse}`, 'debug');

                socket.write(serializedResponse);
                log(`Respuesta enviada exitosamente a ${clientAddress}`, 'info');
            } else {
                log(`Mensaje no reconocido como Echo Test. MTI: ${deserializedRequest.MTI}, Campo 70: ${deserializedRequest['70']}`, 'error');
                // Enviar respuesta de error
                const errorResponse = '00040810'; // Respuesta de error simple
                socket.write(errorResponse);
            }
        } catch (error) {
            log(`Error procesando mensaje: ${error}`, 'error');
            // Enviar respuesta de error
            const errorResponse = '00040810'; // Respuesta de error simple
            socket.write(errorResponse);
        }
    });

    // Manejar cierre de conexión
    socket.on('close', () => {
        log(`Conexión cerrada con ${clientAddress}`, 'info');
    });

    // Manejar errores de conexión
    socket.on('error', (err) => {
        log(`Error en conexión con ${clientAddress}: ${err.message}`, 'error');
    });
});

// Configuración del servidor
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 6020;
const HOST = process.env.HOST || '127.0.0.1';

// Iniciar servidor
server.listen(PORT, HOST, () => {
    log(`Servidor TCP ISO 8583 Echo Test iniciado en ${HOST}:${PORT}`, 'info');
    log('Esperando conexiones de clientes...', 'info');
});

// Manejar errores del servidor
server.on('error', (err) => {
    log(`Error del servidor: ${err.message}`, 'error');
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    log('Cerrando servidor...', 'info');
    server.close(() => {
        log('Servidor cerrado', 'info');
        process.exit(0);
    });
});

export { server }; 