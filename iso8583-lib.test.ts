import { 
    Iso8583Field, 
    Iso8583Message, 
    buildIso8583Message, 
    parseIso8583Message, 
    buildPrimaryBitmap, 
    buildSecondaryBitmap,
    parsePrimaryBitmap,
    parseSecondaryBitmap,
    addLengthHeader,
    removeLengthHeader,
    getField,
    setField,
    ISO8583_FIELD_LENGTHS
} from './iso8583-lib';

describe('ISO8583 Library Deterministic Tests', () => {
    // Campos fijos para pruebas deterministas
    const primaryFields: Iso8583Field[] = [
        { number: 7, value: '1234567890', length: 10 },
        { number: 11, value: '654321', length: 6 },
        { number: 37, value: 'ABCDEF123456', length: 12 }
    ];
    const secondaryFields: Iso8583Field[] = [
        { number: 70, value: '301', length: 3 },
        { number: 102, value: 'SEC102', length: 6 }
    ];
    const allFields: Iso8583Field[] = [...primaryFields, ...secondaryFields];

    test('should generate primary bitmap correctly for fixed fields', () => {
        const bitmap = buildPrimaryBitmap(primaryFields);
        expect(bitmap).toMatch(/^[0-9A-F]{16}$/);
        const parsedFields = parsePrimaryBitmap(bitmap);
        for (const field of primaryFields) {
            expect(parsedFields.has(field.number)).toBe(true);
        }
    });

    test('should generate secondary bitmap correctly for fixed fields', () => {
        const bitmap = buildSecondaryBitmap(secondaryFields);
        expect(bitmap).toMatch(/^[0-9A-F]{16}$/);
        const parsedFields = parseSecondaryBitmap(bitmap);
        for (const field of secondaryFields) {
            expect(parsedFields.has(field.number)).toBe(true);
        }
    });

    test('should handle mixed primary and secondary bitmap fields', () => {
        const bitmapPrimary = buildPrimaryBitmap(allFields);
        const bitmapSecondary = buildSecondaryBitmap(allFields);
        expect(bitmapPrimary).toMatch(/^[0-9A-F]{16}$/);
        expect(bitmapSecondary).toMatch(/^[0-9A-F]{16}$/);
        const parsedPrimary = parsePrimaryBitmap(bitmapPrimary);
        const parsedSecondary = parseSecondaryBitmap(bitmapSecondary);
        for (const field of primaryFields) {
            expect(parsedPrimary.has(field.number)).toBe(true);
        }
        for (const field of secondaryFields) {
            expect(parsedSecondary.has(field.number)).toBe(true);
        }
    });

    test('should build and parse message with primary bitmap fields only', () => {
        const message: Iso8583Message = { mti: '0800', fields: primaryFields };
        const built = buildIso8583Message(message);
        const parsed = parseIso8583Message(built);
        expect(parsed).not.toBeNull();
        expect(parsed!.mti).toBe('0800');
        for (const field of primaryFields) {
            expect(getField(parsed!, field.number)).toBe(field.value);
        }
    });

    test('should build and parse message with secondary bitmap fields only', () => {
        const message: Iso8583Message = { mti: '0810', fields: secondaryFields };
        const built = buildIso8583Message(message);
        const parsed = parseIso8583Message(built);
        expect(parsed).not.toBeNull();
        expect(parsed!.mti).toBe('0810');
        for (const field of secondaryFields) {
            expect(getField(parsed!, field.number)).toBe(field.value);
        }
    });

    test('should build and parse message with mixed bitmap fields', () => {
        const message: Iso8583Message = { mti: '0820', fields: allFields };
        const built = buildIso8583Message(message);
        const parsed = parseIso8583Message(built);
        expect(parsed).not.toBeNull();
        expect(parsed!.mti).toBe('0820');
        for (const field of allFields) {
            expect(getField(parsed!, field.number)).toBe(field.value);
        }
    });

    test('should handle edge cases with defined fields', () => {
        const fields: Iso8583Field[] = [
            { number: 2, value: 'EDGE2A', length: 6 },
            { number: 63, value: 'EDGE63', length: 6 }
        ];
        const message: Iso8583Message = { mti: '0800', fields };
        const built = buildIso8583Message(message);
        const parsed = parseIso8583Message(built);
        expect(parsed).not.toBeNull();
        expect(getField(parsed!, 2)).toBe('EDGE2A');
        expect(getField(parsed!, 63)).toBe('EDGE63');
    });

    test('should handle length header correctly', () => {
        const message = '0800822000000800000004000000000000001234567890654321ABCDEF123456301SEC102';
        const withHeader = addLengthHeader(message);
        const withoutHeader = removeLengthHeader(withHeader);
        expect(withHeader).toMatch(/^\d{4}/);
        expect(withoutHeader).toBe(message);
    });

    test('should get and set fields correctly', () => {
        const message: Iso8583Message = {
            mti: '0800',
            fields: [
                { number: 7, value: '1234567890', length: 10 },
                { number: 11, value: '654321', length: 6 }
            ]
        };
        expect(getField(message, 7)).toBe('1234567890');
        expect(getField(message, 11)).toBe('654321');
        expect(getField(message, 99)).toBeUndefined();
        setField(message, 7, '9999999999');
        expect(getField(message, 7)).toBe('9999999999');
        setField(message, 37, 'ABCDEF123456');
        expect(getField(message, 37)).toBe('ABCDEF123456');
        expect(message.fields.length).toBe(3);
    });
}); 