#!/bin/bash

# EchoTest - Script para ejecutar el servidor
# Uso: ./run-server.sh

set -e

echo "🚀 EchoTest - Iniciando Servidor"
echo "================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Por favor ejecute este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que los archivos compilados existen
if [ ! -f "dist/tcp-server.js" ]; then
    echo "⚠️  Archivos compilados no encontrados. Compilando..."
    npm run build
fi

# Crear directorios si no existen
mkdir -p tmp log

echo "✅ Directorios verificados"
echo "✅ Archivos compilados verificados"
echo ""
echo "🌐 Iniciando servidor en puerto 6020..."
echo "📝 Logs: ./log/server.log"
echo "📊 Reportes: ./tmp/"
echo ""
echo "Presione Ctrl+C para detener el servidor"
echo ""

# Ejecutar el servidor
node dist/tcp-server.js 