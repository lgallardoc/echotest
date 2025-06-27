#!/bin/bash

# EchoTest - Script de Instalación Rápida
# Este script instala y configura EchoTest para ejecución en producción

set -e

echo "🚀 EchoTest - Instalación Rápida"
echo "=================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instale Node.js 16+ desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Se requiere Node.js 16+ (versión actual: $(node --version))"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

echo "✅ npm $(npm --version) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p tmp log

# Verificar compilación
if [ ! -f "dist/tcp-server.js" ] || [ ! -f "dist/tcp-client.js" ]; then
    echo "❌ Error: La compilación falló"
    exit 1
fi

echo "✅ Compilación exitosa"

# Crear script de ejecución
cat > run-server.sh << 'EOF'
#!/bin/bash
# Script para ejecutar el servidor EchoTest
echo "🚀 Iniciando servidor EchoTest..."
node dist/tcp-server.js
EOF

cat > run-client.sh << 'EOF'
#!/bin/bash
# Script para ejecutar el cliente EchoTest
# Uso: ./run-client.sh [opciones]
# Ejemplo: ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5

if [ $# -eq 0 ]; then
    echo "Uso: $0 [opciones]"
    echo "Ejemplo: $0 --ip 127.0.0.1 --pt 6020 --it 100 --th 5"
    echo ""
    echo "Opciones:"
    echo "  --ip <ip>           Dirección IP del servidor"
    echo "  --pt <puerto>       Puerto del servidor"
    echo "  --it <iteraciones>  Número de iteraciones"
    echo "  --dl <delay>        Delay entre iteraciones en ms"
    echo "  --th <hilos>        Número de hilos"
    exit 1
fi

echo "🚀 Ejecutando cliente EchoTest..."
node dist/tcp-client.js "$@"
EOF

chmod +x run-server.sh run-client.sh

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Archivos generados:"
echo "  - dist/tcp-server.js     (Servidor compilado)"
echo "  - dist/tcp-client.js     (Cliente compilado)"
echo "  - run-server.sh          (Script para ejecutar servidor)"
echo "  - run-client.sh          (Script para ejecutar cliente)"
echo "  - tmp/                   (Directorio para reportes)"
echo "  - log/                   (Directorio para logs)"
echo ""
echo "🚀 Para ejecutar:"
echo "  # Servidor:"
echo "  ./run-server.sh"
echo "  # o"
echo "  npm start"
echo ""
echo "  # Cliente:"
echo "  ./run-client.sh --ip 127.0.0.1 --pt 6020 --it 100 --th 5"
echo "  # o"
echo "  npm run client -- --ip 127.0.0.1 --pt 6020 --it 100 --th 5"
echo ""
echo "📊 Los reportes se guardarán en tmp/ y los logs en log/"
echo "" 