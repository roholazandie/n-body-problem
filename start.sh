#!/bin/bash

echo "🚀 Starting N-Body Problem Simulation..."
echo "📂 Current directory: $(pwd)"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "🐍 Starting local server with Python 3..."
    echo "🌐 Open your browser and go to: http://localhost:8000"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 Starting local server with Python..."
    echo "🌐 Open your browser and go to: http://localhost:8000"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    python -m http.server 8000
# Check if Node.js is available
elif command -v npx &> /dev/null; then
    echo "📦 Starting local server with Node.js..."
    echo "🌐 Server will start automatically in your browser"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    npx serve . -p 8000 -o
# Check if PHP is available
elif command -v php &> /dev/null; then
    echo "🐘 Starting local server with PHP..."
    echo "🌐 Open your browser and go to: http://localhost:8000"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:8000
else
    echo "❌ No suitable server found."
    echo "💡 You can still open index.html directly in your browser:"
    echo "   - Right-click on index.html and select 'Open with browser'"
    echo "   - Or drag and drop index.html into your browser window"
    echo ""
    echo "📋 Or install one of these tools to use this script:"
    echo "   - Python: sudo apt install python3 (Linux) or download from python.org"
    echo "   - Node.js: sudo apt install nodejs npm (Linux) or download from nodejs.org"
    echo "   - PHP: sudo apt install php (Linux) or download from php.net"
fi