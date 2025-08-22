"""
Scam Shield Backend API
A FastAPI application for analyzing text and images to detect scam patterns
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import pytesseract
from PIL import Image
import re
import io
from typing import Optional, List, Dict
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Scam Shield API",
    description="API for analyzing messages and images to detect scam patterns",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class RedFlag(BaseModel):
    title: str
    description: str

class AnalysisResponse(BaseModel):
    riskLevel: str
    analyzedText: str
    redFlags: List[RedFlag]
    recommendedActions: List[str]

class ScamAnalyzer:
    """Core analysis engine for detecting scam patterns"""
    
    def __init__(self):
        # Define scam detection patterns and keywords
        self.urgency_patterns = [
            r'account\s+will\s+be\s+blocked',
            r'account\s+will\s+be\s+suspended',
            r'disconnect\s+tonight',
            r'account\s+is\s+suspended',
            r'urgent\s+action\s+required',
            r'warning',
            r'immediate\s+action',
            r'expires\s+today',
            r'last\s+chance',
            r'act\s+now',
            r'click\s+now',
            r'hurry\s+up',
            r'limited\s+time',
            r'offer\s+expires',
            r'only\s+today',
            r'don\s*t\s+miss',
            r'grab\s+now',
            r'your\s+account\s+will\s+be\s+closed'
        ]
        
        self.financial_patterns = [
            r'pay\s+a?\s*fee',
            r'processing\s+charge',
            r'enter\s+your\s+upi\s+pin',
            r'send\s+money',
            r'transfer\s+amount',
            r'payment\s+required',
            r'registration\s+fee',
            r'security\s+deposit',
            r'activation\s+charge',
            r'refund\s+processing\s+fee'
        ]
        
        self.info_request_patterns = [
            r'otp',
            r'password',
            r'update\s+your\s+kyc',
            r'verify\s+your\s+(details|identity|account)',
            r'verify\s+identity',
            r'bank\s+account\s+number',
            r'card\s+details',
            r'cvv',
            r'pin\s+number',
            r'personal\s+information',
            r'aadhar\s+number',
            r'pan\s+card',
            r'confirm\s+your\s+identity',
            r'provide\s+verification'
        ]
        
        self.job_scam_patterns = [
            r'earn\s+₹?\d+\s+daily',
            r'part.?time\s+job',
            r'guaranteed\s+income',
            r'work\s+from\s+home',
            r'easy\s+money',
            r'no\s+investment',
            r'earn\s+without\s+working',
            r'₹?\d+\s+per\s+hour',
            r'make\s+money\s+online'
        ]
        
        # Mobile number patterns - catch various phone number formats
        # Mobile number pattern (10 digits)
        self.mobile_pattern = r'(?:\+91\s?)?[6-9]\d{9}|(?:\d{3}[-.\s]?\d{3}[-.\s]?\d{4})'
        
        # URL pattern for suspicious links
        self.url_pattern = r'https?://[^\s]+|www\.[^\s]+|[^\s]+\.com[^\s]*'
        
        # Common scam indicators
        self.scam_indicators = [
            r'congratulations\s+you\s+have\s+won',
            r'lottery\s+winner',
            r'you\s+are\s+selected',
            r'click\s+here\s+to\s+claim',
            r'government\s+scheme',
            r'pm\s+modi\s+scheme',
            r'corona\s+relief\s+fund',
            r'cashback.*waiting.*for\s+you',
            r'cashback.*rs\s*\d+',
            r'₹\s*\d+.*cashback',
            r'free\s+cashback',
            r'instant\s+cashback',
            r'claim.*cashback',
            r'reward.*waiting',
            r'prize.*waiting',
            r'gift.*waiting',
            r'you\s+have\s+won.*rs',
            r'you\s+have\s+won.*₹'
        ]

    def extract_text_from_image(self, image_file: UploadFile) -> str:
        """Extract text from uploaded image using OCR"""
        try:
            # Read image file
            image_data = image_file.file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Perform OCR
            extracted_text = pytesseract.image_to_string(image)
            return extracted_text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to process image")

    def analyze_text(self, text: str) -> Dict:
        """Analyze text for scam patterns and return risk assessment"""
        if not text or text.strip() == "":
            raise HTTPException(status_code=400, detail="No text to analyze")
        
        text_lower = text.lower()
        detected_flags = []
        risk_score = 0
        
        # Check for urgency and fear tactics
        urgency_matches = []
        for pattern in self.urgency_patterns:
            if re.search(pattern, text_lower):
                urgency_matches.append(pattern)
        
        if urgency_matches:
            detected_flags.append({
                "title": "Urgency & Fear Tactic",
                "description": "The message creates a false sense of panic to rush you into making a mistake."
            })
            risk_score += 3
        
        # Check for financial demands
        financial_matches = []
        for pattern in self.financial_patterns:
            if re.search(pattern, text_lower):
                financial_matches.append(pattern)
        
        if financial_matches:
            detected_flags.append({
                "title": "Financial Demand",
                "description": "The message asks for money, fees, or financial transactions."
            })
            risk_score += 4
        
        # Check for sensitive information requests
        info_matches = []
        for pattern in self.info_request_patterns:
            if re.search(pattern, text_lower):
                info_matches.append(pattern)
        
        if info_matches:
            detected_flags.append({
                "title": "Sensitive Information Request",
                "description": "The message asks for personal or banking information that should never be shared."
            })
            risk_score += 4
        
        # Check for job scam patterns
        job_matches = []
        for pattern in self.job_scam_patterns:
            if re.search(pattern, text_lower):
                job_matches.append(pattern)
        
        if job_matches:
            detected_flags.append({
                "title": "Too-Good-To-Be-True Offer",
                "description": "The message promises unrealistic earnings or easy money, typical of job scams."
            })
            risk_score += 3
        
        # Check for unofficial contact methods
        mobile_matches = re.findall(self.mobile_pattern, text)
        if mobile_matches:
            detected_flags.append({
                "title": "Unofficial Contact Method",
                "description": "The message asks you to call a personal mobile number, not an official, verifiable helpline."
            })
            risk_score += 2
        
        # Check for common scam indicators
        scam_matches = []
        for pattern in self.scam_indicators:
            if re.search(pattern, text_lower):
                scam_matches.append(pattern)
        
        if scam_matches:
            detected_flags.append({
                "title": "Common Scam Language",
                "description": "The message uses language commonly found in scam messages and fake offers."
            })
            risk_score += 3
        
        # Check for suspicious URLs
        url_matches = re.findall(self.url_pattern, text)
        if url_matches:
            detected_flags.append({
                "title": "Suspicious Link",
                "description": "The message contains links that could lead to malicious websites designed to steal your information."
            })
            risk_score += 2
        
        # Determine risk level based on score
        if risk_score >= 5:  # Lowered from 7 to be more sensitive
            risk_level = "HIGH_RISK"
        elif risk_score >= 2:  # Lowered from 3 to catch more medium risk cases
            risk_level = "MEDIUM_RISK"  # Changed from CAUTION to match frontend
        else:
            risk_level = "LOOKS_SAFE"
        
        # Generate recommended actions based on risk level
        recommended_actions = self._get_recommended_actions(risk_level, detected_flags)
        
        return {
            "riskLevel": risk_level,
            "analyzedText": text,
            "redFlags": detected_flags,
            "recommendedActions": recommended_actions,
            "riskScore": risk_score  # Internal use, not in API response
        }

    def _get_recommended_actions(self, risk_level: str, detected_flags: List[Dict]) -> List[str]:
        """Generate recommended actions based on risk level and detected flags"""
        actions = []
        
        if risk_level == "HIGH_RISK":
            actions.extend([
                "Do NOT call the number or click any links.",
                "Delete this message immediately.",
                "Block the sender's number.",
                "Contact the company or service provider through their official website or app to verify."
            ])
            
            # Add specific actions based on detected flags
            flag_titles = [flag["title"] for flag in detected_flags]
            
            if "Financial Demand" in flag_titles or "Sensitive Information Request" in flag_titles:
                actions.append("Never share your banking details, OTP, or passwords with anyone.")
            
            if "Unofficial Contact Method" in flag_titles:
                actions.append("Only contact companies through official customer service numbers from their website.")
            
            if "Too-Good-To-Be-True Offer" in flag_titles:
                actions.append("Remember: if it sounds too good to be true, it probably is.")
        
        elif risk_level == "MEDIUM_RISK":
            actions.extend([
                "Verify the sender's identity through official channels.",
                "Do not share personal information without confirming the request is legitimate.",
                "Check the official website or app for similar communications.",
                "When in doubt, consult with someone you trust."
            ])
        
        else:  # LOOKS_SAFE
            actions.extend([
                "The message appears safe, but always stay vigilant.",
                "Verify important information through official channels when possible.",
                "Never share sensitive information unless you're absolutely certain of the recipient's identity."
            ])
        
        return actions

# Initialize the analyzer
analyzer = ScamAnalyzer()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Scam Shield API is running", "status": "healthy"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_message(
    message_text: Optional[str] = Form(None),
    message_screenshot: Optional[UploadFile] = File(None)
):
    """
    Analyze text or image for scam patterns
    
    Args:
        message_text: Optional text content to analyze
        message_screenshot: Optional image file to extract text from and analyze
    
    Returns:
        AnalysisResponse: Risk assessment with flags and recommendations
    """
    try:
        # Validate input
        if not message_text and not message_screenshot:
            raise HTTPException(
                status_code=400,
                detail="Either message_text or message_screenshot must be provided"
            )
        
        analyzed_text = ""
        
        # Extract text from image if provided
        if message_screenshot:
            if not message_screenshot.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded file must be an image"
                )
            
            extracted_text = analyzer.extract_text_from_image(message_screenshot)
            analyzed_text += extracted_text
        
        # Add provided text if available
        if message_text:
            if analyzed_text:
                analyzed_text += "\n" + message_text
            else:
                analyzed_text = message_text
        
        # Perform analysis
        analysis_result = analyzer.analyze_text(analyzed_text)
        
        # Create response
        response = AnalysisResponse(
            riskLevel=analysis_result["riskLevel"],
            analyzedText=analysis_result["analyzedText"],
            redFlags=[RedFlag(**flag) for flag in analysis_result["redFlags"]],
            recommendedActions=analysis_result["recommendedActions"]
        )
        
        logger.info(f"Analysis completed. Risk Level: {response.riskLevel}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
