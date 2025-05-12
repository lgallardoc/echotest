import * as net from 'net';

// Función para crear un mensaje ISO 8583 de prueba (Echo Test)
function createIso8583EchoTestMessage(): Record<string, string> {
    return {
        MTI: '0800', // Tipo de mensaje
        Bitmap: '7000000000000000', // Bitmap primario
        '7': '0512143454', // Fecha y hora del mensaje (MMDDhhmmss)
        '11': '123456', // Número de rastreo del sistema
        '70': '301', // Código de gestión (Echo Test)
    };
}

// Serializar el mensaje ISO 8583 a una cadena
function serializeIso8583Message(message: Record<string, string>): string {
    return `${message.MTI}${message.Bitmap}${message['7']}${message['11']}${message['70']}`;
}

// Deserializar y desglosar el mensaje ISO 8583 recibido
function deserializeIso8583Message(response: string): Record<string, string> {
    return {
        MTI: response.substring(0, 4),
        Bitmap: response.substring(4, 20),
        '7': response.substring(20, 30),
        '11': response.substring(30, 36),
        '70': response.substring(36, 39),
    };
}

// Configuración del cliente TCP/IP
const client = new net.Socket();
const host = '10.139.0.132'; // Dirección del servidor
const port = 6001; // Puerto del servidor

// Conectar al servidor
client.connect(port, host, () => {
    console.log(`Conectado al servidor TCP en ${host}:${port}`);

    // Crear y serializar el mensaje ISO 8583
    const isoMessage = createIso8583EchoTestMessage();
    console.log('Elementos del mensaje de request:', isoMessage);

    const serializedMessage = serializeIso8583Message(isoMessage);
    console.log('Enviando mensaje ISO 8583:', serializedMessage);

    // Enviar mensaje
    client.write(serializedMessage);
});

// Manejar datos recibidos del servidor
client.on('data', (data) => {
    const response = data.toString();
    console.log('Respuesta recibida del servidor:', response);

    const deserializedResponse = deserializeIso8583Message(response);
    console.log('Desglose de los elementos del response:', deserializedResponse);

    client.destroy(); // Cerrar conexión después de recibir la respuesta
});

// Manejar cierre de conexión
client.on('close', () => {
    console.log('Conexión cerrada');
});

// Manejar errores
client.on('error', (err) => {
    console.error('Error en la conexión:', err.message);
});