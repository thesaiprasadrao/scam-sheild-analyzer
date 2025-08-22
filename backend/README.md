# Scam Shield Backend

A FastAPI-based backend service for analyzing text and images to detect scam patterns.

## Features

- Text analysis for scam detection
- OCR-based image text extraction
- Rule-based scam pattern detection
- Risk level assessment (HIGH_RISK, CAUTION, LOOKS_SAFE)
- Detailed red flags and recommended actions

## Setup Instructions

### Prerequisites

1. **Python 3.8+** installed on your system
2. **Tesseract OCR** installed for image text extraction

#### Installing Tesseract OCR

**On macOS:**
```bash
brew install tesseract
```

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**On Windows:**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Add tesseract to your PATH

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Server

Start the FastAPI server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Main API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### POST /api/analyze

Analyzes text or images for scam patterns.

**Request Format**: `multipart/form-data`

**Parameters**:
- `message_text` (optional): Text string to analyze
- `message_screenshot` (optional): Image file for OCR and analysis

**Response**:
```json
{
  "riskLevel": "HIGH_RISK",
  "analyzedText": "The full text that was analyzed",
  "redFlags": [
    {
      "title": "Urgency & Fear Tactic",
      "description": "The message creates a false sense of panic..."
    }
  ],
  "recommendedActions": [
    "Do NOT call the number or click any links.",
    "Delete this message immediately."
  ]
}
```

### GET /

Health check endpoint.

## Scam Detection Patterns

The backend detects the following scam patterns:

1. **Urgency & Fear Tactics**: "account will be blocked", "urgent action required"
2. **Financial Demands**: "pay a fee", "processing charge", "enter UPI PIN"
3. **Information Requests**: "OTP", "password", "update KYC"
4. **Job Scams**: "earn ₹5000 daily", "part-time job", "guaranteed income"
5. **Unofficial Contact**: 10-digit mobile numbers as helplines
6. **Common Scam Language**: "you have won", "lottery winner", etc.

## Risk Levels

- **HIGH_RISK**: Score ≥ 7 - Likely scam, immediate action required
- **CAUTION**: Score 3-6 - Suspicious, verify before proceeding
- **LOOKS_SAFE**: Score < 3 - Appears legitimate, but stay vigilant

## Development

To contribute or modify the detection patterns:

1. Edit the patterns in the `ScamAnalyzer` class
2. Adjust risk scoring in the `analyze_text` method
3. Test with various scam examples
4. Update the documentation

## Testing

You can test the API using the automatic documentation at `/docs` or with curl:

```bash
# Test with text
curl -X POST "http://localhost:8000/api/analyze" \
  -F "message_text=Your account will be blocked. Pay ₹500 processing fee immediately."

# Test with image
curl -X POST "http://localhost:8000/api/analyze" \
  -F "message_screenshot=@/path/to/screenshot.jpg"
```

## Troubleshooting

1. **Tesseract not found**: Ensure tesseract is installed and in your PATH
2. **Image processing errors**: Check that uploaded files are valid image formats
3. **CORS issues**: The backend allows all origins in development; configure appropriately for production

## Production Deployment

For production deployment:

1. Set specific CORS origins instead of "*"
2. Use environment variables for configuration
3. Add proper logging and monitoring
4. Consider rate limiting
5. Use a production ASGI server like Gunicorn with Uvicorn workers
