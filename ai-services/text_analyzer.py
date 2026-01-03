import openai
import json
import os
from typing import Dict, List, Any
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextAnalyzer:
    def __init__(self):
        # Load environment variables from env.local file
        self._load_env_vars()
        
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY is required")
        
        logger.info("Initializing OpenAI client with API key")
        # Use environment variable for API key
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = openai.OpenAI(api_key=api_key)
        
    def _load_env_vars(self):
        """Load environment variables from env.local file"""
        env_file = Path(__file__).parent / 'env.local'
        if env_file.exists():
            logger.info(f"Loading environment variables from {env_file}")
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key] = value
                        logger.info(f"Loaded environment variable: {key}")
        else:
            logger.warning(f"env.local file not found at {env_file}")
        
    def analyze_text(self, text_content: str) -> Dict[str, Any]:
        """
        Analyze text content using ChatGPT and return structured feedback
        """
        try:
            # Clean and normalize the text content to handle UTF-8 encoding issues
            text_content = self._clean_text_content(text_content)
            logger.info(f"Starting text analysis for content: {text_content[:50]}...")
            
            # Create a comprehensive prompt for detailed analysis
            prompt = f"""
            As an expert English communication analyst, provide a COMPREHENSIVE analysis of this text with detailed feedback:
            
            Text: "{text_content}"
            
            IMPORTANT: Provide AT LEAST 3 specific strengths, 3 specific improvements, and 3 actionable suggestions. Even if the text is excellent, identify areas for enhancement.
            
            Return JSON format:
            {{
                "overallScore": [RATING_0_TO_1],
                "strengths": [
                    "Specific strength 1 with explanation",
                    "Specific strength 2 with explanation", 
                    "Specific strength 3 with explanation"
                ],
                "improvements": [
                    "Specific area for improvement 1 with details",
                    "Specific area for improvement 2 with details",
                    "Specific area for improvement 3 with details"
                ],
                "suggestions": [
                    "Specific actionable suggestion 1 with implementation",
                    "Specific actionable suggestion 2 with implementation",
                    "Specific actionable suggestion 3 with implementation"
                ],
                "categories": {{
                    "clarity": [RATING_0_TO_1],
                    "engagement": [RATING_0_TO_1],
                    "structure": [RATING_0_TO_1],
                    "impact": [RATING_0_TO_1]
                }},
                "detailedAnalysis": {{
                    "tone": "Detailed assessment of tone and style",
                    "readability": "Detailed assessment of readability and complexity",
                    "structure": "Detailed assessment of organization and flow",
                    "engagement": "Detailed assessment of audience engagement",
                    "actionability": "Detailed assessment of call-to-action and next steps"
                }}
            }}
            
            RATING CRITERIA:
            - Clarity (0-1): How clear and understandable is the message? Consider sentence structure, word choice, and logical flow.
            - Engagement (0-1): How engaging and interesting is the content? Consider hooks, storytelling, and audience connection.
            - Structure (0-1): How well-organized is the text? Consider logical flow, transitions, and overall coherence.
            - Impact (0-1): How effective is the text in achieving its purpose? Consider call-to-action, memorability, and persuasive power.
            
            Provide HONEST, DETAILED feedback. Even excellent texts can be improved. Always provide specific, actionable insights.
            """
            
            logger.info("Calling ChatGPT API...")
            # Call ChatGPT API with optimized settings
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert English communication analyst with years of experience. Your role is to provide COMPREHENSIVE, DETAILED feedback with specific insights. Always provide at least 3 strengths, 3 improvements, and 3 suggestions, even for excellent texts. Focus on actionable, specific feedback that helps writers improve their communication skills."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,  # Balanced temperature for detailed responses
                max_tokens=2000,  # Increased tokens for comprehensive feedback
                timeout=45  # Increased timeout for detailed analysis
            )
            
            logger.info("Received response from ChatGPT API")
            # Extract and parse the response
            analysis_text = response.choices[0].message.content.strip()
            logger.info(f"ChatGPT response: {analysis_text[:200]}...")
            
            # Try to extract JSON from the response
            try:
                # Look for JSON in the response
                start_idx = analysis_text.find('{')
                end_idx = analysis_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != 0:
                    json_str = analysis_text[start_idx:end_idx]
                    analysis_result = json.loads(json_str)
                    logger.info("Successfully parsed JSON response from ChatGPT")
                    
                    # Check if this is real GPT data with detailed content
                    has_detailed_content = (
                        analysis_result.get("strengths") and 
                        len(analysis_result.get("strengths", [])) >= 3 and
                        analysis_result.get("improvements") and 
                        len(analysis_result.get("improvements", [])) >= 3 and
                        analysis_result.get("suggestions") and 
                        len(analysis_result.get("suggestions", [])) >= 3
                    )
                    
                    if has_detailed_content:
                        logger.info("GPT provided comprehensive analysis with detailed feedback")
                        # Only validate score ranges, don't override real data
                        if "overallScore" in analysis_result:
                            analysis_result["overallScore"] = max(0.0, min(1.0, float(analysis_result["overallScore"])))
                        
                        if "categories" in analysis_result:
                            for category, score in analysis_result["categories"].items():
                                analysis_result["categories"][category] = max(0.0, min(1.0, float(score)))
                    else:
                        logger.error("GPT response lacks detailed content - this is an error")
                        raise ValueError(f"GPT API returned incomplete analysis. Expected detailed feedback but got: {analysis_text[:200]}")
                else:
                    logger.error("No JSON found in ChatGPT response - this is an error")
                    raise ValueError(f"GPT API response does not contain valid JSON. Response: {analysis_text[:200]}")
                    
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {analysis_text}")
                raise ValueError(f"Failed to parse GPT API response as JSON: {e}. Response: {analysis_text[:200]}")
            
            # Add source indicator - NO FALLBACK, fail if GPT doesn't work
            if not has_detailed_content:
                logger.error("GPT response lacks detailed content - this is an error, not a fallback case")
                raise ValueError("GPT API returned incomplete analysis. Response may be malformed or API may be experiencing issues.")
            
            analysis_result["_source"] = "gpt"
            
            return {
                "success": True,
                "data": analysis_result
            }
            
        except Exception as e:
            logger.error(f"Error in text analysis: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            # DO NOT return fallback - let the error propagate
            raise
    
    # REMOVED: _create_fallback_analysis - no more fallbacks, errors must be fixed
    
    def _validate_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and ensure all required fields are present in the analysis result
        NO FALLBACKS - if data is incomplete, raise an error
        """
        # Check if this looks like real GPT data (has detailed content)
        has_real_gpt_data = (
            result.get("strengths") and 
            len(result.get("strengths", [])) >= 3 and
            any(len(strength) > 20 for strength in result.get("strengths", [])) and
            result.get("improvements") and 
            len(result.get("improvements", [])) >= 3 and
            result.get("suggestions") and 
            len(result.get("suggestions", [])) >= 3
        )
        
        if not has_real_gpt_data:
            logger.error("GPT data appears incomplete - this is an error, not a fallback case")
            raise ValueError("GPT API returned incomplete analysis data. Expected detailed feedback with at least 3 strengths, 3 improvements, and 3 suggestions. This indicates an API issue that must be fixed.")
        
        # This is real GPT data, validate scores are in range
        if "overallScore" in result:
            result["overallScore"] = max(0.0, min(1.0, float(result["overallScore"])))
        
        if "categories" in result:
            for category, score in result["categories"].items():
                result["categories"][category] = max(0.0, min(1.0, float(score)))
        
        logger.info("Using real GPT analysis data")
        return result

    def _clean_text_content(self, text_content: str) -> str:
        """
        Clean and normalize text content to handle UTF-8 encoding issues
        """
        try:
            # Remove or replace problematic Unicode characters
            import unicodedata
            
            # Normalize Unicode characters
            text_content = unicodedata.normalize('NFKC', text_content)
            
            # Remove surrogate pairs and other problematic characters
            cleaned_text = ''
            for char in text_content:
                try:
                    # Try to encode and decode the character to check if it's valid
                    char.encode('utf-8').decode('utf-8')
                    cleaned_text += char
                except (UnicodeEncodeError, UnicodeDecodeError):
                    # Replace problematic characters with a space or similar character
                    if unicodedata.category(char).startswith('C'):  # Control characters
                        cleaned_text += ' '
                    else:
                        cleaned_text += char
            
            # Remove extra whitespace
            cleaned_text = ' '.join(cleaned_text.split())
            
            logger.info(f"Text cleaned: {len(text_content)} -> {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            logger.warning(f"Error cleaning text content: {e}")
            # Fallback: try to encode/decode with error handling
            try:
                return text_content.encode('utf-8', errors='ignore').decode('utf-8')
            except:
                # Last resort: remove all non-ASCII characters
                return ''.join(char for char in text_content if ord(char) < 128)

# Example usage
if __name__ == "__main__":
    import sys
    import json
    
    try:
        import traceback
        # Read input from stdin with proper UTF-8 handling
        input_data = sys.stdin.buffer.read().decode('utf-8', errors='ignore')
        sys.stderr.write(f"DEBUG: Received input data, length: {len(input_data)}\n")
        sys.stderr.flush()
        
        request = json.loads(input_data)
        sys.stderr.write(f"DEBUG: Parsed input JSON successfully\n")
        sys.stderr.flush()
        
        text_content = request.get('text_content', '')
        analysis_type = request.get('analysis_type', 'text')
        
        sys.stderr.write(f"DEBUG: Text content length: {len(text_content)}, analysis_type: {analysis_type}\n")
        sys.stderr.write(f"DEBUG: OPENAI_API_KEY present: {bool(os.getenv('OPENAI_API_KEY'))}\n")
        sys.stderr.flush()
        
        if not text_content:
            sys.stderr.write("ERROR: No text content provided\n")
            sys.stderr.flush()
            print(json.dumps({
                "success": False,
                "error": "No text content provided"
            }))
            sys.exit(1)
        
        try:
            analyzer = TextAnalyzer()
            sys.stderr.write("DEBUG: TextAnalyzer initialized successfully\n")
            sys.stderr.flush()
        except Exception as init_error:
            sys.stderr.write(f"ERROR: Failed to initialize TextAnalyzer: {init_error}\n")
            sys.stderr.write(f"ERROR: Traceback: {traceback.format_exc()}\n")
            sys.stderr.flush()
            raise
        
        try:
            result = analyzer.analyze_text(text_content)
            sys.stderr.write(f"DEBUG: Analysis completed, result keys: {list(result.keys()) if result else 'None'}\n")
            sys.stderr.flush()
        except Exception as analysis_error:
            sys.stderr.write(f"ERROR: Analysis failed: {analysis_error}\n")
            sys.stderr.write(f"ERROR: Traceback: {traceback.format_exc()}\n")
            sys.stderr.flush()
            raise
        
        # Ensure proper UTF-8 encoding for output
        output_json = json.dumps({
            "success": True,
            "data": result
        }, ensure_ascii=False)
        sys.stderr.write(f"DEBUG: Output JSON length: {len(output_json)}\n")
        sys.stderr.flush()
        print(output_json)
        
    except json.JSONDecodeError as json_error:
        import traceback
        error_msg = f"Invalid JSON input: {json_error}"
        sys.stderr.write(f"ERROR: {error_msg}\n")
        sys.stderr.write(f"ERROR: Input preview: {input_data[:200] if 'input_data' in locals() else 'N/A'}\n")
        sys.stderr.flush()
        print(json.dumps({
            "success": False,
            "error": error_msg
        }, ensure_ascii=False))
        sys.exit(1)
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_traceback = traceback.format_exc()
        sys.stderr.write(f"ERROR: Unhandled exception: {error_msg}\n")
        sys.stderr.write(f"ERROR: Traceback: {error_traceback}\n")
        sys.stderr.flush()
        print(json.dumps({
            "success": False,
            "error": error_msg,
            "traceback": error_traceback if os.getenv('DEBUG', 'false').lower() == 'true' else None
        }, ensure_ascii=False))
        sys.exit(1) 