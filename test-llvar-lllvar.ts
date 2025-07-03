import {
  buildIso8583Message,
  parseIso8583Message,
  Iso8583Message,
  getFieldLengthType,
  FieldLengthType
} from './iso8583-lib';

function assertEqual(a: any, b: any, msg: string) {
  if (a !== b) throw new Error(`❌ ${msg}: ${a} !== ${b}`);
  console.log(`✅ ${msg}`);
}

console.log('=== Test de campos LLVAR/LLLVAR ===\n');

// Test 1: Campos estándar con campo 2 (PAN) - LLVAR
const testMessage1: Iso8583Message = {
  mti: '0800',
  fields: [
    { number: 2, value: '4111111111111111' }, // LLVAR (16)
    { number: 7, value: '2507021807' },
    { number: 11, value: '142806' },
    { number: 37, value: '005132142806' },
    { number: 39, value: '00' },
    { number: 70, value: '301' }
  ]
};
const built1 = buildIso8583Message(testMessage1);
const parsed1 = parseIso8583Message(built1);
assertEqual(parsed1?.fields.find(f => f.number === 2)?.value, '4111111111111111', 'Campo 2 LLVAR parseado correctamente');
assertEqual(parsed1?.fields.find(f => f.number === 7)?.value, '2507021807', 'Campo 7 parseado correctamente');
assertEqual(parsed1?.fields.find(f => f.number === 11)?.value, '142806', 'Campo 11 parseado correctamente');
assertEqual(parsed1?.fields.find(f => f.number === 37)?.value, '005132142806', 'Campo 37 parseado correctamente');
assertEqual(parsed1?.fields.find(f => f.number === 39)?.value, '00', 'Campo 39 parseado correctamente');
assertEqual(parsed1?.fields.find(f => f.number === 70)?.value, '301', 'Campo 70 parseado correctamente');

// Test 2: Campo 32 (Acquiring institution) - LLVAR
const testMessage2: Iso8583Message = {
  mti: '0800',
  fields: [
    { number: 2, value: '4111111111111111' },
    { number: 7, value: '2507021807' },
    { number: 11, value: '142806' },
    { number: 32, value: '12345678901' }, // LLVAR (11)
    { number: 37, value: '005132142806' },
    { number: 39, value: '00' },
    { number: 70, value: '301' }
  ]
};
const built2 = buildIso8583Message(testMessage2);
const parsed2 = parseIso8583Message(built2);
assertEqual(parsed2?.fields.find(f => f.number === 32)?.value, '12345678901', 'Campo 32 LLVAR parseado correctamente');

// Test 3: Campo 35 (Track 2) - LLVAR
const testMessage3: Iso8583Message = {
  mti: '0800',
  fields: [
    { number: 2, value: '4111111111111111' },
    { number: 7, value: '2507021807' },
    { number: 11, value: '142806' },
    { number: 35, value: '4111111111111111=25021234567890123456' }, // LLVAR (28)
    { number: 37, value: '005132142806' },
    { number: 39, value: '00' },
    { number: 70, value: '301' }
  ]
};
const built3 = buildIso8583Message(testMessage3);
const parsed3 = parseIso8583Message(built3);
assertEqual(parsed3?.fields.find(f => f.number === 35)?.value, '4111111111111111=25021234567890123456', 'Campo 35 LLVAR parseado correctamente');

// Test 4: Campo 36 (Track 3) - LLLVAR
const testMessage4: Iso8583Message = {
  mti: '0800',
  fields: [
    { number: 2, value: '4111111111111111' },
    { number: 7, value: '2507021807' },
    { number: 11, value: '142806' },
    { number: 36, value: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' }, // LLLVAR (100)
    { number: 37, value: '005132142806' },
    { number: 39, value: '00' },
    { number: 70, value: '301' }
  ]
};
const built4 = buildIso8583Message(testMessage4);
const parsed4 = parseIso8583Message(built4);
assertEqual(parsed4?.fields.find(f => f.number === 36)?.value, '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', 'Campo 36 LLLVAR parseado correctamente');

console.log('\nTodos los tests de LLVAR/LLLVAR pasaron correctamente.'); 