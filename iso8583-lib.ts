// Librería simple para ISO 8583 en formato ASCII puro
// Compatible con AS/400 y sistemas legacy

export interface Iso8583Field {
    number: number;
    value: string;
    length?: number; // Longitud fija si se especifica
}

export interface Iso8583Message {
    mti: string;
    fields: Iso8583Field[];
}

// Definición de tipos de longitud de campos ISO 8583
export enum FieldLengthType {
    FIXED = 'FIXED',      // Longitud fija
    LLVAR = 'LLVAR',      // Longitud variable con 2 dígitos de longitud
    LLLVAR = 'LLLVAR'     // Longitud variable con 3 dígitos de longitud
}

// Definición de campos ISO 8583 con tipo de longitud
export const ISO8583_FIELD_DEFINITIONS: Record<number, { maxLength: number; type: FieldLengthType; description: string }> = {
    0: { maxLength: 4, type: FieldLengthType.FIXED, description: 'MTI' },
    1: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Bitmap secundario' },
    2: { maxLength: 19, type: FieldLengthType.LLVAR, description: 'Primary account number' },
    3: { maxLength: 6, type: FieldLengthType.FIXED, description: 'Processing code' },
    4: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Amount, transaction' },
    5: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Amount, settlement' },
    6: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Amount, cardholder billing' },
    7: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Transmission date & time' },
    8: { maxLength: 8, type: FieldLengthType.FIXED, description: 'Amount, cardholder billing fee' },
    9: { maxLength: 8, type: FieldLengthType.FIXED, description: 'Conversion rate, settlement' },
    10: { maxLength: 8, type: FieldLengthType.FIXED, description: 'Conversion rate, cardholder billing' },
    11: { maxLength: 6, type: FieldLengthType.FIXED, description: 'Systems trace audit number' },
    12: { maxLength: 6, type: FieldLengthType.FIXED, description: 'Time, local transaction' },
    13: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Date, local transaction' },
    14: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Date, expiration' },
    15: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Date, settlement' },
    16: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Date, conversion' },
    17: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Date, capture' },
    18: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Merchant type' },
    19: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Acquiring institution country code' },
    20: { maxLength: 3, type: FieldLengthType.FIXED, description: 'PAN extended, country code' },
    21: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Forwarding institution country code' },
    22: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Point of service entry mode' },
    23: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Card sequence number' },
    24: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Function code' },
    25: { maxLength: 2, type: FieldLengthType.FIXED, description: 'Point of service condition code' },
    26: { maxLength: 2, type: FieldLengthType.FIXED, description: 'Point of service capture code' },
    27: { maxLength: 1, type: FieldLengthType.FIXED, description: 'Authorizing identification response length' },
    28: { maxLength: 9, type: FieldLengthType.FIXED, description: 'Amount, transaction fee' },
    29: { maxLength: 9, type: FieldLengthType.FIXED, description: 'Amount, settlement fee' },
    30: { maxLength: 9, type: FieldLengthType.FIXED, description: 'Amount, transaction processing fee' },
    31: { maxLength: 9, type: FieldLengthType.FIXED, description: 'Amount, settlement processing fee' },
    32: { maxLength: 11, type: FieldLengthType.LLVAR, description: 'Acquiring institution identification code' },
    33: { maxLength: 11, type: FieldLengthType.LLVAR, description: 'Forwarding institution identification code' },
    34: { maxLength: 28, type: FieldLengthType.LLVAR, description: 'Primary account number, extended' },
    35: { maxLength: 37, type: FieldLengthType.LLVAR, description: 'Track 2 data' },
    36: { maxLength: 104, type: FieldLengthType.LLLVAR, description: 'Track 3 data' },
    37: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Retrieval reference number' },
    38: { maxLength: 6, type: FieldLengthType.FIXED, description: 'Authorization identification response' },
    39: { maxLength: 2, type: FieldLengthType.FIXED, description: 'Response code' },
    40: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Service restriction code' },
    41: { maxLength: 8, type: FieldLengthType.FIXED, description: 'Card acceptor terminal identification' },
    42: { maxLength: 15, type: FieldLengthType.FIXED, description: 'Card acceptor identification code' },
    43: { maxLength: 40, type: FieldLengthType.FIXED, description: 'Card acceptor name/location' },
    44: { maxLength: 25, type: FieldLengthType.LLVAR, description: 'Additional response data' },
    45: { maxLength: 76, type: FieldLengthType.LLVAR, description: 'Track 1 data' },
    46: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Additional data - ISO' },
    47: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Additional data - national' },
    48: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Additional data - private' },
    49: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Currency code, transaction' },
    50: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Currency code, settlement' },
    51: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Currency code, cardholder billing' },
    52: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Personal identification number data' },
    53: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Security related control information' },
    54: { maxLength: 120, type: FieldLengthType.LLLVAR, description: 'Additional amounts' },
    55: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved ISO' },
    56: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved ISO' },
    57: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved national' },
    58: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved national' },
    59: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    60: { maxLength: 7, type: FieldLengthType.FIXED, description: 'Advice/reason code' },
    61: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved private' },
    62: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved private' },
    63: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved private' },
    64: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Message authentication code (MAC)' },
    65: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Bitmap terciario' },
    66: { maxLength: 1, type: FieldLengthType.FIXED, description: 'Settlement code' },
    67: { maxLength: 2, type: FieldLengthType.FIXED, description: 'Extended payment code' },
    68: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Receiving institution country code' },
    69: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Settlement institution country code' },
    70: { maxLength: 3, type: FieldLengthType.FIXED, description: 'Network management information code' },
    71: { maxLength: 4, type: FieldLengthType.FIXED, description: 'Message number' },
    72: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Data record' },
    73: { maxLength: 6, type: FieldLengthType.FIXED, description: 'Date, action' },
    74: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Credits, number' },
    75: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Credits, reversal number' },
    76: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Debits, number' },
    77: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Debits, reversal number' },
    78: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Transfer number' },
    79: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Transfer, reversal number' },
    80: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Inquiries number' },
    81: { maxLength: 10, type: FieldLengthType.FIXED, description: 'Authorizations, number' },
    82: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Credits, processing fee amount' },
    83: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Credits, transaction fee amount' },
    84: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Debits, processing fee amount' },
    85: { maxLength: 12, type: FieldLengthType.FIXED, description: 'Debits, transaction fee amount' },
    86: { maxLength: 15, type: FieldLengthType.FIXED, description: 'Credits, amount' },
    87: { maxLength: 15, type: FieldLengthType.FIXED, description: 'Credits, reversal amount' },
    88: { maxLength: 15, type: FieldLengthType.FIXED, description: 'Debits, amount' },
    89: { maxLength: 15, type: FieldLengthType.FIXED, description: 'Debits, reversal amount' },
    90: { maxLength: 42, type: FieldLengthType.FIXED, description: 'Original data elements' },
    91: { maxLength: 1, type: FieldLengthType.FIXED, description: 'File update code' },
    92: { maxLength: 2, type: FieldLengthType.FIXED, description: 'File security code' },
    93: { maxLength: 5, type: FieldLengthType.FIXED, description: 'Response indicator' },
    94: { maxLength: 7, type: FieldLengthType.FIXED, description: 'Service indicator' },
    95: { maxLength: 42, type: FieldLengthType.FIXED, description: 'Replacement amounts' },
    96: { maxLength: 8, type: FieldLengthType.FIXED, description: 'Message security code' },
    97: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Amount, net settlement' },
    98: { maxLength: 25, type: FieldLengthType.FIXED, description: 'Payee' },
    99: { maxLength: 11, type: FieldLengthType.LLVAR, description: 'Settlement institution identification code' },
    100: { maxLength: 11, type: FieldLengthType.LLVAR, description: 'Receiving institution identification code' },
    101: { maxLength: 17, type: FieldLengthType.FIXED, description: 'File name' },
    102: { maxLength: 28, type: FieldLengthType.LLVAR, description: 'Account identification 1' },
    103: { maxLength: 28, type: FieldLengthType.LLVAR, description: 'Account identification 2' },
    104: { maxLength: 100, type: FieldLengthType.LLLVAR, description: 'Transaction description' },
    105: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    106: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    107: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    108: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    109: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    110: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    111: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for ISO use' },
    112: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    113: { maxLength: 11, type: FieldLengthType.LLVAR, description: 'Authorizing agent institution id code' },
    114: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    115: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    116: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    117: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    118: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    119: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for national use' },
    120: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for private use' },
    121: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for private use' },
    122: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for private use' },
    123: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for private use' },
    124: { maxLength: 255, type: FieldLengthType.LLLVAR, description: 'Info Text' },
    125: { maxLength: 50, type: FieldLengthType.LLVAR, description: 'Network management information' },
    126: { maxLength: 6, type: FieldLengthType.LLVAR, description: 'Issuer trace id' },
    127: { maxLength: 999, type: FieldLengthType.LLLVAR, description: 'Reserved for private use' },
    128: { maxLength: 16, type: FieldLengthType.FIXED, description: 'Message Authentication code (MAC)' }
};

