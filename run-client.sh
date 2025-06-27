#!/bin/bash

# EchoTest - Script para ejecutar el cliente
# Uso: ./run-client.sh [opciones]
# Ejemplo: ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5

set -e

echo "🚀 EchoTest - Cliente de Pruebas"
echo "================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Por favor ejecute este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que los archivos compilados existen
if [ ! -f "dist/tcp-client.js" ]; then
    echo "⚠️  Archivos compilados no encontrados. Compilando..."
    npm run build
fi

# Crear directorios si no existen
mkdir -p tmp log

echo "✅ Directorios verificados"
echo "✅ Archivos compilados verificados"
echo ""

# Mostrar ayuda si no hay parámetros
if [ $# -eq 0 ]; then
    echo "📖 Uso: ./run-client.sh [opciones]"
    echo ""
    echo "Opciones disponibles:"
    echo "  --ip <ip>           Dirección IP del servidor (default: 10.245.229.25)"
    echo "  --pt <puerto>       Puerto del servidor (default: 6020)"
    echo "  --it <iteraciones>  Número de iteraciones (default: 1)"
    echo "  --dl <delay>        Delay entre iteraciones en ms (default: 0)"
    echo "  --th <hilos>        Número de hilos para paralelización (default: 1)"
    echo "  --cn <n>            Número de conexiones permanentes (default: 1)"
    echo "  --help              Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 10 --th 2"
    echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --dl 50"
    echo "  ./run-client.sh --ip 192.168.1.100 --pt 8080 --it 1000 --th 8"
    echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 500 --th 10 --cn 3"
    echo ""
    exit 0
fi

# Verificar si se solicita ayuda
if [[ "$*" == *"--help"* ]]; then
    echo "📖 Ayuda de EchoTest Client"
    echo ""
    echo "Opciones disponibles:"
    echo "  --ip <ip>           Dirección IP del servidor (default: 10.245.229.25)"
    echo "  --pt <puerto>       Puerto del servidor (default: 6020)"
    echo "  --it <iteraciones>  Número de iteraciones (default: 1)"
    echo "  --dl <delay>        Delay entre iteraciones en ms (default: 0)"
    echo "  --th <hilos>        Número de hilos para paralelización (default: 1)"
    echo "  --cn <n>            Número de conexiones permanentes (default: 1)"
    echo "  --help              Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 10 --th 2"
    echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5 --dl 50"
    echo "  ./run-client.sh --ip 192.168.1.100 --pt 8080 --it 1000 --th 8"
    echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 500 --th 10 --cn 3"
    echo ""
    exit 0
fi

echo "🎯 Ejecutando cliente con parámetros: $*"
echo "📝 Logs: ./log/echotest_$(date +%Y-%m-%d).log"
echo "📊 Reportes: ./tmp/"
echo ""

# Ejecutar el cliente con los parámetros proporcionados
node dist/tcp-client.js "$@" 