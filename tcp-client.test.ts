import * as net from 'net';
import {
  createIso8583EchoTestMessage,
  serializeIso8583Message,
  deserializeIso8583Message,
  createTcpClient
} from './tcp-client';

jest.mock('net');

describe('tcp-client', () => {
  let mockSocket: {
    connect: jest.Mock;
    write: jest.Mock;
    on: jest.Mock;
    destroy: jest.Mock;
    setTimeout: jest.Mock;
  };
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Crear un mock para net.Socket
    mockSocket = {
      connect: jest.fn().mockReturnThis(),
      write: jest.fn(),
      on: jest.fn().mockReturnThis(),
      destroy: jest.fn(),
      setTimeout: jest.fn(),
    };

    (net.Socket as unknown as jest.Mock).mockImplementation(() => mockSocket);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // Limpiar todos los timeouts pendientes
    jest.clearAllTimers();
  });

  describe('createIso8583EchoTestMessage', () => {
    it('should create a valid ISO 8583 Echo Test message', () => {
      const message = createIso8583EchoTestMessage();
      // Verificar que el mensaje es una cadena que contiene el MTI 0800
      expect(typeof message).toBe('string');
      expect(message).toContain('0800');
    });
  });

  describe('serializeIso8583Message', () => {
    it('should serialize an ISO 8583 message correctly with length header', () => {
      const message = '0800822000000A000000051216160805968551320005968500301';
      const length = message.length.toString().padStart(4, '0');
      const expected = `${length}${message}`;
      const serialized = serializeIso8583Message(message);
      expect(serialized).toBe(expected);
    });
  });

  describe('deserializeIso8583Message', () => {
    it('should deserialize an ISO 8583 response correctly with length header', () => {
      const body = '0810822000000A000000051216160805968551320005968500301';
      const length = body.length.toString().padStart(4, '0');
      const response = `${length}${body}`;
      const deserialized = deserializeIso8583Message(response);
      expect(deserialized).toEqual({
        MTI: '0810',
        Bitmap: '822000000A000000',
        '7': '0512161608',
        '11': '059685',
        '37': '513200059685',
        '39': '00',
        '70': '301',
      });
    });
  });

  describe('TCP Client', () => {
    it('should connect to the server and send a serialized message with length header', () => {
      const client = createTcpClient();
      const host = '10.139.0.132';
      const port = 6001;

      // Verificar que se haya llamado a connect con los argumentos correctos
      expect(mockSocket.connect).toHaveBeenCalledWith(port, host, expect.any(Function));

      // Simular la llamada a la función de callback de connect
      const connectCallback = mockSocket.connect.mock.calls[0][2];
      if (typeof connectCallback === 'function') {
        connectCallback();
      }

      // Verificar que el mensaje enviado tiene el formato correcto (longitud 4 dígitos + MTI 0800)
      expect(mockSocket.write).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}0800/)
      );
    });

    it('should handle data received from the server with length header', () => {
      const client = createTcpClient();
      const body = '0810822000000A000000051216160805968551320005968500301';
      const length = body.length.toString().padStart(4, '0');
      const response = `${length}${body}`;

      // Simular datos recibidos del servidor
      const dataCallback = mockSocket.on.mock.calls.find(call => call[0] === 'data')?.[1];
      if (typeof dataCallback === 'function') {
        dataCallback(Buffer.from(response));
      }

      expect(mockSocket.destroy).toHaveBeenCalled();
    });

    it('should handle connection close', () => {
      const client = createTcpClient();
      const closeCallback = mockSocket.on.mock.calls.find(call => call[0] === 'close')?.[1];
      if (typeof closeCallback === 'function') {
        closeCallback();
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Conexión cerrada'));
    });

    it('should handle connection errors', () => {
      const client = createTcpClient();
      const error = new Error('Test error');
      const errorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'error')?.[1];
      if (typeof errorCallback === 'function') {
        errorCallback(error);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error en la conexión: Test error')
      );
    });
  });
});