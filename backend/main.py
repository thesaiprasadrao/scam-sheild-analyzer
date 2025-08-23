"""
Scam Shield Backend API
A FastAPI application for analyzing text and images to detect scam patterns
Enhanced with Google Gemini AI for advanced scam detection
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import pytesseract
from PIL import Image
import re
import io
import json
import os
from typing import Optional, List, Dict
from pydantic import BaseModel
import logging
from dotenv import load_dotenv
import google.generativeai as genai
# from google.cloud import translate_v2 as translate
# import httpx

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini AI configured successfully")
else:
    logger.warning("Gemini API key not found. Falling back to pattern-based analysis only.")

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
    gemini_confidence: Optional[float] = None
    analysis_method: Optional[str] = "PATTERN_BASED"

class TranslateRequest(BaseModel):
    q: str
    target: str
    source: Optional[str] = None

class TranslateResponse(BaseModel):
    translatedText: str
    detectedSourceLanguage: Optional[str] = None
    targetLanguage: str

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

    def analyze_with_gemini(self, text: str) -> Dict:
        """Use Gemini AI to analyze text for scam patterns"""
        try:
            if not GEMINI_API_KEY:
                logger.warning("Gemini API key not available, using pattern-based analysis")
                return None
            
            model = genai.GenerativeModel(GEMINI_MODEL)
            
            prompt = f"""
            You are an expert cybersecurity analyst specializing in scam detection. Analyze the following message for potential scam indicators.

            Message to analyze: "{text}"

            Please analyze this message and provide a response in JSON format with the following structure:
            {{
                "riskLevel": "HIGH_RISK" | "MEDIUM_RISK" | "LOOKS_SAFE",
                "confidence": 0.0-1.0,
                "redFlags": [
                    {{
                        "title": "Brief category name",
                        "description": "Detailed explanation of why this is suspicious"
                    }}
                ],
                "reasoning": "Detailed explanation of your analysis",
                "patterns_detected": ["list of specific scam patterns found"]
            }}

            Consider these scam indicators:
            1. Urgency and fear tactics (account suspension, immediate action required)
            2. Requests for personal/financial information (OTP, password, bank details)
            3. Unofficial contact methods (personal phone numbers instead of official helplines)
            4. Financial demands (fees, payments, processing charges)
            5. Too-good-to-be-true offers (easy money, guaranteed income)
            6. Suspicious links or URLs
            7. Language patterns common in scams (congratulations, you have won, etc.)
            8. Impersonation of legitimate organizations
            9. Grammar and spelling errors
            10. Inconsistent formatting or unprofessional appearance

            Risk Level Guidelines:
            - HIGH_RISK: Clear scam indicators, immediate danger to user
            - MEDIUM_RISK: Suspicious elements but not definitively a scam
            - LOOKS_SAFE: No significant scam indicators detected

            Respond only with valid JSON.
            """
            
            response = model.generate_content(prompt)
            
            # Parse the JSON response
            try:
                # Clean the response text and extract JSON
                response_text = response.text.strip()
                
                # Remove any markdown code blocks if present
                if response_text.startswith('```json'):
                    response_text = response_text[7:]
                if response_text.startswith('```'):
                    response_text = response_text[3:]
                if response_text.endswith('```'):
                    response_text = response_text[:-3]
                
                response_text = response_text.strip()
                
                gemini_result = json.loads(response_text)
                
                # Validate the response structure
                required_fields = ['riskLevel', 'confidence', 'redFlags', 'reasoning']
                for field in required_fields:
                    if field not in gemini_result:
                        logger.warning(f"Missing field {field} in Gemini response")
                        return None
                
                # Ensure risk level is one of the expected values
                valid_risk_levels = ['HIGH_RISK', 'MEDIUM_RISK', 'LOOKS_SAFE']
                if gemini_result['riskLevel'] not in valid_risk_levels:
                    logger.warning(f"Invalid risk level: {gemini_result['riskLevel']}")
                    return None
                
                logger.info(f"Gemini analysis completed with confidence: {gemini_result.get('confidence', 'N/A')}")
                return gemini_result
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Gemini JSON response: {e}")
                logger.error(f"Raw response: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return None

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
        """Analyze text for scam patterns using Gemini AI and pattern matching"""
        if not text or text.strip() == "":
            raise HTTPException(status_code=400, detail="No text to analyze")
        
        # First, try Gemini AI analysis
        gemini_result = self.analyze_with_gemini(text)
        
        # Also run traditional pattern-based analysis for comparison and fallback
        pattern_result = self._analyze_with_patterns(text)
        
        # Combine results intelligently
        if gemini_result:
            # Use Gemini as primary analysis but enhance with pattern insights
            final_result = self._combine_analyses(gemini_result, pattern_result, text)
        else:
            # Fallback to pattern-based analysis if Gemini fails
            logger.info("Using pattern-based analysis as fallback")
            final_result = pattern_result
        
        return final_result

    def _analyze_with_patterns(self, text: str) -> Dict:
        """Original pattern-based analysis method (renamed from analyze_text)"""
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

    def _combine_analyses(self, gemini_result: Dict, pattern_result: Dict, text: str) -> Dict:
        """Combine Gemini AI analysis with pattern-based analysis for enhanced accuracy"""
        
        # Start with Gemini's risk assessment but validate with patterns
        final_risk_level = gemini_result["riskLevel"]
        final_flags = []
        
        # Convert Gemini red flags to our format
        for flag in gemini_result.get("redFlags", []):
            final_flags.append({
                "title": flag["title"],
                "description": flag["description"]
            })
        
        # Add any additional flags from pattern analysis that Gemini might have missed
        gemini_flag_titles = {flag["title"].lower() for flag in gemini_result.get("redFlags", [])}
        
        for pattern_flag in pattern_result["redFlags"]:
            pattern_title_lower = pattern_flag["title"].lower()
            
            # Check if this type of flag is already covered by Gemini
            if not any(gemini_title in pattern_title_lower or pattern_title_lower in gemini_title 
                      for gemini_title in gemini_flag_titles):
                final_flags.append(pattern_flag)
        
        # Adjust risk level if pattern analysis suggests higher risk
        pattern_risk_level = pattern_result["riskLevel"]
        
        # Risk escalation logic: if either analysis says HIGH_RISK, prioritize safety
        if pattern_risk_level == "HIGH_RISK" and final_risk_level != "HIGH_RISK":
            if pattern_result["riskScore"] >= 5:  # High confidence in pattern detection
                final_risk_level = "HIGH_RISK"
                logger.info("Risk level escalated to HIGH_RISK based on pattern analysis")
        
        # If Gemini says HIGH_RISK but patterns don't strongly support it, add a note
        elif final_risk_level == "HIGH_RISK" and pattern_risk_level == "LOOKS_SAFE":
            if pattern_result["riskScore"] == 0:
                # Add a flag noting the discrepancy
                final_flags.append({
                    "title": "AI-Detected Risk",
                    "description": "Our AI model detected potential risks that may not be immediately obvious. Please review carefully."
                })
        
        # Generate enhanced recommended actions
        recommended_actions = self._get_enhanced_recommended_actions(
            final_risk_level, 
            final_flags, 
            gemini_result.get("reasoning", ""),
            gemini_result.get("confidence", 0.5)
        )
        
        return {
            "riskLevel": final_risk_level,
            "analyzedText": text,
            "redFlags": final_flags,
            "recommendedActions": recommended_actions,
            "gemini_confidence": gemini_result.get("confidence", 0.5),
            "analysis_method": "AI_ENHANCED"
        }

    def _get_enhanced_recommended_actions(self, risk_level: str, detected_flags: List[Dict], 
                                        ai_reasoning: str, confidence: float) -> List[str]:
        """Generate enhanced recommended actions based on AI analysis"""
        actions = []
        
        if risk_level == "HIGH_RISK":
            actions.extend([
                "⚠️ HIGH RISK DETECTED - Do NOT respond to this message",
                "Do not call any phone numbers or click any links in this message",
                "Delete this message immediately and block the sender",
                "If this claims to be from a legitimate company, contact them directly through their official website or app"
            ])
            
            # Add specific actions based on detected flags
            flag_titles = [flag["title"].lower() for flag in detected_flags]
            
            if any("financial" in title or "payment" in title or "money" in title for title in flag_titles):
                actions.append("🔒 Never share banking details, card information, or make payments based on unsolicited messages")
            
            if any("information" in title or "otp" in title or "password" in title for title in flag_titles):
                actions.append("🔐 Never share OTPs, passwords, or personal information via phone or message")
            
            if any("urgency" in title or "fear" in title for title in flag_titles):
                actions.append("⏰ Legitimate companies rarely create false urgency - take time to verify")
            
            if confidence < 0.7:
                actions.append("🤖 Our AI detected risks with moderate confidence - please exercise extra caution")
        
        elif risk_level == "MEDIUM_RISK":
            actions.extend([
                "⚡ Exercise caution with this message",
                "Verify the sender's identity through official channels before responding",
                "Do not share personal information without confirming the request is legitimate",
                "Check the official website or app for similar communications"
            ])
            
            if confidence > 0.8:
                actions.append("🤖 Our AI analysis shows high confidence in this assessment")
            
            actions.append("💭 When in doubt, consult with someone you trust or contact the company directly")
        
        else:  # LOOKS_SAFE
            actions.extend([
                "✅ This message appears safe based on our analysis",
                "Continue to stay vigilant with all communications",
                "Verify important information through official channels when possible"
            ])
            
            if confidence < 0.8:
                actions.append("🤖 Our AI analysis suggests this is safe, but please remain cautious")
            
            actions.append("🛡️ Remember: Never share sensitive information unless you're absolutely certain of the recipient's identity")
        
        return actions

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
            recommendedActions=analysis_result["recommendedActions"],
            gemini_confidence=analysis_result.get("gemini_confidence"),
            analysis_method=analysis_result.get("analysis_method", "PATTERN_BASED")
        )
        
        logger.info(f"Analysis completed. Risk Level: {response.riskLevel}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")


@app.post("/api/translate", response_model=TranslateResponse)
async def translate_text(body: TranslateRequest):
    """Translate text using Google Cloud Translation API.

    Supports two auth modes:
    - Service Account via GOOGLE_APPLICATION_CREDENTIALS or ambient creds
    - API key via GOOGLE_TRANSLATE_API_KEY (uses REST call)
    """
    try:
        text = body.q.strip() if body.q else ""
        if not text:
            raise HTTPException(status_code=400, detail="Text (q) is required")

        target = body.target
        if not target:
            raise HTTPException(status_code=400, detail="Target language is required")

        api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY")

        # Prefer service account if available
        use_service_account = bool(os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("GOOGLE_CLOUD_PROJECT"))

        if use_service_account and not api_key:
            # Use Cloud Translation library (v2 for simplicity)
            client = translate.Client()
            result = client.translate(text, target_language=target, source_language=body.source)
            return TranslateResponse(
                translatedText=result.get("translatedText", ""),
                detectedSourceLanguage=result.get("detectedSourceLanguage"),
                targetLanguage=target,
            )
        else:
            # Use REST with API key
            if not api_key:
                raise HTTPException(status_code=500, detail="No Google Translate credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_TRANSLATE_API_KEY")

            url = "https://translation.googleapis.com/language/translate/v2"
            payload = {"q": text, "target": target}
            if body.source:
                payload["source"] = body.source

            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, params={"key": api_key}, json=payload)
                if resp.status_code != 200:
                    logger.error(f"Translate API error {resp.status_code}: {resp.text}")
                    raise HTTPException(status_code=resp.status_code, detail="Translation request failed")
                data = resp.json()
                translations = data.get("data", {}).get("translations", [])
                if not translations:
                    raise HTTPException(status_code=500, detail="No translation returned")
                first = translations[0]
                return TranslateResponse(
                    translatedText=first.get("translatedText", ""),
                    detectedSourceLanguage=first.get("detectedSourceLanguage"),
                    targetLanguage=target,
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected translation error")
        raise HTTPException(status_code=500, detail="Internal server error during translation")

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
