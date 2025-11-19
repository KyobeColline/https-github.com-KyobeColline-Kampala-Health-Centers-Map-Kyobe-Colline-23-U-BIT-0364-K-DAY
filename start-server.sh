#!/bin/bash

echo "Starting local web server..."
echo ""
echo "Open your browser and go to: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python first, then Node.js
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    npx http-server -p 8000
else
    echo "Error: Neither Python nor Node.js found."
    echo "Please install Python 3 or Node.js to run a local server."
    exit 1
fi

