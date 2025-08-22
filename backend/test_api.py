#!/usr/bin/env python3
"""
Test script for the enhanced scam detection API
"""

import requests
import json
import time

def test_api(message_text):
    """Test the API with a message"""
    url = "http://localhost:8000/api/analyze"
    data = {"message_text": message_text}
    
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            result = response.json()
            print(f"Message: {message_text}")
            print(f"Risk Level: {result['riskLevel']}")
            print(f"Analysis Method: {result.get('analysis_method', 'N/A')}")
            print(f"Gemini Confidence: {result.get('gemini_confidence', 'N/A')}")
            print(f"Red Flags: {len(result['redFlags'])}")
            for flag in result['redFlags']:
                print(f"  - {flag['title']}: {flag['description']}")
            print(f"Recommended Actions: {len(result['recommendedActions'])}")
            for action in result['recommendedActions']:
                print(f"  - {action}")
            print("-" * 80)
            return True
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server. Is it running on http://localhost:8000?")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Enhanced Scam Detection API with Gemini AI")
    print("=" * 80)
    
    # Wait for server to be ready
    print("Waiting for server to be ready...")
    time.sleep(3)
    
    # Test cases
    test_messages = [
        "Your account is suspended! Urgent action required. Call 9876543210 immediately or pay fee.",
        "Hello, this is a normal message from your friend.",
        "Congratulations! You have won Rs 50,000. Click here to claim your prize now!",
        "Please verify your account by providing your OTP and password.",
        "Earn Rs 5000 daily working from home. No investment required. WhatsApp: 9876543210"
    ]
    
    for message in test_messages:
        success = test_api(message)
        if not success:
            break
        time.sleep(1)  # Brief pause between requests