// Función helper para obtener la definición de un campo
export function getFieldDefinition(fieldNumber: number) {
    return ISO8583_FIELD_DEFINITIONS[fieldNumber] || { maxLength: 6, type: FieldLengthType.FIXED, description: 'Unknown field' };
}

// Función helper para obtener la longitud de un campo
export function getFieldLength(fieldNumber: number): number {
    const definition = getFieldDefinition(fieldNumber);
    return definition.maxLength;
}

// Función helper para obtener el tipo de longitud de un campo
export function getFieldLengthType(fieldNumber: number): FieldLengthType {
    const definition = getFieldDefinition(fieldNumber);
    return definition.type;
}

// Mantener compatibilidad con código existente
export const ISO8583_FIELD_LENGTHS: Record<number, number> = (() => {
    const result: Record<number, number> = {};
    Object.entries(ISO8583_FIELD_DEFINITIONS).forEach(([key, value]) => {
        result[parseInt(key)] = value.maxLength;
    });
    return result;
})();

// Función para construir bitmap primario
export function buildPrimaryBitmap(fields: Iso8583Field[]): string {
    const bitmap = new Array(16).fill('0');
    
    fields.forEach(field => {
        if (field.number > 0 && field.number <= 64) {
            const byteIndex = Math.floor((field.number - 1) / 4);
            const bitIndex = (field.number - 1) % 4;
            const hexValue = Math.pow(2, 3 - bitIndex);
            const currentValue = parseInt(bitmap[byteIndex], 16);
            const newValue = currentValue | hexValue;
            bitmap[byteIndex] = newValue.toString(16).toUpperCase();
        }
    });
    
    return bitmap.join('');
}

