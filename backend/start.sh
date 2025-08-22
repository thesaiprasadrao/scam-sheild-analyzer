#!/bin/bash

# Scam Shield Backend Startup Script

echo "🛡️  Starting Scam Shield Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if tesseract is installed
if ! command -v tesseract &> /dev/null; then
    echo "⚠️  Warning: Tesseract OCR is not installed."
    echo "Please install it using: brew install tesseract (on macOS)"
    echo "The API will still work for text analysis, but image processing will fail."
fi

# Start the server
echo "🚀 Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"

python main.py