// Función para construir bitmap secundario
export function buildSecondaryBitmap(fields: Iso8583Field[]): string {
    const bitmap = new Array(16).fill('0');
    
    fields.forEach(field => {
        if (field.number > 64 && field.number <= 128) {
            const byteIndex = Math.floor((field.number - 65) / 4);
            const bitIndex = (field.number - 65) % 4;
            const hexValue = Math.pow(2, 3 - bitIndex);
            const currentValue = parseInt(bitmap[byteIndex], 16);
            bitmap[byteIndex] = (currentValue | hexValue).toString(16).toUpperCase();
        }
    });
    
    return bitmap.join('');
}

// Función para construir mensaje ISO 8583 en formato ASCII puro
export function buildIso8583Message(message: Iso8583Message): string {
    // Ordenar campos por número
    const sortedFields = [...message.fields].sort((a, b) => a.number - b.number);

    // Verificar si hay campos mayores a 64 (necesita bitmap secundario)
    const hasSecondaryFields = sortedFields.some(field => field.number > 64);

    // Construir bitmap primario
    let primaryBitmap = buildPrimaryBitmap(sortedFields);

    // Si hay campos secundarios, activar el bit 1 del bitmap primario (campo 1)
    if (hasSecondaryFields) {
        const firstByte = parseInt(primaryBitmap[0], 16);
        const newFirstByte = (firstByte | 8).toString(16).toUpperCase(); // 8 = 1000 en binario, activa bit 3 (campo 1)
        primaryBitmap = newFirstByte + primaryBitmap.substring(1);
    }

    // Construir bitmap secundario
    const secondaryBitmap = hasSecondaryFields ? buildSecondaryBitmap(sortedFields) : '0000000000000000';

    // Construir cuerpo del mensaje
    let body = message.mti + primaryBitmap + secondaryBitmap;

    // Calcular campos activos a partir del bitmap (excluyendo campo 1 que es el bitmap secundario)
    const primaryFields = parsePrimaryBitmap(primaryBitmap);
    const secondaryFields = hasSecondaryFields ? parseSecondaryBitmap(secondaryBitmap) : new Set<number>();
    const allActiveFields = Array.from(new Set([...primaryFields, ...secondaryFields]))
        .filter(fieldNumber => fieldNumber !== 1) // Excluir campo 1 (bitmap secundario)
        .sort((a, b) => a - b);

    // Serializar solo los campos activos y en el orden correcto
    allActiveFields.forEach(fieldNumber => {
        const field = sortedFields.find(f => f.number === fieldNumber);
        if (field) {
            const fieldType = getFieldLengthType(field.number);
            if (fieldType === FieldLengthType.FIXED) {
                const length = field.length || getFieldLength(field.number) || field.value.length;
                body += field.value.padStart(length, '0');
            } else if (fieldType === FieldLengthType.LLVAR) {
                const actualLength = field.value.length;
                const lengthHeader = actualLength.toString().padStart(2, '0');
                body += lengthHeader + field.value;
            } else if (fieldType === FieldLengthType.LLLVAR) {
                const actualLength = field.value.length;
                const lengthHeader = actualLength.toString().padStart(3, '0');
                body += lengthHeader + field.value;
            }
        }
    });

    return body;
}

// Función para parsear bitmap primario (campos 1-64)
export function parsePrimaryBitmap(bitmapHex: string): Set<number> {
    const activeFields = new Set<number>();
    
    for (let i = 0; i < bitmapHex.length; i++) {
        const byte = parseInt(bitmapHex[i], 16);
        
        for (let bit = 0; bit < 4; bit++) {
            const bitValue = (byte & (1 << (3 - bit))) ? 1 : 0;
            const fieldNumber = i * 4 + bit + 1;
            
            if (bitValue) {
                activeFields.add(fieldNumber);
            }
        }
    }
    
    return activeFields;
}

// Función para parsear bitmap secundario (campos 65-128)
export function parseSecondaryBitmap(bitmapHex: string): Set<number> {
    const activeFields = new Set<number>();
    
    for (let i = 0; i < bitmapHex.length; i++) {
        const byte = parseInt(bitmapHex[i], 16);
        
        for (let bit = 0; bit < 4; bit++) {
            const bitValue = (byte & (1 << (3 - bit))) ? 1 : 0;
            const fieldNumber = i * 4 + bit + 65; // Mapear a campos 65-128
            
            if (bitValue) {
                activeFields.add(fieldNumber);
            }
        }
    }
    
    return activeFields;
}

// Función para parsear mensaje ISO 8583 en formato ASCII puro
export function parseIso8583Message(messageString: string): Iso8583Message | null {
    try {
        if (messageString.length < 36) { // MTI(4) + PrimaryBitmap(16) + SecondaryBitmap(16)
            return null;
        }
        
        const mti = messageString.substring(0, 4);
        const primaryBitmap = messageString.substring(4, 20);
        const secondaryBitmap = messageString.substring(20, 36);
        
        // Parsear bitmaps
        const primaryFields = parsePrimaryBitmap(primaryBitmap);
        const secondaryFields = parseSecondaryBitmap(secondaryBitmap);
        const allActiveFields = new Set([...primaryFields, ...secondaryFields]);
        
        // Extraer campos
        const fields: Iso8583Field[] = [];
        let currentPos = 36; // Posición después de MTI + bitmaps
        
        // Ordenar campos por número para extraer en orden (excluyendo campo 1 que es el bitmap secundario)
        const sortedFieldNumbers = Array.from(allActiveFields)
            .filter(fieldNumber => fieldNumber !== 1) // Excluir campo 1 (bitmap secundario)
            .sort((a, b) => a - b);
        
        for (const fieldNumber of sortedFieldNumbers) {
            const fieldType = getFieldLengthType(fieldNumber);
            
            if (fieldType === FieldLengthType.FIXED) {
                // Campo de longitud fija
                const fieldLength = getFieldLength(fieldNumber);
                
                if (fieldLength && currentPos + fieldLength <= messageString.length) {
                    const fieldValue = messageString.substring(currentPos, currentPos + fieldLength);
                    
                    fields.push({
                        number: fieldNumber,
                        value: fieldValue,
                        length: fieldLength
                    });
                    currentPos += fieldLength;
                }
            } else if (fieldType === FieldLengthType.LLVAR) {
                // Campo de longitud variable con 2 dígitos de longitud
                if (currentPos + 2 <= messageString.length) {
                    const lengthHeader = messageString.substring(currentPos, currentPos + 2);
                    const actualLength = parseInt(lengthHeader, 10);
                    
                    if (currentPos + 2 + actualLength <= messageString.length) {
                        const fieldValue = messageString.substring(currentPos + 2, currentPos + 2 + actualLength);
                        
                        fields.push({
                            number: fieldNumber,
                            value: fieldValue,
                            length: actualLength
                        });
                        currentPos += 2 + actualLength;
                    }
                }
            } else if (fieldType === FieldLengthType.LLLVAR) {
                // Campo de longitud variable con 3 dígitos de longitud
                if (currentPos + 3 <= messageString.length) {
                    const lengthHeader = messageString.substring(currentPos, currentPos + 3);
                    const actualLength = parseInt(lengthHeader, 10);
                    
                    if (currentPos + 3 + actualLength <= messageString.length) {
                        const fieldValue = messageString.substring(currentPos + 3, currentPos + 3 + actualLength);
                        
                        fields.push({
                            number: fieldNumber,
                            value: fieldValue,
                            length: actualLength
                        });
                        currentPos += 3 + actualLength;
                    }
                }
            }
        }
        
        return {
            mti,
            fields
        };
    } catch (error) {
        console.error('[ERROR] Error parsing ISO 8583 message:', error);
        return null;
    }
}

// Función para agregar header de longitud ASCII
export function addLengthHeader(message: string): string {
    const length = message.length.toString().padStart(4, '0');
    return length + message;
}

// Función para remover header de longitud ASCII
export function removeLengthHeader(messageWithHeader: string): string {
    return messageWithHeader.substring(4);
}

// Función para obtener campo por número
export function getField(message: Iso8583Message, fieldNumber: number): string | undefined {
    const field = message.fields.find(f => f.number === fieldNumber);
    return field?.value;
}

// Función para establecer campo
export function setField(message: Iso8583Message, fieldNumber: number, value: string): void {
    const existingFieldIndex = message.fields.findIndex(f => f.number === fieldNumber);
    const fieldLength = getFieldLength(fieldNumber);
    
    if (existingFieldIndex >= 0) {
        message.fields[existingFieldIndex].value = value;
    } else {
        message.fields.push({
            number: fieldNumber,
            value,
            length: fieldLength
        });
    }
} 